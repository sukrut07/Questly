import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/storage_providers.dart';
import 'package:questly/features/dashboard/data/repositories/widget_repository.dart';
import 'package:questly/features/dashboard/domain/models/dashboard_widget_config.dart';

final widgetRepositoryProvider = Provider<WidgetRepository>((ref) {
  final storage = ref.watch(localStorageProvider);
  return WidgetRepositoryImpl(storage);
});

final dashboardWidgetsProvider =
    StateNotifierProvider<DashboardWidgetsNotifier, AsyncValue<List<DashboardWidgetConfig>>>(
  (ref) => DashboardWidgetsNotifier(ref.watch(widgetRepositoryProvider)),
);

class DashboardWidgetsNotifier
    extends StateNotifier<AsyncValue<List<DashboardWidgetConfig>>> {
  final WidgetRepository _repository;

  DashboardWidgetsNotifier(this._repository) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final widgets = await _repository.getWidgets();
      state = AsyncValue.data(widgets);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggleVisibility(String widgetId, bool isVisible) async {
    final current = state.value;
    if (current == null) return;

    final updated = current.map((w) {
      return w.id == widgetId ? w.copyWith(isVisible: isVisible) : w;
    }).toList();

    state = AsyncValue.data(updated);
    await _repository.toggleVisibility(widgetId, isVisible);
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
    await _repository.reorderWidgets(oldIndex, newIndex);
  }

  Future<void> restoreDefaults() async {
    await _repository.restoreDefaults();
    await load();
  }
}
