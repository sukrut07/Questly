import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/features/dashboard/data/repositories/widget_repository.dart';
import 'package:questly/features/dashboard/domain/models/dashboard_widget_config.dart';

final widgetRepositoryProvider = Provider<WidgetRepository>((ref) {
  final storage = ref.watch(localStorageProvider);
  return WidgetRepositoryImpl(storage);
});

class DashboardWidgetsNotifier
    extends AsyncNotifier<List<DashboardWidgetConfig>> {
  @override
  FutureOr<List<DashboardWidgetConfig>> build() async {
    final repository = ref.watch(widgetRepositoryProvider);
    return repository.getWidgets();
  }

  Future<void> toggleVisibility(String widgetId, bool isVisible) async {
    final current = state.value;
    if (current == null) return;

    final updated = current.map((w) {
      return w.id == widgetId ? w.copyWith(isVisible: isVisible) : w;
    }).toList();

    state = AsyncValue.data(updated);
    final repository = ref.read(widgetRepositoryProvider);
    await repository.toggleVisibility(widgetId, isVisible);
  }

  Future<void> reorder(int oldIndex, int newIndex) async {
    final current = state.value;
    if (current == null) return;

    final list = List<DashboardWidgetConfig>.from(current);
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    final item = list.removeAt(oldIndex);
    list.insert(newIndex, item);

    for (int i = 0; i < list.length; i++) {
      list[i] = list[i].copyWith(order: i);
    }

    state = AsyncValue.data(list);
    final repository = ref.read(widgetRepositoryProvider);
    await repository.reorderWidgets(oldIndex, newIndex);
  }

  Future<void> restoreDefaults() async {
    final repository = ref.read(widgetRepositoryProvider);
    await repository.restoreDefaults();
    state = AsyncValue.data(await repository.getWidgets());
  }
}

final dashboardWidgetsProvider =
    AsyncNotifierProvider<
      DashboardWidgetsNotifier,
      List<DashboardWidgetConfig>
    >(DashboardWidgetsNotifier.new);
