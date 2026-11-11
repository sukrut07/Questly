import 'package:questly/shared/models/level_info.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/models/streak_info.dart';
import 'package:questly/shared/models/user_profile.dart';

class DashboardData {
  final UserProfile profile;
  final LevelInfo levelInfo;
  final StreakInfo streak;
  final List<Quest> activeQuests;
  final int todayCompletedCount;
  final int todayTotalCount;
  final int productivityScore;

  const DashboardData({
    required this.profile,
    required this.levelInfo,
    required this.streak,
    required this.activeQuests,
    required this.todayCompletedCount,
    required this.todayTotalCount,
    required this.productivityScore,
  });

  double get todayProgress =>
      todayTotalCount > 0 ? (todayCompletedCount / todayTotalCount).clamp(0.0, 1.0) : 0.0;
}

abstract class DashboardRepository {
  Future<DashboardData> getDashboardData();
  Future<void> refresh();
}
