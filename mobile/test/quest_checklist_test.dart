import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/dashboard/data/repositories/mock_dashboard_repository.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/features/quests/data/repositories/quest_repository_impl.dart';
import 'package:questly/features/quests/presentation/widgets/quest_checklist_card.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';

void main() {
  group('Quest Checklist & Subcheckbox Hierarchy Tests', () {
    test('XpProgressionEngine calculates priority-based checklist task XP', () {
      final urgentXp = XpProgressionEngine.calculateTaskChecklistXp(
        priority: QuestPriority.urgent,
        difficulty: QuestDifficulty.hard,
        estimatedMinutes: 45,
      );
      final highXp = XpProgressionEngine.calculateTaskChecklistXp(
        priority: QuestPriority.high,
        difficulty: QuestDifficulty.hard,
        estimatedMinutes: 45,
      );
      final mediumXp = XpProgressionEngine.calculateTaskChecklistXp(
        priority: QuestPriority.medium,
        difficulty: QuestDifficulty.hard,
        estimatedMinutes: 45,
      );
      final lowXp = XpProgressionEngine.calculateTaskChecklistXp(
        priority: QuestPriority.low,
        difficulty: QuestDifficulty.hard,
        estimatedMinutes: 45,
      );

      expect(urgentXp > highXp, isTrue);
      expect(highXp > mediumXp, isTrue);
      expect(mediumXp > lowXp, isTrue);
    });

    test('XpProgressionEngine calculates priority-based subtask XP', () {
      expect(XpProgressionEngine.calculateSubtaskXp(QuestPriority.urgent), 18);
      expect(XpProgressionEngine.calculateSubtaskXp(QuestPriority.high), 14);
      expect(XpProgressionEngine.calculateSubtaskXp(QuestPriority.medium), 10);
      expect(XpProgressionEngine.calculateSubtaskXp(QuestPriority.low), 8);
    });

    test(
      'MockDashboardRepository accurately awards and revokes checklist XP',
      () async {
        final questRepo = QuestRepositoryImpl();
        final dashboardRepo = MockDashboardRepository(
          questRepository: questRepo,
        );

        final initialData = await dashboardRepo.getDashboardData();
        final initialXp = initialData.profile.totalXp;

        // Add a high priority quest with subtasks
        final testQuest = Quest(
          id: 'test_p_quest',
          title: 'Urgent Thesis Draft',
          priority: QuestPriority.urgent,
          difficulty: QuestDifficulty.hard,
          xpReward: 65,
          createdAt: DateTime.now(),
          subtasks: const [
            QuestSubtask(
              id: 'sub_1',
              questId: 'test_p_quest',
              title: 'Proof Section A',
              isCompleted: false,
            ),
            QuestSubtask(
              id: 'sub_2',
              questId: 'test_p_quest',
              title: 'Proof Section B',
              isCompleted: false,
            ),
          ],
        );
        await questRepo.createQuest(testQuest);

        // Check 1 subtask
        await questRepo.toggleSubtask('test_p_quest', 'sub_1');
        final dataAfterSubtask = await dashboardRepo.getDashboardData();
        // Urgent subtask awards +18 XP
        expect(dataAfterSubtask.profile.totalXp, initialXp + 18);

        // Complete entire quest
        await questRepo.completeQuest('test_p_quest');
        final dataAfterQuest = await dashboardRepo.getDashboardData();
        // +65 (quest) + 2*18 (both subtasks marked completed)
        expect(dataAfterQuest.profile.totalXp, initialXp + 65 + 36);

        // Uncheck subtask (revocation)
        await questRepo.toggleSubtask('test_p_quest', 'sub_1');
        final dataAfterRevoke = await dashboardRepo.getDashboardData();
        expect(dataAfterRevoke.profile.totalXp, initialXp + 65 + 18);
      },
    );

    test('Quest model accurately calculates subtaskProgress', () {
      final q = Quest(
        id: 'q1',
        title: 'Complete Research Paper',
        xpReward: 50,
        createdAt: DateTime(2026, 11, 17),
        subtasks: const [
          QuestSubtask(
            id: 's1',
            questId: 'q1',
            title: 'Outline',
            isCompleted: true,
          ),
          QuestSubtask(
            id: 's2',
            questId: 'q1',
            title: 'Draft intro',
            isCompleted: false,
          ),
          QuestSubtask(
            id: 's3',
            questId: 'q1',
            title: 'Citations',
            isCompleted: true,
          ),
          QuestSubtask(
            id: 's4',
            questId: 'q1',
            title: 'Proofread',
            isCompleted: false,
          ),
        ],
      );

      expect(q.subtasks.length, 4);
      expect(q.subtaskProgress, 0.5);
    });

    test(
      'QuestRepository addSubtask and toggleSubtask mutate properly',
      () async {
        final repo = QuestRepositoryImpl();
        final quests = await repo.getQuests();
        final targetQuest = quests.first;

        // Add subtask
        final afterAdd = await repo.addSubtask(
          targetQuest.id,
          'New Test Subtask',
        );
        expect(
          afterAdd.subtasks.any((s) => s.title == 'New Test Subtask'),
          isTrue,
        );

        final addedSubtask = afterAdd.subtasks.firstWhere(
          (s) => s.title == 'New Test Subtask',
        );
        expect(addedSubtask.isCompleted, isFalse);

        // Toggle subtask
        final afterToggle = await repo.toggleSubtask(
          targetQuest.id,
          addedSubtask.id,
        );
        final toggled = afterToggle.subtasks.firstWhere(
          (s) => s.id == addedSubtask.id,
        );
        expect(toggled.isCompleted, isTrue);

        // Delete subtask
        final afterDelete = await repo.deleteSubtask(
          targetQuest.id,
          addedSubtask.id,
        );
        expect(
          afterDelete.subtasks.any((s) => s.id == addedSubtask.id),
          isFalse,
        );
      },
    );

    testWidgets(
      'QuestChecklistCard renders parent checkbox and subtasks when expanded',
      (tester) async {
        final now = DateTime.now();
        final quest = Quest(
          id: 'q_test',
          title: 'Math Assignment 4',
          description: 'Linear algebra matrix multiplication problems',
          xpReward: 35,
          createdAt: now,
          subtasks: const [
            QuestSubtask(
              id: 's1',
              questId: 'q_test',
              title: 'Read Chapter 3',
              isCompleted: true,
            ),
            QuestSubtask(
              id: 's2',
              questId: 'q_test',
              title: 'Solve Q1 to Q5',
              isCompleted: false,
            ),
          ],
        );

        await tester.pumpWidget(
          ProviderScope(
            child: MaterialApp(
              home: Scaffold(
                body: SingleChildScrollView(
                  child: QuestChecklistCard(
                    quest: quest,
                    initiallyExpanded: true,
                  ),
                ),
              ),
            ),
          ),
        );

        expect(find.text('MATH ASSIGNMENT 4'), findsOneWidget);
        expect(find.text('+35 XP'), findsOneWidget);
        expect(find.text('1 OF 2 SUBTASKS DONE'), findsOneWidget);
        expect(find.text('50%'), findsOneWidget);

        // Subtasks rendered
        expect(find.text('Read Chapter 3'), findsOneWidget);
        expect(find.text('Solve Q1 to Q5'), findsOneWidget);
        expect(find.text('+ ADD SUBTASK'), findsOneWidget);
      },
    );
  });
}
