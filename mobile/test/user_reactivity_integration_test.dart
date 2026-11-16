import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/analytics/data/repositories/analytics_repository_impl.dart';
import 'package:questly/features/dashboard/data/repositories/mock_dashboard_repository.dart';
import 'package:questly/features/focus/data/repositories/focus_repository_impl.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/features/notebook/data/repositories/notebook_repository_impl.dart';
import 'package:questly/features/notebook/domain/models/note.dart';
import 'package:questly/features/quests/data/repositories/quest_repository_impl.dart';
import 'package:questly/features/roadmaps/data/repositories/roadmap_repository_impl.dart';
import 'package:questly/features/roadmaps/domain/models/roadmap.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';

void main() {
  group('User Reactivity & Live State Feedback Tests', () {
    late QuestRepositoryImpl questRepo;
    late FocusRepositoryImpl focusRepo;
    late MockDashboardRepository dashboardRepo;
    late AnalyticsRepositoryImpl analyticsRepo;
    late RoadmapRepositoryImpl roadmapRepo;
    late NotebookRepositoryImpl notebookRepo;

    setUp(() {
      questRepo = QuestRepositoryImpl();
      focusRepo = FocusRepositoryImpl();
      dashboardRepo = MockDashboardRepository(
        questRepository: questRepo,
        focusRepository: focusRepo,
      );
      analyticsRepo = AnalyticsRepositoryImpl(
        questRepo,
        focusRepo,
        dashboardRepo,
      );
      roadmapRepo = RoadmapRepositoryImpl();
      notebookRepo = NotebookRepositoryImpl();
    });

    test('1. App starts completely clean from 0 for all user data', () async {
      final initialQuests = await questRepo.getQuests();
      final initialRoadmaps = await roadmapRepo.getRoadmaps();
      final initialNotes = await notebookRepo.getNotes();
      final initialDashboard = await dashboardRepo.getDashboardData();
      final initialAnalytics = await analyticsRepo.getSummary();

      expect(initialQuests, isEmpty);
      expect(initialRoadmaps, isEmpty);
      expect(initialNotes, isEmpty);
      expect(initialDashboard.activeQuests, isEmpty);
      expect(initialDashboard.todayCompletedCount, 0);
      expect(initialDashboard.todayTotalCount, 0);
      expect(initialDashboard.profile.totalXp, 0);
      expect(initialDashboard.profile.level, 1);
      expect(initialAnalytics.totalXpEarned, 0);
      expect(initialAnalytics.totalQuestsCompleted, 0);
    });

    test(
      '2. User creates an Urgent task: active quests and workload minutes respond immediately',
      () async {
        final newQuest = Quest(
          id: 'user_task_1',
          title: 'Implement Graph BFS & Shortest Path',
          category: QuestCategory.coding,
          priority: QuestPriority.urgent,
          difficulty: QuestDifficulty.hard,
          estimatedMinutes: 45,
          xpReward: 150,
          createdAt: DateTime.now(),
        );

        await questRepo.createQuest(newQuest);

        final activeQuests = await questRepo.getActiveQuests();
        final dashboardData = await dashboardRepo.getDashboardData();

        expect(activeQuests.length, 1);
        expect(
          activeQuests.first.title,
          'Implement Graph BFS & Shortest Path',
        );
        expect(dashboardData.activeQuests.length, 1);
        expect(dashboardData.todayTotalCount, 1);
        expect(dashboardData.todayCompletedCount, 0);

        // Workload minutes calculation
        final totalPlannedMinutes = dashboardData.activeQuests.fold<int>(
          0,
          (sum, q) => sum + q.estimatedMinutes,
        );
        expect(totalPlannedMinutes, 45);
      },
    );

    test(
      '3. User adds and checks off subtasks: priority checklist XP updates total XP and heatmap',
      () async {
        final quest = await questRepo.createQuest(
          Quest(
            id: 'user_task_urgent',
            title: 'Prepare Distributed Systems Presentation',
            category: QuestCategory.study,
            priority: QuestPriority.urgent,
            difficulty: QuestDifficulty.hard,
            estimatedMinutes: 60,
            xpReward: 120,
            createdAt: DateTime.now(),
          ),
        );

        // Add subtasks
        await questRepo.addSubtask(quest.id, 'Slide 1-5: Raft Consensus');
        await questRepo.addSubtask(quest.id, 'Slide 6-10: Vector Clocks');

        final afterAdd = await questRepo.getQuestById(quest.id);
        expect(afterAdd!.subtasks.length, 2);
        expect(afterAdd.subtasks.every((s) => !s.isCompleted), isTrue);

        // Check off 1st subtask
        final subtask1Id = afterAdd.subtasks[0].id;
        await questRepo.toggleSubtask(quest.id, subtask1Id);

        // Urgent subtask yields 18 XP
        final expectedSubtaskXp = XpProgressionEngine.calculateSubtaskXp(
          QuestPriority.urgent,
        );
        expect(expectedSubtaskXp, 18);

        final dashboardAfterSubtask1 = await dashboardRepo.getDashboardData();
        final analyticsAfterSubtask1 = await analyticsRepo.getSummary();

        expect(dashboardAfterSubtask1.profile.totalXp, 18);
        expect(analyticsAfterSubtask1.totalXpEarned, 18);

        // Check off 2nd subtask (all subtasks complete, which automatically completes the parent quest)
        final subtask2Id = afterAdd.subtasks[1].id;
        await questRepo.toggleSubtask(quest.id, subtask2Id);

        final dashboardAfterSubtask2 = await dashboardRepo.getDashboardData();
        final finalAnalytics = await analyticsRepo.getSummary();

        // 36 (subtasks) + 120 (parent quest) = 156 XP
        expect(dashboardAfterSubtask2.profile.totalXp, 156);
        expect(dashboardAfterSubtask2.activeQuests, isEmpty);
        expect(dashboardAfterSubtask2.todayCompletedCount, 1);
        expect(finalAnalytics.totalQuestsCompleted, 1);
        expect(finalAnalytics.weeklyCompletionRate, 100.0);
      },
    );

    test(
      '4. User solves Sudoku Blitz: Arcade XP grants bonus and updates dashboard state',
      () async {
        final initialData = await dashboardRepo.getDashboardData();
        expect(initialData.profile.totalXp, 0);

        // User solves Sudoku Blitz (+15 XP)
        dashboardRepo.addXp(15);

        final afterWinData = await dashboardRepo.getDashboardData();
        expect(afterWinData.profile.totalXp, 15);
        expect(afterWinData.levelInfo.currentLevelXp, 15);
        expect(afterWinData.levelInfo.currentLevel, 1);
      },
    );

    test(
      '5. User creates and progresses through a custom Roadmap',
      () async {
        final customRoadmap = Roadmap(
          id: 'roadmap_user_custom',
          title: 'Advanced Machine Learning & PyTorch',
          description:
              'From backpropagation to Transformers and Attention Mechanisms.',
          category: 'Artificial Intelligence',
          startDate: DateTime.now(),
          targetCompletionDate: DateTime.now().add(const Duration(days: 60)),
          milestones: [
            const RoadmapMilestone(
              id: 'm_1',
              order: 1,
              title: 'Tensors & Autograd Mechanics',
              description: 'Computational graph, backward pass, gradients.',
              isCompleted: false,
              xpReward: 100,
            ),
            const RoadmapMilestone(
              id: 'm_2',
              order: 2,
              title: 'Attention & Transformer Architecture',
              description: 'Multi-head self-attention, positional encoding.',
              isCompleted: false,
              xpReward: 200,
            ),
          ],
        );

        await roadmapRepo.saveRoadmap(customRoadmap);

        final saved = await roadmapRepo.getRoadmaps();
        expect(saved.length, 1);
        expect(saved.first.progress, 0.0);

        // User marks Milestone 1 complete
        await roadmapRepo.toggleMilestone('roadmap_user_custom', 'm_1');

        final progress1 = await roadmapRepo.getRoadmapById(
          'roadmap_user_custom',
        );
        expect(progress1!.milestones[0].isCompleted, isTrue);
        expect(progress1.progress, 0.5);

        // User marks Milestone 2 complete
        await roadmapRepo.toggleMilestone('roadmap_user_custom', 'm_2');

        final progress2 = await roadmapRepo.getRoadmapById(
          'roadmap_user_custom',
        );
        expect(progress2!.milestones[1].isCompleted, isTrue);
        expect(progress2.progress, 1.0);
      },
    );

    test(
      '6. User captures a knowledge note: search, tags, and pin react immediately',
      () async {
        final note = Note(
          id: 'note_user_1',
          title: 'Dijkstra vs A* Algorithm Comparison',
          content:
              'A* uses admissible heuristics h(n) whereas Dijkstra is uniform cost search.',
          tags: ['dsa', 'algorithms', 'graph'],
          isPinned: false,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        await notebookRepo.saveNote(note);

        final notes = await notebookRepo.getNotes();
        expect(notes.length, 1);
        expect(notes.first.title, 'Dijkstra vs A* Algorithm Comparison');

        // Toggle pin
        await notebookRepo.togglePin(note.id);
        final pinnedNotes = await notebookRepo.getNotes();
        expect(pinnedNotes.first.isPinned, isTrue);

        // Search by query
        final searchResult = await notebookRepo.getNotes(query: 'heuristics');
        expect(searchResult.length, 1);
        expect(searchResult.first.id, note.id);
      },
    );

    test(
      '7. User customizes profile and executes complete Realm Reset to 0',
      () async {
        // Customize profile
        await dashboardRepo.updateProfile(
          displayName: 'Alexander The Great',
          title: 'Grandmaster Strategist',
        );

        final updatedData = await dashboardRepo.getDashboardData();
        expect(updatedData.profile.displayName, 'Alexander The Great');
        expect(updatedData.profile.title, 'Grandmaster Strategist');

        // Add some quests, roadmaps, and notes
        await questRepo.createQuest(
          Quest(
            id: 'q_dummy',
            title: 'Sample Task',
            xpReward: 50,
            createdAt: DateTime.now(),
          ),
        );
        dashboardRepo.addXp(120);

        final beforeReset = await dashboardRepo.getDashboardData();
        expect(beforeReset.activeQuests.length, 1);
        expect(beforeReset.profile.totalXp, 120);

        // Execute user Reset to 0
        await questRepo.clearAll();
        await roadmapRepo.clearAll();
        await notebookRepo.clearAll();
        await focusRepo.clearAll();
        await dashboardRepo.resetToZero();

        final afterReset = await dashboardRepo.getDashboardData();
        final afterResetQuests = await questRepo.getQuests();
        final afterResetRoadmaps = await roadmapRepo.getRoadmaps();
        final afterResetNotes = await notebookRepo.getNotes();

        expect(afterResetQuests, isEmpty);
        expect(afterResetRoadmaps, isEmpty);
        expect(afterResetNotes, isEmpty);
        expect(afterReset.activeQuests, isEmpty);
        expect(afterReset.profile.totalXp, 0);
        expect(afterReset.profile.level, 1);
      },
    );
  });
}
