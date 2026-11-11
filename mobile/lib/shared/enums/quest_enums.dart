import 'package:flutter/material.dart';

enum QuestCategory {
  coding('Coding & Dev', Icons.code_rounded),
  study('Study & Learning', Icons.school_rounded),
  work('Career & Work', Icons.work_rounded),
  fitness('Health & Fitness', Icons.fitness_center_rounded),
  reading('Reading', Icons.menu_book_rounded),
  creativity('Creativity', Icons.palette_rounded),
  personal('Personal Growth', Icons.person_rounded),
  custom('Custom Quest', Icons.stars_rounded);

  final String displayName;
  final IconData icon;
  const QuestCategory(this.displayName, this.icon);

  static QuestCategory fromString(String? name) {
    if (name == null) return QuestCategory.coding;
    return QuestCategory.values.firstWhere(
      (e) =>
          e.name.toLowerCase() == name.toLowerCase() ||
          e.displayName.toLowerCase() == name.toLowerCase(),
      orElse: () => QuestCategory.coding,
    );
  }
}

enum QuestDifficulty {
  easy('Easy', 1.0, 20, Color(0xFF69D8A5)),
  medium('Medium', 1.5, 40, Color(0xFF67B8FF)),
  hard('Hard', 2.2, 70, Color(0xFFFFB86B)),
  epic('Epic', 3.0, 100, Color(0xFF8B7CFF)),
  legendary('Legendary', 4.0, 150, Color(0xFFF5C96A));

  final String displayName;
  final double baseMultiplier;
  final int xpReward;
  final Color badgeColor;

  const QuestDifficulty(
    this.displayName,
    this.baseMultiplier,
    this.xpReward,
    this.badgeColor,
  );

  static QuestDifficulty fromString(String? name) {
    if (name == null) return QuestDifficulty.medium;
    return QuestDifficulty.values.firstWhere(
      (e) =>
          e.name.toLowerCase() == name.toLowerCase() ||
          e.displayName.toLowerCase() == name.toLowerCase(),
      orElse: () => QuestDifficulty.medium,
    );
  }
}

enum QuestPriority {
  low('Low', 1, Color(0xFF6C738E)),
  medium('Medium', 2, Color(0xFF67B8FF)),
  high('High', 3, Color(0xFFFFB86B)),
  urgent('Urgent', 4, Color(0xFFFF6B7D));

  final String displayName;
  final int level;
  final Color color;

  const QuestPriority(this.displayName, this.level, this.color);

  static QuestPriority fromString(String? name) {
    if (name == null) return QuestPriority.medium;
    return QuestPriority.values.firstWhere(
      (e) => e.name.toLowerCase() == name.toLowerCase(),
      orElse: () => QuestPriority.medium,
    );
  }
}

enum QuestStatus {
  notStarted('Not Started'),
  inProgress('In Progress'),
  completed('Completed'),
  archived('Archived');

  final String displayName;
  const QuestStatus(this.displayName);

  static QuestStatus fromString(String? name) {
    if (name == null) return QuestStatus.notStarted;
    return QuestStatus.values.firstWhere(
      (e) => e.name.toLowerCase() == name.toLowerCase(),
      orElse: () => QuestStatus.notStarted,
    );
  }
}

enum ProgressionStage {
  explorer(
    'Explorer',
    'Getting Started',
    1,
    'Clean, minimal workspace. Learning quest fundamentals.',
  ),
  builder(
    'Builder',
    'Consistent Progress',
    3,
    'Rich stats, streak aura, and expanding capabilities.',
  ),
  strategist(
    'Strategist',
    'Advanced Progression',
    6,
    'Skill tree specialization and quest chains.',
  ),
  master(
    'Master',
    'Long-term Mastery',
    10,
    'Prestige achievements, golden UI accents, and pinnacle focus.',
  );

  final String stageName;
  final String subtitle;
  final int minLevel;
  final String description;

  const ProgressionStage(
    this.stageName,
    this.subtitle,
    this.minLevel,
    this.description,
  );

  static ProgressionStage fromLevel(int level) {
    if (level >= 10) return ProgressionStage.master;
    if (level >= 6) return ProgressionStage.strategist;
    if (level >= 3) return ProgressionStage.builder;
    return ProgressionStage.explorer;
  }
}

enum WorldStage {
  forgottenOutpost(
    1,
    'The Forgotten Outpost',
    'A quiet starter camp under twilight skies',
    0,
  ),
  firstSparks(
    2,
    'First Sparks',
    'Glowing campfire and awakening crystal embers',
    2,
  ),
  awakening(
    3,
    'The Awakening',
    'Vibrant flora, stone paths, and rising structures',
    5,
  ),
  growingRealm(
    4,
    'The Growing Realm',
    'Expanded watchtowers and fortified stone pathways',
    10,
  ),
  radiantCitadel(
    5,
    'The Radiant Citadel',
    'Gilded landmarks, floating obelisks, and aurora',
    20,
  ),
  celestialKingdom(
    6,
    'The Celestial Kingdom',
    'Pinnacle realm bathed in stardust',
    30,
  );

  final int stageNumber;
  final String title;
  final String subtitle;
  final int minStreakDays;

  const WorldStage(
    this.stageNumber,
    this.title,
    this.subtitle,
    this.minStreakDays,
  );

  static WorldStage fromStreak(int streakDays) {
    if (streakDays >= 30) return WorldStage.celestialKingdom;
    if (streakDays >= 20) return WorldStage.radiantCitadel;
    if (streakDays >= 10) return WorldStage.growingRealm;
    if (streakDays >= 5) return WorldStage.awakening;
    if (streakDays >= 2) return WorldStage.firstSparks;
    return WorldStage.forgottenOutpost;
  }
}

enum WorldPresentationMode {
  flourishing(
    'Flourishing',
    'Active today! Your realm radiates maximum magical energy and light.',
  ),
  stable(
    'Stable',
    'Recent activity maintained. Your structures remain steady and clear.',
  ),
  resting(
    'Resting',
    'World at rest. Complete any quest or focus session to awaken radiance!',
  );

  final String displayName;
  final String recoveryTip;

  const WorldPresentationMode(this.displayName, this.recoveryTip);
}
