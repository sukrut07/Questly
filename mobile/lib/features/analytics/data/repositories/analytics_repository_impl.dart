import 'package:intl/intl.dart';
import 'package:questly/features/analytics/domain/repositories/analytics_repository.dart';
import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';
import 'package:questly/features/focus/domain/models/focus_session.dart';
import 'package:questly/features/focus/domain/repositories/focus_repository.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/widgets/questly_heatmap.dart';

class AnalyticsRepositoryImpl implements AnalyticsRepository {
  final QuestRepository _questRepository;
  final FocusRepository _focusRepository;
  final DashboardRepository _dashboardRepository;

  AnalyticsRepositoryImpl(
    this._questRepository,
    this._focusRepository,
    this._dashboardRepository,
  );

  @override
  Future<AnalyticsData> getSummary() async {
    final quests = await _questRepository.getQuests();
    final completedQuests = quests
        .where((q) => q.status == QuestStatus.completed)
        .toList();
    final focusSessions = await _focusRepository.getRecentSessions();
    final completedSessions = focusSessions
        .where((s) => s.isCompleted)
        .toList();
    final dashboardData = await _dashboardRepository.getDashboardData();

    final totalFocusMinutes = completedSessions.fold<int>(
      0,
      (sum, s) => sum + (s.elapsedSeconds ~/ 60),
    );

    final totalQuests = quests.length;
    final completionRate = totalQuests > 0
        ? (completedQuests.length / totalQuests) * 100
        : 0.0;

    // Build real heatmap data from completed quests and focus sessions
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final heatmapData = <String, HeatmapDayData>{};

    for (int i = 0; i < 112; i++) {
      final date = today.subtract(Duration(days: i));
      final dateKey = DateFormat('yyyy-MM-dd').format(date);
      heatmapData[dateKey] = HeatmapDayData(
        date: date,
        count: 0,
        xpEarned: 0,
        focusMinutes: 0,
      );
    }

    // Populate real completed quests
    for (final q in completedQuests) {
      final d = q.completedAt ?? q.createdAt;
      final key = DateFormat('yyyy-MM-dd').format(d);
      if (heatmapData.containsKey(key)) {
        final existing = heatmapData[key]!;
        heatmapData[key] = HeatmapDayData(
          date: existing.date,
          count: existing.count + 1,
          xpEarned: existing.xpEarned + q.xpReward,
          focusMinutes: existing.focusMinutes,
        );
      }
    }

    // Populate real completed focus sessions
    for (final s in completedSessions) {
      final key = DateFormat('yyyy-MM-dd').format(s.startedAt);
      if (heatmapData.containsKey(key)) {
        final existing = heatmapData[key]!;
        heatmapData[key] = HeatmapDayData(
          date: existing.date,
          count: existing.count,
          xpEarned: existing.xpEarned + s.xpEarned,
          focusMinutes: existing.focusMinutes + (s.elapsedSeconds ~/ 60),
        );
      }
    }

    // Populate checked subtasks checklist XP into today's heatmap cell
    final todayKey = DateFormat('yyyy-MM-dd').format(today);
    if (heatmapData.containsKey(todayKey)) {
      var todaySubtaskXp = 0;
      var todaySubtaskCount = 0;
      for (final q in quests) {
        final doneSubtasks = q.subtasks.where((s) => s.isCompleted).length;
        if (doneSubtasks > 0) {
          todaySubtaskCount += doneSubtasks;
          todaySubtaskXp +=
              doneSubtasks * XpProgressionEngine.calculateSubtaskXp(q.priority);
        }
      }

      if (todaySubtaskXp > 0 || todaySubtaskCount > 0) {
        final existing = heatmapData[todayKey]!;
        heatmapData[todayKey] = HeatmapDayData(
          date: existing.date,
          count: existing.count + todaySubtaskCount,
          xpEarned: existing.xpEarned + todaySubtaskXp,
          focusMinutes: existing.focusMinutes,
        );
      }
    }

    // Calculate real weekly pattern for past 7 days (Monday to Sunday)
    final weeklyPattern = List<double>.filled(7, 0.0);
    // Find Monday of the current week (weekday 1 is Monday in DateTime)
    final monday = today.subtract(Duration(days: today.weekday - 1));
    for (int i = 0; i < 7; i++) {
      final day = monday.add(Duration(days: i));
      final dayKey = DateFormat('yyyy-MM-dd').format(day);
      if (heatmapData.containsKey(dayKey)) {
        weeklyPattern[i] = heatmapData[dayKey]!.count.toDouble();
      }
    }

    return AnalyticsData(
      totalQuestsCompleted: completedQuests.length,
      totalXpEarned: dashboardData.profile.totalXp,
      focusMinutesTotal: totalFocusMinutes,
      currentStreak: dashboardData.streak.currentStreak,
      weeklyCompletionRate: completionRate,
      heatmapData: heatmapData,
      weeklyPattern: weeklyPattern,
    );
  }
}
