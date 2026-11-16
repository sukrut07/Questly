import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/features/analytics/domain/repositories/analytics_repository.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';

final analyticsDataProvider = FutureProvider<AnalyticsData>((ref) {
  final repo = ref.watch(analyticsRepositoryProvider);
  ref.watch(dashboardStateProvider);
  return repo.getSummary();
});
