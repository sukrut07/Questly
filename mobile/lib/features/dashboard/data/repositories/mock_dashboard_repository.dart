import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/models/streak_info.dart';
import 'package:questly/shared/models/user_profile.dart';

/// Preview/seed repository used in development mode to showcase the Questly 2.0 UI shell.
class MockDashboardRepository implements DashboardRepository {
  final QuestRepository? questRepository;

  MockDashboardRepository({this.questRepository});

  UserProfile _profile = UserProfile(
    id: 'user_dev_01',
    displayName: 'Quest Explorer',
    avatarId: 'avatar_mage',
    level: 3,
    totalXp: 620,
    currentStage: ProgressionStage.builder,
    visualTheme: 'dark',
    title: 'The Consistent Builder',
    createdAt: DateTime.now().subtract(const Duration(days: 14)),
  );

  final StreakInfo _streak = StreakInfo(
    currentStreak: 5,
    longestStreak: 8,
    lastActiveDate: DateTime.now().toIso8601String().split('T').first,
    activeDaysCount: 12,
    isProtectedToday: false,
    freezesRemaining: 1,
  );

  final List<Quest> _quests = [
    Quest(
      id: 'quest_1',
      title: 'Architect Flutter Clean Core',
      description: 'Establish repository pattern, Riverpod dependency injection, and theme system.',
      category: QuestCategory.coding,
      difficulty: QuestDifficulty.epic,
      priority: QuestPriority.urgent,
      estimatedMinutes: 60,
      xpReward: 100,
      status: QuestStatus.inProgress,
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      subtasks: const [
        QuestSubtask(
          id: 'sub_1',
          questId: 'quest_1',
          title: 'Define Domain Models',
          isCompleted: true,
        ),
        QuestSubtask(
          id: 'sub_2',
          questId: 'quest_1',
          title: 'Setup GoRouter Shell Navigation',
          isCompleted: true,
        ),
        QuestSubtask(
          id: 'sub_3',
          questId: 'quest_1',
          title: 'Implement Dashboard UI Components',
          isCompleted: false,
        ),
      ],
    ),
    Quest(
      id: 'quest_2',
      title: 'Deep Focus Morning Ritual',
      description: 'Complete a 45-minute focused sprint without smartphone distractions.',
      category: QuestCategory.study,
      difficulty: QuestDifficulty.medium,
      priority: QuestPriority.high,
      estimatedMinutes: 45,
      xpReward: 40,
      status: QuestStatus.notStarted,
      createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      subtasks: const [
        QuestSubtask(
          id: 'sub_4',
          questId: 'quest_2',
          title: 'Prepare tea & notebook',
          isCompleted: true,
        ),
        QuestSubtask(
          id: 'sub_5',
          questId: 'quest_2',
          title: 'Execute focus block',
          isCompleted: false,
        ),
      ],
    ),
    Quest(
      id: 'quest_3',
      title: 'Physical Mobility & Posture',
      description: 'Perform a 20-minute mobility and ergonomics routine.',
      category: QuestCategory.fitness,
      difficulty: QuestDifficulty.easy,
      priority: QuestPriority.medium,
      estimatedMinutes: 20,
      xpReward: 20,
      status: QuestStatus.notStarted,
      createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
      subtasks: const [],
    ),
  ];

  @override
  Future<DashboardData> getDashboardData() async {
    final quests = questRepository != null
        ? await questRepository!.getQuests()
        : _quests;

    final completedQuests = quests
        .where((q) => q.status == QuestStatus.completed)
        .toList();
    final activeQuests = quests
        .where((q) => q.status != QuestStatus.completed)
        .toList();

    final earnedQuestXp = completedQuests.fold<int>(
      0,
      (sum, q) => sum + q.xpReward,
    );
    final totalXp = _profile.totalXp + earnedQuestXp;
    final levelInfo = XpProgressionEngine.calculateLevelInfo(totalXp);

    final updatedProfile = _profile.copyWith(
      totalXp: totalXp,
      level: levelInfo.currentLevel,
      currentStage: levelInfo.stage,
    );

    final completedSubtasks = quests
        .expand((q) => q.subtasks)
        .where((s) => s.isCompleted)
        .length;
    final totalSubtasks = quests.expand((q) => q.subtasks).length;

    final totalCompleted = completedQuests.length + completedSubtasks;
    final totalPlanned = quests.length + totalSubtasks;
    final score = totalPlanned == 0
        ? 0
        : ((totalCompleted / totalPlanned) * 100).round();

    return DashboardData(
      profile: updatedProfile,
      levelInfo: levelInfo,
      streak: _streak,
      activeQuests: List.unmodifiable(activeQuests),
      todayCompletedCount: totalCompleted,
      todayTotalCount: totalPlanned,
      productivityScore: score,
    );
  }

  @override
  Future<void> refresh() async {
    // Allows immediate re-computation of reactive state
  }

  @override
  void addXp(int amount) {
    _profile = _profile.copyWith(totalXp: _profile.totalXp + amount);
  }
}
