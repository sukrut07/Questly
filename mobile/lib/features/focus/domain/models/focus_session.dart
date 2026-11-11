enum FocusMode {
  pomodoro('Pomodoro', 25),
  shortBreak('Short Break', 5),
  longBreak('Long Break', 15),
  deepWork('Deep Work', 50),
  flowState('Flow State', 90);

  final String displayName;
  final int defaultMinutes;

  const FocusMode(this.displayName, this.defaultMinutes);

  int get defaultSeconds => defaultMinutes * 60;
}

enum TimerState {
  idle,
  running,
  paused,
  completed,
}

class FocusSession {
  final String id;
  final String? questId;
  final String? questTitle;
  final FocusMode mode;
  final int plannedSeconds;
  final int elapsedSeconds;
  final bool isCompleted;
  final int xpEarned;
  final DateTime startedAt;
  final DateTime? endedAt;
  final String notes;

  const FocusSession({
    required this.id,
    this.questId,
    this.questTitle,
    this.mode = FocusMode.pomodoro,
    this.plannedSeconds = 25 * 60,
    this.elapsedSeconds = 0,
    this.isCompleted = false,
    this.xpEarned = 0,
    required this.startedAt,
    this.endedAt,
    this.notes = '',
  });

  FocusSession copyWith({
    String? id,
    String? questId,
    String? questTitle,
    FocusMode? mode,
    int? plannedSeconds,
    int? elapsedSeconds,
    bool? isCompleted,
    int? xpEarned,
    DateTime? startedAt,
    DateTime? endedAt,
    String? notes,
  }) {
    return FocusSession(
      id: id ?? this.id,
      questId: questId ?? this.questId,
      questTitle: questTitle ?? this.questTitle,
      mode: mode ?? this.mode,
      plannedSeconds: plannedSeconds ?? this.plannedSeconds,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      isCompleted: isCompleted ?? this.isCompleted,
      xpEarned: xpEarned ?? this.xpEarned,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questId': questId,
      'questTitle': questTitle,
      'mode': mode.name,
      'plannedSeconds': plannedSeconds,
      'elapsedSeconds': elapsedSeconds,
      'isCompleted': isCompleted,
      'xpEarned': xpEarned,
      'startedAt': startedAt.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
      'notes': notes,
    };
  }

  factory FocusSession.fromJson(Map<String, dynamic> json) {
    return FocusSession(
      id: json['id'] as String? ?? '',
      questId: json['questId'] as String?,
      questTitle: json['questTitle'] as String?,
      mode: FocusMode.values.firstWhere(
        (m) => m.name == json['mode'],
        orElse: () => FocusMode.pomodoro,
      ),
      plannedSeconds: (json['plannedSeconds'] as num?)?.toInt() ?? 25 * 60,
      elapsedSeconds: (json['elapsedSeconds'] as num?)?.toInt() ?? 0,
      isCompleted: json['isCompleted'] as bool? ?? false,
      xpEarned: (json['xpEarned'] as num?)?.toInt() ?? 0,
      startedAt: json['startedAt'] != null
          ? DateTime.tryParse(json['startedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      endedAt: json['endedAt'] != null ? DateTime.tryParse(json['endedAt'] as String) : null,
      notes: json['notes'] as String? ?? '',
    );
  }
}
