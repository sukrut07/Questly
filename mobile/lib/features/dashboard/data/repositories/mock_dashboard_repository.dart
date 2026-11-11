import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/models/streak_info.dart';
import 'package:questly/shared/models/user_profile.dart';

/// Preview/seed repository used in development mode to showcase the Questly 2.0 UI shell.
class MockDashboardRepository implements DashboardRepository {
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
    // Simulate brief asynchronous load
    await Future.delayed(const Duration(milliseconds: 150));
    final levelInfo = XpProgressionEngine.calculateLevelInfo(_profile.totalXp);

    final completedTasks = _quests
        .expand((q) => q.subtasks)
        .where((s) => s.isCompleted)
        .length;
    final totalTasks = _quests.expand((q) => q.subtasks).length;

    return DashboardData(
      profile: _profile,
      levelInfo: levelInfo,
      streak: _streak,
      activeQuests: List.unmodifiable(_quests),
      todayCompletedCount: completedTasks,
      todayTotalCount: totalTasks,
      productivityScore: 84,
    );
  }

  @override
  Future<void> refresh() async {
    // In-memory refresh simulation
  }

  void addXp(int amount) {
    _profile = _profile.copyWith(totalXp: _profile.totalXp + amount);
  }
}
