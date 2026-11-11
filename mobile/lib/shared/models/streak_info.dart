import 'package:questly/shared/enums/quest_enums.dart';

class StreakInfo {
  final int currentStreak;
  final int longestStreak;
  final String lastActiveDate;
  final int activeDaysCount;
  final bool isProtectedToday;
  final int freezesRemaining;

  const StreakInfo({
    this.currentStreak = 1,
    this.longestStreak = 1,
    this.lastActiveDate = '',
    this.activeDaysCount = 1,
    this.isProtectedToday = false,
    this.freezesRemaining = 1,
  });

  WorldStage get worldStage => WorldStage.fromStreak(currentStreak);

  WorldPresentationMode get presentationMode {
    if (lastActiveDate.isEmpty) return WorldPresentationMode.resting;
    try {
      final last = DateTime.parse(lastActiveDate);
      final now = DateTime.now();
      final diff = DateTime(
        now.year,
        now.month,
        now.day,
      ).difference(DateTime(last.year, last.month, last.day)).inDays;
      if (diff == 0) return WorldPresentationMode.flourishing;
      if (diff <= 1) return WorldPresentationMode.stable;
      return WorldPresentationMode.resting;
    } catch (_) {
      return WorldPresentationMode.stable;
    }
  }

  StreakInfo copyWith({
    int? currentStreak,
    int? longestStreak,
    String? lastActiveDate,
    int? activeDaysCount,
    bool? isProtectedToday,
    int? freezesRemaining,
  }) {
    return StreakInfo(
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      lastActiveDate: lastActiveDate ?? this.lastActiveDate,
      activeDaysCount: activeDaysCount ?? this.activeDaysCount,
      isProtectedToday: isProtectedToday ?? this.isProtectedToday,
      freezesRemaining: freezesRemaining ?? this.freezesRemaining,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'lastActiveDate': lastActiveDate,
      'activeDaysCount': activeDaysCount,
      'isProtectedToday': isProtectedToday,
      'freezesRemaining': freezesRemaining,
    };
  }

  factory StreakInfo.fromJson(Map<String, dynamic> json) {
    return StreakInfo(
      currentStreak: (json['currentStreak'] as num?)?.toInt() ?? 1,
      longestStreak: (json['longestStreak'] as num?)?.toInt() ?? 1,
      lastActiveDate: json['lastActiveDate'] as String? ?? '',
      activeDaysCount: (json['activeDaysCount'] as num?)?.toInt() ?? 1,
      isProtectedToday: json['isProtectedToday'] as bool? ?? false,
      freezesRemaining: (json['freezesRemaining'] as num?)?.toInt() ?? 1,
    );
  }
}
