import 'package:questly/shared/enums/quest_enums.dart';

class LevelInfo {
  final int currentLevel;
  final int currentLevelXp;
  final int requiredLevelXp;
  final double progressPercent;
  final ProgressionStage stage;
  final String nextLevelUnlock;

  const LevelInfo({
    required this.currentLevel,
    required this.currentLevelXp,
    required this.requiredLevelXp,
    required this.progressPercent,
    required this.stage,
    required this.nextLevelUnlock,
  });

  Map<String, dynamic> toJson() {
    return {
      'currentLevel': currentLevel,
      'currentLevelXp': currentLevelXp,
      'requiredLevelXp': requiredLevelXp,
      'progressPercent': progressPercent,
      'stage': stage.name,
      'nextLevelUnlock': nextLevelUnlock,
    };
  }

  factory LevelInfo.fromJson(Map<String, dynamic> json) {
    return LevelInfo(
      currentLevel: (json['currentLevel'] as num?)?.toInt() ?? 1,
      currentLevelXp: (json['currentLevelXp'] as num?)?.toInt() ?? 0,
      requiredLevelXp: (json['requiredLevelXp'] as num?)?.toInt() ?? 250,
      progressPercent: (json['progressPercent'] as num?)?.toDouble() ?? 0.0,
      stage: ProgressionStage.fromLevel((json['currentLevel'] as num?)?.toInt() ?? 1),
      nextLevelUnlock: json['nextLevelUnlock'] as String? ?? 'Next level rewards',
    );
  }
}
