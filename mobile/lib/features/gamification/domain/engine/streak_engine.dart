import 'package:questly/core/constants/app_constants.dart';
import 'package:questly/shared/models/streak_info.dart';

class StreakEngine {
  StreakEngine._();

  static StreakInfo updateStreak({
    required StreakInfo currentStreak,
    DateTime? todayDate,
    bool isQualifyingActivity = true,
  }) {
    final today = todayDate ?? DateTime.now();
    final todayStr = '${today.year.toString().padLeft(4, '0')}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

    if (!isQualifyingActivity) {
      return currentStreak;
    }

    if (currentStreak.lastActiveDate.isEmpty) {
      return currentStreak.copyWith(
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: todayStr,
        activeDaysCount: 1,
      );
    }

    final lastDate = DateTime.tryParse(currentStreak.lastActiveDate);
    if (lastDate == null) {
      return currentStreak.copyWith(
        currentStreak: 1,
        longestStreak: currentStreak.longestStreak > 1 ? currentStreak.longestStreak : 1,
        lastActiveDate: todayStr,
        activeDaysCount: currentStreak.activeDaysCount + 1,
      );
    }

    final daysDiff = DateTime(today.year, today.month, today.day)
        .difference(DateTime(lastDate.year, lastDate.month, lastDate.day))
        .inDays;

    if (daysDiff == 0) {
      // Already recorded today
      return currentStreak;
    } else if (daysDiff == 1) {
      // Consecutive streak!
      final newStreak = currentStreak.currentStreak + 1;
      final newLongest = newStreak > currentStreak.longestStreak ? newStreak : currentStreak.longestStreak;
      return currentStreak.copyWith(
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: todayStr,
        activeDaysCount: currentStreak.activeDaysCount + 1,
      );
    } else if (daysDiff == 2) {
      // Missed one day: consume streak freeze if available
      if (currentStreak.freezesRemaining > 0) {
        return currentStreak.copyWith(
          currentStreak: currentStreak.currentStreak,
          freezesRemaining: (currentStreak.freezesRemaining - 1).clamp(0, AppConstants.maxFreezes),
          lastActiveDate: todayStr,
          activeDaysCount: currentStreak.activeDaysCount + 1,
          isProtectedToday: true,
        );
      } else {
        return currentStreak.copyWith(
          currentStreak: 1,
          lastActiveDate: todayStr,
          activeDaysCount: currentStreak.activeDaysCount + 1,
        );
      }
    } else {
      // Streak broken
      return currentStreak.copyWith(
        currentStreak: 1,
        lastActiveDate: todayStr,
        activeDaysCount: currentStreak.activeDaysCount + 1,
      );
    }
  }
}
