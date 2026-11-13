enum DashboardWidgetType {
  focusSquad,
  todaysChallenge,
  progression,
  quickActions,
  dailyProductivity,
  activityHeatmap,
  activeQuests,
  quickNotes,
  mindSnapArena,
}

enum DashboardWidgetSize { small, medium, large }

class DashboardWidgetConfig {
  final String id;
  final DashboardWidgetType type;
  final String title;
  final bool isVisible;
  final int order;
  final DashboardWidgetSize size;

  const DashboardWidgetConfig({
    required this.id,
    required this.type,
    required this.title,
    this.isVisible = true,
    required this.order,
    this.size = DashboardWidgetSize.medium,
  });

  DashboardWidgetConfig copyWith({
    bool? isVisible,
    int? order,
    DashboardWidgetSize? size,
  }) {
    return DashboardWidgetConfig(
      id: id,
      type: type,
      title: title,
      isVisible: isVisible ?? this.isVisible,
      order: order ?? this.order,
      size: size ?? this.size,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type.name,
    'title': title,
    'isVisible': isVisible,
    'order': order,
    'size': size.name,
  };

  factory DashboardWidgetConfig.fromJson(Map<String, dynamic> json) {
    return DashboardWidgetConfig(
      id: json['id'] as String,
      type: DashboardWidgetType.values.byName(json['type'] as String),
      title: json['title'] as String,
      isVisible: json['isVisible'] as bool? ?? true,
      order: json['order'] as int? ?? 0,
      size: DashboardWidgetSize.values.byName(
        json['size'] as String? ?? 'medium',
      ),
    );
  }

  static List<DashboardWidgetConfig> get defaultWidgets => [
    const DashboardWidgetConfig(
      id: 'w_focus_squad',
      type: DashboardWidgetType.focusSquad,
      title: 'Focus Squad & Showdown',
      order: 0,
    ),
    const DashboardWidgetConfig(
      id: 'w_todays_challenge',
      type: DashboardWidgetType.todaysChallenge,
      title: "Today's Challenge",
      order: 1,
    ),
    const DashboardWidgetConfig(
      id: 'w_progression',
      type: DashboardWidgetType.progression,
      title: 'Level & Streak Progression',
      order: 2,
    ),
    const DashboardWidgetConfig(
      id: 'w_quick_actions',
      type: DashboardWidgetType.quickActions,
      title: 'Quick Actions Bar',
      order: 3,
    ),
    const DashboardWidgetConfig(
      id: 'w_productivity',
      type: DashboardWidgetType.dailyProductivity,
      title: 'Daily Productivity Score',
      order: 4,
    ),
    const DashboardWidgetConfig(
      id: 'w_heatmap',
      type: DashboardWidgetType.activityHeatmap,
      title: 'Consistency Heatmap Preview',
      order: 5,
    ),
    const DashboardWidgetConfig(
      id: 'w_active_quests',
      type: DashboardWidgetType.activeQuests,
      title: 'Active Quests & Habits',
      order: 6,
    ),
  ];
}
