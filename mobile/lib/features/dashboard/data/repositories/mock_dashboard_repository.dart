import 'dart:convert';
import 'dart:math' as math;

import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';
import 'package:questly/features/focus/domain/models/focus_session.dart';
import 'package:questly/features/focus/domain/repositories/focus_repository.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/models/streak_info.dart';
import 'package:questly/shared/models/user_profile.dart';

/// Dynamic, reactive dashboard repository computing real metrics from user input & activity.
class MockDashboardRepository implements DashboardRepository {
  final QuestRepository? questRepository;
  final FocusRepository? focusRepository;
  final LocalStorage? storage;

  static const String _bonusXpKey = 'questly_bonus_xp';
  static const String _profileKey = 'questly_user_profile';
  static const String _streakKey = 'questly_user_streak';

  int _bonusXp = 0;
  UserProfile _profile = UserProfile(
    id: 'user_local',
    displayName: 'Student',
    avatarId: 'avatar_mage',
    level: 1,
    totalXp: 0,
    currentStage: ProgressionStage.explorer,
    visualTheme: 'dark',
    title: 'The Novice Scholar',
    createdAt: DateTime.now(),
  );

  StreakInfo _streak = const StreakInfo(
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    activeDaysCount: 0,
    isProtectedToday: false,
    freezesRemaining: 1,
  );

  MockDashboardRepository({
    this.questRepository,
    this.focusRepository,
    this.storage,
  }) {
    _loadState();
  }

  void _loadState() {
    if (storage != null) {
      _bonusXp = storage!.getInt(_bonusXpKey) ?? 0;

      final profileJson = storage!.getString(_profileKey);
      if (profileJson != null && profileJson.isNotEmpty) {
        try {
          _profile = UserProfile.fromJson(
            jsonDecode(profileJson) as Map<String, dynamic>,
          );
        } catch (_) {}
      }

      final streakJson = storage!.getString(_streakKey);
      if (streakJson != null && streakJson.isNotEmpty) {
        try {
          _streak = StreakInfo.fromJson(
            jsonDecode(streakJson) as Map<String, dynamic>,
          );
        } catch (_) {}
      }
    }
  }

  Future<void> _persistState() async {
    if (storage != null) {
      await storage!.setInt(_bonusXpKey, _bonusXp);
      await storage!.setString(_profileKey, jsonEncode(_profile.toJson()));
      await storage!.setString(_streakKey, jsonEncode(_streak.toJson()));
    }
  }

  @override
  Future<DashboardData> getDashboardData() async {
    final quests = questRepository != null
        ? await questRepository!.getQuests()
        : <Quest>[];

    final completedQuests = quests
        .where((q) => q.status == QuestStatus.completed)
        .toList();
    final activeQuests = quests
        .where((q) => q.status != QuestStatus.completed)
        .toList();

    // 1. Earned Quest XP from completed priority tasks
    final earnedQuestXp = completedQuests.fold<int>(
      0,
      (sum, q) => sum + q.xpReward,
    );

    // 2. Earned Subtask XP from checked checklist items (scaled by priority)
    var earnedSubtaskXp = 0;
    for (final q in quests) {
      final done = q.subtasks.where((s) => s.isCompleted).length;
      if (done > 0) {
        earnedSubtaskXp +=
            done * XpProgressionEngine.calculateSubtaskXp(q.priority);
      }
    }

    // 3. Earned Focus XP
    final focusSessions = focusRepository != null
        ? await focusRepository!.getRecentSessions()
        : <FocusSession>[];
    final completedFocusSessions = focusSessions.where((s) => s.isCompleted);
    final earnedFocusXp = completedFocusSessions.fold<int>(
      0,
      (sum, s) => sum + s.xpEarned,
    );

    // Dynamic Total XP (0 dummy data)
    final totalXp = _bonusXp + earnedQuestXp + earnedSubtaskXp + earnedFocusXp;
    final levelInfo = XpProgressionEngine.calculateLevelInfo(totalXp);

    // Update real profile
    _profile = _profile.copyWith(
      totalXp: totalXp,
      level: levelInfo.currentLevel,
      currentStage: levelInfo.stage,
      title: levelInfo.stage.subtitle,
    );

    // 4. Dynamic Streak Calculation based on real activity
    final now = DateTime.now();
    final todayStr =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    final hasActivityToday = completedQuests.any((q) {
          final d = q.completedAt ?? q.createdAt;
          return d.year == now.year && d.month == now.month && d.day == now.day;
        }) ||
        completedFocusSessions.any((s) {
          final d = s.startedAt;
          return d.year == now.year && d.month == now.month && d.day == now.day;
        }) ||
        _bonusXp > 0;

    if (hasActivityToday) {
      if (_streak.lastActiveDate != todayStr) {
        final newStreak = math.max(1, _streak.currentStreak + 1);
        _streak = _streak.copyWith(
          currentStreak: newStreak,
          longestStreak: math.max(newStreak, _streak.longestStreak),
          lastActiveDate: todayStr,
          activeDaysCount: _streak.activeDaysCount + 1,
        );
      }
    } else if (_streak.currentStreak == 0) {
      // Default initial idle state
      _streak = _streak.copyWith(
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: todayStr,
        activeDaysCount: 1,
      );
    }

    _persistState();

    // 5. Dynamic Daily Productivity Metrics
    final totalSubtasks = quests.expand((q) => q.subtasks).length;
    final completedSubtasksCount = quests
        .expand((q) => q.subtasks)
        .where((s) => s.isCompleted)
        .length;
    final totalCompleted = completedQuests.length + completedSubtasksCount;
    final totalPlanned = quests.length + totalSubtasks;
    final score = totalPlanned == 0
        ? 0
        : ((totalCompleted / totalPlanned) * 100).round();

    return DashboardData(
      profile: _profile,
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
    // Re-evaluates all state reactively
    _loadState();
  }

  @override
  void addXp(int amount) {
    _bonusXp += amount;
    _persistState();
  }

  @override
  Future<void> updateProfile({
    String? displayName,
    String? title,
    String? avatarId,
  }) async {
    _profile = _profile.copyWith(
      displayName: displayName ?? _profile.displayName,
      title: title ?? _profile.title,
      avatarId: avatarId ?? _profile.avatarId,
    );
    await _persistState();
  }

  @override
  Future<void> resetToZero() async {
    _bonusXp = 0;
    _profile = UserProfile(
      id: 'user_local',
      displayName: _profile.displayName,
      avatarId: 'avatar_mage',
      level: 1,
      totalXp: 0,
      currentStage: ProgressionStage.explorer,
      visualTheme: 'dark',
      title: 'The Novice Scholar',
      createdAt: DateTime.now(),
    );
    _streak = const StreakInfo(
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      activeDaysCount: 0,
      isProtectedToday: false,
      freezesRemaining: 1,
    );

    if (storage != null) {
      await storage!.remove(_bonusXpKey);
      await storage!.remove(_profileKey);
      await storage!.remove(_streakKey);
    }
    await _persistState();
  }
}
