import 'package:questly/shared/models/level_info.dart';
import 'package:questly/shared/models/streak_info.dart';
import 'package:questly/shared/models/user_profile.dart';

abstract class GamificationRepository {
  Future<UserProfile> getUserProfile();
  Future<StreakInfo> getStreakInfo();
  Future<LevelInfo> getLevelInfo();
  Future<UserProfile> awardXp(int amount, String reason);
  Future<StreakInfo> recordActivity();
}

