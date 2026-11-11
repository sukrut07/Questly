import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/dashboard/presentation/widgets/active_quests_section.dart';
import 'package:questly/features/dashboard/presentation/widgets/daily_productivity_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/dashboard_header.dart';
import 'package:questly/features/dashboard/presentation/widgets/progression_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/quick_actions_bar.dart';
import 'package:questly/shared/widgets/app_button.dart';
import 'package:questly/shared/widgets/app_loader.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardStateProvider);

    return Scaffold(
      body: SafeArea(
        child: dashboardState.when(
          loading: () => const AppLoader(message: 'Awakening Questly realm...'),
          error: (error, stack) => Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    size: 48,
                    color: AppColors.darkError,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'Failed to load dashboard',
                    style: Theme.of(context).textTheme.titleLarge
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    error.toString(),
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: 'Retry',
                    onPressed: () =>
                        ref.read(dashboardStateProvider.notifier).refresh(),
                  ),
                ],
              ),
            ),
          ),
          data: (data) {
            return RefreshIndicator(
              onRefresh: () =>
                  ref.read(dashboardStateProvider.notifier).refresh(),
              color: AppColors.darkPrimary,
              child: ListView(
                padding: AppSpacing.screenPadding,
                children: [
                  // Header
                  DashboardHeader(profile: data.profile),
                  const SizedBox(height: AppSpacing.md),

                  // Progression Card
                  ProgressionCard(
                    levelInfo: data.levelInfo,
                    streak: data.streak,
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Quick Actions Bar
                  const QuickActionsBar(),
                  const SizedBox(height: AppSpacing.md),

                  // Daily Productivity Card
                  DailyProductivityCard(
                    completedTasks: data.todayCompletedCount,
                    totalTasks: data.todayTotalCount,
                    productivityScore: data.productivityScore,
                    streak: data.streak,
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Active Quests Section
                  ActiveQuestsSection(quests: data.activeQuests),
                  const SizedBox(height: AppSpacing.lg),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
