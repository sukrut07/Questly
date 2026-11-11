class Note {
  final String id;
  final String title;
  final String content;
  final String? folderId;
  final List<String> tags;
  final bool isPinned;
  final bool isArchived;
  final String? linkedQuestId;
  final String? linkedTaskId;
  final String? linkedRoadmapId;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Note({
    required this.id,
    required this.title,
    this.content = '',
    this.folderId,
    this.tags = const [],
    this.isPinned = false,
    this.isArchived = false,
    this.linkedQuestId,
    this.linkedTaskId,
    this.linkedRoadmapId,
    required this.createdAt,
    required this.updatedAt,
  });

  Note copyWith({
    String? id,
    String? title,
    String? content,
    String? folderId,
    List<String>? tags,
    bool? isPinned,
    bool? isArchived,
    String? linkedQuestId,
    String? linkedTaskId,
    String? linkedRoadmapId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Note(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      folderId: folderId ?? this.folderId,
      tags: tags ?? this.tags,
      isPinned: isPinned ?? this.isPinned,
      isArchived: isArchived ?? this.isArchived,
      linkedQuestId: linkedQuestId ?? this.linkedQuestId,
      linkedTaskId: linkedTaskId ?? this.linkedTaskId,
      linkedRoadmapId: linkedRoadmapId ?? this.linkedRoadmapId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'folderId': folderId,
      'tags': tags,
      'isPinned': isPinned,
      'isArchived': isArchived,
      'linkedQuestId': linkedQuestId,
      'linkedTaskId': linkedTaskId,
      'linkedRoadmapId': linkedRoadmapId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled Note',
      content: json['content'] as String? ?? '',
      folderId: json['folderId'] as String?,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      isPinned: json['isPinned'] as bool? ?? false,
      isArchived: json['isArchived'] as bool? ?? false,
      linkedQuestId: json['linkedQuestId'] as String?,
      linkedTaskId: json['linkedTaskId'] as String?,
      linkedRoadmapId: json['linkedRoadmapId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class NotebookFolder {
  final String id;
  final String name;
  final int colorHex;
  final String iconName;

  const NotebookFolder({
    required this.id,
    required this.name,
    this.colorHex = 0xFFB5FF55,
    this.iconName = 'folder',
  });
}
