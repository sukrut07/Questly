import 'package:questly/shared/widgets/questly_heatmap.dart';

class AnalyticsData {
  final int totalQuestsCompleted;
  final int totalXpEarned;
  final int focusMinutesTotal;
  final int currentStreak;
  final double weeklyCompletionRate;
  final Map<String, HeatmapDayData> heatmapData;
  final List<double> weeklyPattern; // 7 values for Mon to Sun

  const AnalyticsData({
    required this.totalQuestsCompleted,
    required this.totalXpEarned,
    required this.focusMinutesTotal,
    required this.currentStreak,
    required this.weeklyCompletionRate,
    this.heatmapData = const {},
    this.weeklyPattern = const [0, 0, 0, 0, 0, 0, 0],
  });
}

abstract class AnalyticsRepository {
  Future<AnalyticsData> getSummary();
}
