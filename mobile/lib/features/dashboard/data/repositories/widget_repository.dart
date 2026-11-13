import 'dart:convert';

import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/features/dashboard/domain/models/dashboard_widget_config.dart';

abstract class WidgetRepository {
  Future<List<DashboardWidgetConfig>> getWidgets();
  Future<void> saveWidgets(List<DashboardWidgetConfig> widgets);
  Future<void> toggleVisibility(String widgetId, bool isVisible);
  Future<void> reorderWidgets(int oldIndex, int newIndex);
  Future<void> restoreDefaults();
}

class WidgetRepositoryImpl implements WidgetRepository {
  static const String _storageKey = 'questly_dashboard_widgets_v1';
  final LocalStorage _storage;

  WidgetRepositoryImpl(this._storage);

  @override
  Future<List<DashboardWidgetConfig>> getWidgets() async {
    final raw = _storage.getString(_storageKey);
    if (raw == null || raw.isEmpty) {
      final defaults = DashboardWidgetConfig.defaultWidgets;
      await saveWidgets(defaults);
      return defaults;
    }

    try {
      final List<dynamic> list = jsonDecode(raw) as List<dynamic>;
      final widgets = list
          .map((e) => DashboardWidgetConfig.fromJson(e as Map<String, dynamic>))
          .toList();
      widgets.sort((a, b) => a.order.compareTo(b.order));
      return widgets;
    } catch (_) {
      return DashboardWidgetConfig.defaultWidgets;
    }
  }

  @override
  Future<void> saveWidgets(List<DashboardWidgetConfig> widgets) async {
    final raw = jsonEncode(widgets.map((w) => w.toJson()).toList());
    await _storage.setString(_storageKey, raw);
  }

  @override
  Future<void> toggleVisibility(String widgetId, bool isVisible) async {
    final widgets = await getWidgets();
    final index = widgets.indexWhere((w) => w.id == widgetId);
    if (index != -1) {
      widgets[index] = widgets[index].copyWith(isVisible: isVisible);
      await saveWidgets(widgets);
    }
  }

  @override
  Future<void> reorderWidgets(int oldIndex, int newIndex) async {
    final widgets = await getWidgets();
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    final item = widgets.removeAt(oldIndex);
    widgets.insert(newIndex, item);

    for (int i = 0; i < widgets.length; i++) {
      widgets[i] = widgets[i].copyWith(order: i);
    }
    await saveWidgets(widgets);
  }

  @override
  Future<void> restoreDefaults() async {
    await saveWidgets(DashboardWidgetConfig.defaultWidgets);
  }
}
