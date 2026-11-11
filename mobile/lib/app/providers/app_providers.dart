import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:questly/core/constants/app_constants.dart';
import 'package:questly/core/network/api_client.dart';
import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/core/storage/secure_storage.dart';
import 'package:questly/features/dashboard/data/repositories/mock_dashboard_repository.dart';
import 'package:questly/features/dashboard/domain/repositories/dashboard_repository.dart';
import 'package:questly/features/quests/data/repositories/quest_repository_impl.dart';
import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/features/tasks/data/repositories/task_repository_impl.dart';
import 'package:questly/features/tasks/domain/repositories/task_repository.dart';

/// Provider for raw SharedPreferences (overridden during bootstrap)
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('sharedPreferencesProvider must be overridden in bootstrap');
});

/// Local storage provider wrapping SharedPreferences
final localStorageProvider = Provider<LocalStorage>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return LocalStorageImpl(prefs);
});

/// Secure storage provider for secrets & tokens
final secureStorageProvider = Provider<SecureStorage>((ref) {
  return const SecureStorageImpl();
});

/// ApiClient provider
final apiClientProvider = Provider<ApiClient>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return ApiClient(secureStorage: secureStorage);
});

/// Theme Mode Notifier using Riverpod 3 Notifier pattern
class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final storage = ref.watch(localStorageProvider);
    final saved = storage.getString(AppConstants.themeModeKey);
    if (saved == 'light') return ThemeMode.light;
    if (saved == 'system') return ThemeMode.system;
    return ThemeMode.dark;
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    final storage = ref.read(localStorageProvider);
    await storage.setString(AppConstants.themeModeKey, mode.name);
  }

  void toggleTheme() {
    final next = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    setThemeMode(next);
  }
}

final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);

/// Quest Repository Provider
final questRepositoryProvider = Provider<QuestRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return QuestRepositoryImpl(apiClient);
});

/// Task Repository Provider
final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  final questRepo = ref.watch(questRepositoryProvider);
  return TaskRepositoryImpl(questRepo);
});

/// Dashboard Repository Provider
final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return MockDashboardRepository();
});
