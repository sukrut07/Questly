class AnalyticsData {
  final int totalQuestsCompleted;
  final int totalXpEarned;
  final int focusMinutesTotal;
  final int currentStreak;
  final double weeklyCompletionRate;

  const AnalyticsData({
    required this.totalQuestsCompleted,
    required this.totalXpEarned,
    required this.focusMinutesTotal,
    required this.currentStreak,
    required this.weeklyCompletionRate,
  });
}

abstract class AnalyticsRepository {
  Future<AnalyticsData> getSummary();
}

