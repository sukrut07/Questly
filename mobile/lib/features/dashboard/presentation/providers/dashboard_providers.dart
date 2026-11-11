import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';

class DashboardNotifier extends AsyncNotifier<DashboardData> {
  @override
  FutureOr<DashboardData> build() async {
    final repo = ref.watch(dashboardRepositoryProvider);
    return repo.getDashboardData();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(dashboardRepositoryProvider);
      await repo.refresh();
      return repo.getDashboardData();
    });
  }
}

final dashboardStateProvider =
    AsyncNotifierProvider<DashboardNotifier, DashboardData>(DashboardNotifier.new);
