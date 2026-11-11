import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';

class DashboardNotifier extends StateNotifier<AsyncValue<DashboardData>> {
  final DashboardRepository _repository;

  DashboardNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadDashboard();
  }

  Future<void> loadDashboard() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repository.getDashboardData());
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() async {
      await _repository.refresh();
      return _repository.getDashboardData();
    });
  }
}

final dashboardStateProvider =
    StateNotifierProvider<DashboardNotifier, AsyncValue<DashboardData>>((ref) {
  final repo = ref.watch(dashboardRepositoryProvider);
  return DashboardNotifier(repo);
});
