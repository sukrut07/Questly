import 'package:questly/shared/enums/quest_enums.dart';

class UserProfile {
  final String id;
  final String displayName;
  final String avatarId;
  final int level;
  final int totalXp;
  final ProgressionStage currentStage;
  final String visualTheme;
  final String title;
  final DateTime createdAt;

  const UserProfile({
    this.id = 'user_1',
    this.displayName = 'Quest Explorer',
    this.avatarId = 'avatar_mage',
    this.level = 1,
    this.totalXp = 0,
    this.currentStage = ProgressionStage.explorer,
    this.visualTheme = 'dark',
    this.title = 'The Novice Adventurer',
    required this.createdAt,
  });

  UserProfile copyWith({
    String? id,
    String? displayName,
    String? avatarId,
    int? level,
    int? totalXp,
    ProgressionStage? currentStage,
    String? visualTheme,
    String? title,
    DateTime? createdAt,
  }) {
    return UserProfile(
      id: id ?? this.id,
      displayName: displayName ?? this.displayName,
      avatarId: avatarId ?? this.avatarId,
      level: level ?? this.level,
      totalXp: totalXp ?? this.totalXp,
      currentStage: currentStage ?? this.currentStage,
      visualTheme: visualTheme ?? this.visualTheme,
      title: title ?? this.title,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'displayName': displayName,
      'avatarId': avatarId,
      'level': level,
      'totalXp': totalXp,
      'currentStage': currentStage.name,
      'visualTheme': visualTheme,
      'title': title,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String? ?? 'user_1',
      displayName: json['displayName'] as String? ?? 'Quest Explorer',
      avatarId: json['avatarId'] as String? ?? 'avatar_mage',
      level: (json['level'] as num?)?.toInt() ?? 1,
      totalXp: (json['totalXp'] as num?)?.toInt() ?? 0,
      currentStage: ProgressionStage.fromLevel((json['level'] as num?)?.toInt() ?? 1),
      visualTheme: json['visualTheme'] as String? ?? 'dark',
      title: json['title'] as String? ?? 'The Novice Adventurer',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
