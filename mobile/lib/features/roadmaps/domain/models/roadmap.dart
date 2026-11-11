class RoadmapMilestone {
  final String id;
  final int order;
  final String title;
  final String description;
  final bool isCompleted;
  final int xpReward;
  final DateTime? deadline;
  final List<String> subtasks;
  final String? linkedQuestId;
  final String? linkedNoteId;

  const RoadmapMilestone({
    required this.id,
    required this.order,
    required this.title,
    required this.description,
    this.isCompleted = false,
    this.xpReward = 50,
    this.deadline,
    this.subtasks = const [],
    this.linkedQuestId,
    this.linkedNoteId,
  });

  RoadmapMilestone copyWith({
    String? id,
    int? order,
    String? title,
    String? description,
    bool? isCompleted,
    int? xpReward,
    DateTime? deadline,
    List<String>? subtasks,
    String? linkedQuestId,
    String? linkedNoteId,
  }) {
    return RoadmapMilestone(
      id: id ?? this.id,
      order: order ?? this.order,
      title: title ?? this.title,
      description: description ?? this.description,
      isCompleted: isCompleted ?? this.isCompleted,
      xpReward: xpReward ?? this.xpReward,
      deadline: deadline ?? this.deadline,
      subtasks: subtasks ?? this.subtasks,
      linkedQuestId: linkedQuestId ?? this.linkedQuestId,
      linkedNoteId: linkedNoteId ?? this.linkedNoteId,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order': order,
      'title': title,
      'description': description,
      'isCompleted': isCompleted,
      'xpReward': xpReward,
      'deadline': deadline?.toIso8601String(),
      'subtasks': subtasks,
      'linkedQuestId': linkedQuestId,
      'linkedNoteId': linkedNoteId,
    };
  }

  factory RoadmapMilestone.fromJson(Map<String, dynamic> json) {
    return RoadmapMilestone(
      id: json['id'] as String? ?? '',
      order: (json['order'] as num?)?.toInt() ?? 1,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      isCompleted: json['isCompleted'] as bool? ?? false,
      xpReward: (json['xpReward'] as num?)?.toInt() ?? 50,
      deadline: json['deadline'] != null ? DateTime.tryParse(json['deadline'] as String) : null,
      subtasks: (json['subtasks'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      linkedQuestId: json['linkedQuestId'] as String?,
      linkedNoteId: json['linkedNoteId'] as String?,
    );
  }
}

class Roadmap {
  final String id;
  final String title;
  final String description;
  final String category;
  final DateTime startDate;
  final DateTime targetCompletionDate;
  final List<RoadmapMilestone> milestones;
  final bool isArchived;

  const Roadmap({
    required this.id,
    required this.title,
    required this.description,
    this.category = 'Engineering',
    required this.startDate,
    required this.targetCompletionDate,
    this.milestones = const [],
    this.isArchived = false,
  });

  double get progress {
    if (milestones.isEmpty) return 0.0;
    final done = milestones.where((m) => m.isCompleted).length;
    return (done / milestones.length).clamp(0.0, 1.0);
  }

  int get completedMilestonesCount => milestones.where((m) => m.isCompleted).length;

  int get totalXpReward => milestones.fold(0, (sum, m) => sum + m.xpReward);

  Roadmap copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    DateTime? startDate,
    DateTime? targetCompletionDate,
    List<RoadmapMilestone>? milestones,
    bool? isArchived,
  }) {
    return Roadmap(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      startDate: startDate ?? this.startDate,
      targetCompletionDate: targetCompletionDate ?? this.targetCompletionDate,
      milestones: milestones ?? this.milestones,
      isArchived: isArchived ?? this.isArchived,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'startDate': startDate.toIso8601String(),
      'targetCompletionDate': targetCompletionDate.toIso8601String(),
      'milestones': milestones.map((m) => m.toJson()).toList(),
      'isArchived': isArchived,
    };
  }

  factory Roadmap.fromJson(Map<String, dynamic> json) {
    return Roadmap(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled Roadmap',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'General',
      startDate: json['startDate'] != null
          ? DateTime.tryParse(json['startDate'] as String) ?? DateTime.now()
          : DateTime.now(),
      targetCompletionDate: json['targetCompletionDate'] != null
          ? DateTime.tryParse(json['targetCompletionDate'] as String) ??
              DateTime.now().add(const Duration(days: 90))
          : DateTime.now().add(const Duration(days: 90)),
      milestones: (json['milestones'] as List<dynamic>?)
              ?.map((m) => RoadmapMilestone.fromJson(m as Map<String, dynamic>))
              .toList() ??
          const [],
      isArchived: json['isArchived'] as bool? ?? false,
    );
  }
}
