import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/gamification/domain/engine/streak_engine.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/streak_info.dart';

void main() {
  group('XpProgressionEngine Tests', () {
    test('Level 1 requires 0 XP threshold and 250 XP for next level', () {
      expect(XpProgressionEngine.getXpThresholdForLevel(1), 0);
      expect(XpProgressionEngine.getXpRequiredForNextLevel(1), 250);
    });

    test('calculateLevelInfo correctly computes levels and stages', () {
      final lvl1 = XpProgressionEngine.calculateLevelInfo(0);
      expect(lvl1.currentLevel, 1);
      expect(lvl1.stage, ProgressionStage.explorer);

      final lvl2 = XpProgressionEngine.calculateLevelInfo(300);
      expect(lvl2.currentLevel, 2);

      final lvl3 = XpProgressionEngine.calculateLevelInfo(700);
      expect(lvl3.currentLevel, 3);
      expect(lvl3.stage, ProgressionStage.builder);

      final lvl6 = XpProgressionEngine.calculateLevelInfo(2500);
      expect(lvl6.stage, ProgressionStage.strategist);

      final lvl10 = XpProgressionEngine.calculateLevelInfo(7000);
      expect(lvl10.stage, ProgressionStage.master);
    });

    test(
      'calculateQuestXp awards appropriate XP per difficulty and duration',
      () {
        final easyXp = XpProgressionEngine.calculateQuestXp(
          QuestDifficulty.easy,
          30,
        );
        expect(easyXp, 25); // base 20 + 5

        final epicXp = XpProgressionEngine.calculateQuestXp(
          QuestDifficulty.epic,
          60,
        );
        expect(epicXp, 110); // base 100 + 10
      },
    );
  });

  group('StreakEngine Tests', () {
    test('Initial streak starts at 1 on first qualifying day', () {
      const initial = StreakInfo(currentStreak: 0, lastActiveDate: '');
      final updated = StreakEngine.updateStreak(
        currentStreak: initial,
        todayDate: DateTime(2026, 11, 10),
      );
      expect(updated.currentStreak, 1);
      expect(updated.longestStreak, 1);
      expect(updated.lastActiveDate, '2026-11-10');
    });

    test('Consecutive day increments streak', () {
      const current = StreakInfo(
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: '2026-11-09',
        activeDaysCount: 3,
      );
      final updated = StreakEngine.updateStreak(
        currentStreak: current,
        todayDate: DateTime(2026, 11, 10),
      );
      expect(updated.currentStreak, 4);
      expect(updated.longestStreak, 4);
      expect(updated.activeDaysCount, 4);
    });

    test(
      'Missed 1 day with streak freeze consumes freeze and preserves streak',
      () {
        const current = StreakInfo(
          currentStreak: 7,
          longestStreak: 7,
          lastActiveDate: '2026-11-08',
          freezesRemaining: 1,
        );
        final updated = StreakEngine.updateStreak(
          currentStreak: current,
          todayDate: DateTime(2026, 11, 10), // 2 days gap
        );
        expect(updated.currentStreak, 7);
        expect(updated.freezesRemaining, 0);
        expect(updated.isProtectedToday, true);
      },
    );
  });
}
