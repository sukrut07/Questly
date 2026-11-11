import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/dashboard/presentation/widgets/active_quests_section.dart';
import 'package:questly/features/dashboard/presentation/widgets/daily_productivity_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/dashboard_header.dart';
import 'package:questly/features/dashboard/presentation/widgets/progression_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/quick_actions_bar.dart';
import 'package:questly/shared/widgets/app_button.dart';
import 'package:questly/shared/widgets/app_loader.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';
import 'package:questly/shared/widgets/questly_heatmap.dart';
import 'package:questly/shared/widgets/questly_section_header.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardStateProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: dashboardState.when(
            loading: () => const AppLoader(message: 'Loading Questly realm...'),
            error: (error, stack) => Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      size: 48,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Failed to load dashboard',
                      style: AppTypography.titleLarge,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      error.toString(),
                      style: AppTypography.bodySmall,
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
              // Generate mock preview heatmap data for the past 6 weeks
              final now = DateTime.now();
              final previewHeatmap = <String, HeatmapDayData>{};
              for (int i = 0; i < 42; i++) {
                final d = now.subtract(Duration(days: i));
                final key = DateFormat('yyyy-MM-dd').format(d);
                final count = (i * 3 + d.weekday) % 5;
                previewHeatmap[key] = HeatmapDayData(
                  date: d,
                  count: count,
                  xpEarned: count * 50,
                  focusMinutes: count * 25,
                );
              }

              return RefreshIndicator(
                onRefresh: () =>
                    ref.read(dashboardStateProvider.notifier).refresh(),
                color: AppColors.limePrimary,
                child: ListView(
                  padding: AppSpacing.screenPadding,
                  children: [
                    // Header with Avatar (opens Profile) & XP pill
                    DashboardHeader(profile: data.profile),
                    const SizedBox(height: AppSpacing.md),

                    // Progression Card
                    ProgressionCard(
                      levelInfo: data.levelInfo,
                      streak: data.streak,
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Quick Actions Bar (New Quest, Deep Focus, Write Note, Roadmaps)
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

                    // Compact Heatmap Cadence Card (Preview leading to Insights)
                    QuestlySectionHeader(
                      title: 'PRODUCTIVITY CADENCE',
                      actionLabel: 'VIEW INSIGHTS',
                      onAction: () => context.go(RoutePaths.insights),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    QuestlyCard(
                      onTap: () => context.go(RoutePaths.insights),
                      child: QuestlyHeatmap(
                        activityData: previewHeatmap,
                        weeksToShow: 14,
                        onDateSelected: (_) => context.go(RoutePaths.insights),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Active Quests Section
                    ActiveQuestsSection(quests: data.activeQuests),
                    const SizedBox(height: AppSpacing.xl),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
