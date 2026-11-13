import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class HomeWidgetSnapshot {
  final int userLevel;
  final String academicRank;
  final int totalXp;
  final int streakDays;
  final String? activeTaskTitle;
  final String? activeTaskSubject;
  final int todayFocusMinutes;
  final int completedTasks;
  final int totalTasks;
  final String? nextClassTitle;
  final String? nextClassTime;

  const HomeWidgetSnapshot({
    required this.userLevel,
    required this.academicRank,
    required this.totalXp,
    required this.streakDays,
    this.activeTaskTitle,
    this.activeTaskSubject,
    required this.todayFocusMinutes,
    required this.completedTasks,
    required this.totalTasks,
    this.nextClassTitle,
    this.nextClassTime,
  });

  Map<String, dynamic> toJson() => {
        'userLevel': userLevel,
        'academicRank': academicRank,
        'totalXp': totalXp,
        'streakDays': streakDays,
        'activeTaskTitle': activeTaskTitle,
        'activeTaskSubject': activeTaskSubject,
        'todayFocusMinutes': todayFocusMinutes,
        'completedTasks': completedTasks,
        'totalTasks': totalTasks,
        'nextClassTitle': nextClassTitle,
        'nextClassTime': nextClassTime,
        'updatedAt': DateTime.now().toIso8601String(),
      };

  factory HomeWidgetSnapshot.fromJson(Map<String, dynamic> json) {
    return HomeWidgetSnapshot(
      userLevel: json['userLevel'] as int? ?? 1,
      academicRank: json['academicRank'] as String? ?? 'Initiate',
      totalXp: json['totalXp'] as int? ?? 0,
      streakDays: json['streakDays'] as int? ?? 0,
      activeTaskTitle: json['activeTaskTitle'] as String?,
      activeTaskSubject: json['activeTaskSubject'] as String?,
      todayFocusMinutes: json['todayFocusMinutes'] as int? ?? 0,
      completedTasks: json['completedTasks'] as int? ?? 0,
      totalTasks: json['totalTasks'] as int? ?? 0,
      nextClassTitle: json['nextClassTitle'] as String?,
      nextClassTime: json['nextClassTime'] as String?,
    );
  }
}

class HomeWidgetService {
  static const String _widgetDataKey = 'questly_home_widget_data';

  final SharedPreferences _prefs;

  HomeWidgetService(this._prefs);

  /// Saves widget data to shared storage for native iOS WidgetKit and Android AppWidget.
  Future<bool> updateWidgetData(HomeWidgetSnapshot snapshot) async {
    final jsonStr = jsonEncode(snapshot.toJson());
    return await _prefs.setString(_widgetDataKey, jsonStr);
  }

  /// Retrieves the latest snapshot stored for widgets.
  HomeWidgetSnapshot? getWidgetData() {
    final jsonStr = _prefs.getString(_widgetDataKey);
    if (jsonStr == null) return null;
    try {
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      return HomeWidgetSnapshot.fromJson(map);
    } catch (_) {
      return null;
    }
  }
}
