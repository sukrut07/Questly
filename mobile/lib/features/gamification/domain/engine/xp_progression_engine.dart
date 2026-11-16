import 'package:questly/core/constants/app_constants.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/level_info.dart';

class XpProgressionEngine {
  XpProgressionEngine._();

  /// Total XP needed to reach [level].
  /// Baseline: 250 + (level - 1) * 100 per step.
  static int getXpThresholdForLevel(int level) {
    if (level <= 1) return 0;
    var total = 0;
    for (var i = 1; i < level; i++) {
      total +=
          AppConstants.baselineLevelXp + (i - 1) * AppConstants.levelXpStep;
    }
    return total;
  }

  static int getXpRequiredForNextLevel(int level) {
    return AppConstants.baselineLevelXp +
        (level - 1) * AppConstants.levelXpStep;
  }

  static LevelInfo calculateLevelInfo(int totalXp) {
    var level = 1;
    while (totalXp >= getXpThresholdForLevel(level + 1)) {
      level++;
    }

    final currentLevelBase = getXpThresholdForLevel(level);
    final nextLevelBase = getXpThresholdForLevel(level + 1);
    final required = nextLevelBase - currentLevelBase;
    final currentLevelXp = (totalXp - currentLevelBase).clamp(0, required);
    final progress = required > 0 ? currentLevelXp / required : 1.0;

    final stage = ProgressionStage.fromLevel(level);
    final nextUnlock = getNextUnlockPreview(level);

    return LevelInfo(
      currentLevel: level,
      currentLevelXp: currentLevelXp,
      requiredLevelXp: required,
      progressPercent: progress.clamp(0.0, 1.0),
      stage: stage,
      nextLevelUnlock: nextUnlock,
    );
  }

  static String getNextUnlockPreview(int level) {
    switch (level) {
      case 1:
        return 'Level 2: Custom Quest Categories & Deep Work Badges';
      case 2:
        return 'Level 3: Builder Stage & Arcane Violet Theme Unlock';
      case 3:
        return 'Level 4: Advanced Streak Resiliency & Distraction Tracking';
      case 4:
        return 'Level 5: Quest Chains & Skill Tree Progression Nodes';
      case 5:
        return 'Level 6: Strategist Stage & Quest Emerald Visuals';
      case 6:
        return 'Level 7: Cognitive Skill Mastery & Sprint Multipliers';
      case 7:
        return 'Level 8: High Precision Productivity Analytics';
      case 8:
        return 'Level 9: Grand Campaign Multi-tier Objectives';
      case 9:
        return 'Level 10: Master Stage & Pinnacle Legend Gold Aura';
      default:
        return 'Max Level: Prestige Legacy & Master Showcase';
    }
  }

  static int calculateQuestXp(
    QuestDifficulty difficulty,
    int estimatedMinutes,
  ) {
    final base = difficulty.xpReward;
    final bonus = ((estimatedMinutes / 30).floor().clamp(0, 2)) * 5;
    return (base + bonus).clamp(10, 150);
  }

  /// Calculates Priority-scaled Checklist XP for completing a main task on priority.
  static int calculateTaskChecklistXp({
    required QuestPriority priority,
    required QuestDifficulty difficulty,
    int estimatedMinutes = 30,
  }) {
    final base = calculateQuestXp(difficulty, estimatedMinutes);
    switch (priority) {
      case QuestPriority.urgent:
        return ((base * 1.5).round() + 20).clamp(25, 200);
      case QuestPriority.high:
        return ((base * 1.25).round() + 10).clamp(20, 180);
      case QuestPriority.medium:
        return base;
      case QuestPriority.low:
        return (base * 0.8).round().clamp(10, 120);
    }
  }

  /// Calculates Priority-scaled Checklist XP for checking off an individual subtask.
  static int calculateSubtaskXp(QuestPriority priority) {
    switch (priority) {
      case QuestPriority.urgent:
        return 18;
      case QuestPriority.high:
        return 14;
      case QuestPriority.medium:
        return 10;
      case QuestPriority.low:
        return 8;
    }
  }

  static int calculateFocusXp(int elapsedMinutes) {
    if (elapsedMinutes <= 0) return 0;
    return elapsedMinutes.clamp(1, AppConstants.maxSessionFocusXp);
  }
}
