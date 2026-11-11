import 'package:questly/shared/enums/quest_enums.dart';

class QuestSubtask {
  final String id;
  final String questId;
  final String title;
  final bool isCompleted;

  const QuestSubtask({
    required this.id,
    required this.questId,
    required this.title,
    this.isCompleted = false,
  });

  QuestSubtask copyWith({
    String? id,
    String? questId,
    String? title,
    bool? isCompleted,
  }) {
    return QuestSubtask(
      id: id ?? this.id,
      questId: questId ?? this.questId,
      title: title ?? this.title,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questId': questId,
      'title': title,
      'isCompleted': isCompleted,
    };
  }

  factory QuestSubtask.fromJson(Map<String, dynamic> json) {
    return QuestSubtask(
      id: json['id']?.toString() ?? '',
      questId: json['questId']?.toString() ?? '',
      title: json['title'] as String? ?? '',
      isCompleted: json['isCompleted'] as bool? ?? false,
    );
  }
}

class Quest {
  final String id;
  final String title;
  final String description;
  final QuestCategory category;
  final QuestDifficulty difficulty;
  final QuestPriority priority;
  final int estimatedMinutes;
  final int actualMinutes;
  final DateTime? dueDate;
  final QuestStatus status;
  final int xpReward;
  final bool isRecurring;
  final String? recurrenceRule;
  final DateTime createdAt;
  final DateTime? completedAt;
  final List<QuestSubtask> subtasks;

  const Quest({
    required this.id,
    required this.title,
    this.description = '',
    this.category = QuestCategory.coding,
    this.difficulty = QuestDifficulty.medium,
    this.priority = QuestPriority.medium,
    this.estimatedMinutes = 30,
    this.actualMinutes = 0,
    this.dueDate,
    this.status = QuestStatus.notStarted,
    required this.xpReward,
    this.isRecurring = false,
    this.recurrenceRule,
    required this.createdAt,
    this.completedAt,
    this.subtasks = const [],
  });

  bool get isCompleted => status == QuestStatus.completed;

  double get subtaskProgress {
    if (subtasks.isEmpty) return isCompleted ? 1.0 : 0.0;
    final done = subtasks.where((s) => s.isCompleted).length;
    return done / subtasks.length;
  }

  Quest copyWith({
    String? id,
    String? title,
    String? description,
    QuestCategory? category,
    QuestDifficulty? difficulty,
    QuestPriority? priority,
    int? estimatedMinutes,
    int? actualMinutes,
    DateTime? dueDate,
    QuestStatus? status,
    int? xpReward,
    bool? isRecurring,
    String? recurrenceRule,
    DateTime? createdAt,
    DateTime? completedAt,
    List<QuestSubtask>? subtasks,
  }) {
    return Quest(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      priority: priority ?? this.priority,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      actualMinutes: actualMinutes ?? this.actualMinutes,
      dueDate: dueDate ?? this.dueDate,
      status: status ?? this.status,
      xpReward: xpReward ?? this.xpReward,
      isRecurring: isRecurring ?? this.isRecurring,
      recurrenceRule: recurrenceRule ?? this.recurrenceRule,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      subtasks: subtasks ?? this.subtasks,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category.name,
      'difficulty': difficulty.name,
      'priority': priority.name,
      'estimatedMinutes': estimatedMinutes,
      'actualMinutes': actualMinutes,
      'dueDate': dueDate?.toIso8601String(),
      'status': status.name,
      'xpReward': xpReward,
      'isRecurring': isRecurring,
      'recurrenceRule': recurrenceRule,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'subtasks': subtasks.map((s) => s.toJson()).toList(),
    };
  }

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? 'Untitled Quest',
      description: json['description'] as String? ?? '',
      category: QuestCategory.fromString(json['category'] as String?),
      difficulty: QuestDifficulty.fromString(json['difficulty'] as String?),
      priority: QuestPriority.fromString(json['priority'] as String?),
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt() ?? 30,
      actualMinutes: (json['actualMinutes'] as num?)?.toInt() ?? 0,
      dueDate: json['dueDate'] != null
          ? DateTime.tryParse(json['dueDate'] as String)
          : null,
      status: QuestStatus.fromString(json['status'] as String?),
      xpReward: (json['xpReward'] as num?)?.toInt() ?? 40,
      isRecurring: json['isRecurring'] as bool? ?? false,
      recurrenceRule: json['recurrenceRule'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'] as String)
          : null,
      subtasks:
          (json['subtasks'] as List<dynamic>?)
              ?.map((s) => QuestSubtask.fromJson(s as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}
