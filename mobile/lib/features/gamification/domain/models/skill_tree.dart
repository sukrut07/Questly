import 'package:flutter/material.dart';

enum SkillBranch {
  focus(
    'Focus Mastery',
    'Deep work capacity and distraction resistance',
    Icons.self_improvement,
  ),
  consistency(
    'Consistency',
    'Daily habits, streak resilience, and schedule discipline',
    Icons.trending_up,
  ),
  planning(
    'Strategic Planning',
    'Quest estimation, backlog hygiene, and objective chains',
    Icons.architecture,
  ),
  learning(
    'Learning & Knowledge',
    'Study quests, retention, and exploratory skills',
    Icons.psychology,
  ),
  creativity(
    'Creative Spark',
    'Ideation, creative flow, and novel problem solving',
    Icons.auto_awesome,
  ),
  execution(
    'Swift Execution',
    'Rapid completion, task momentum, and sprint stamina',
    Icons.bolt,
  );

  final String displayName;
  final String description;
  final IconData icon;

  const SkillBranch(this.displayName, this.description, this.icon);
}

class SkillNode {
  final String id;
  final SkillBranch branch;
  final String name;
  final String description;
  final int requiredLevel;
  final int currentProgress;
  final int maxProgress;
  final bool isUnlocked;
  final String? cosmeticReward;

  const SkillNode({
    required this.id,
    required this.branch,
    required this.name,
    required this.description,
    required this.requiredLevel,
    this.currentProgress = 0,
    this.maxProgress = 100,
    this.isUnlocked = false,
    this.cosmeticReward,
  });

  double get progressPercent {
    if (maxProgress <= 0) return 1.0;
    return (currentProgress / maxProgress).clamp(0.0, 1.0);
  }

  SkillNode copyWith({
    String? id,
    SkillBranch? branch,
    String? name,
    String? description,
    int? requiredLevel,
    int? currentProgress,
    int? maxProgress,
    bool? isUnlocked,
    String? cosmeticReward,
  }) {
    return SkillNode(
      id: id ?? this.id,
      branch: branch ?? this.branch,
      name: name ?? this.name,
      description: description ?? this.description,
      requiredLevel: requiredLevel ?? this.requiredLevel,
      currentProgress: currentProgress ?? this.currentProgress,
      maxProgress: maxProgress ?? this.maxProgress,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      cosmeticReward: cosmeticReward ?? this.cosmeticReward,
    );
  }
}

