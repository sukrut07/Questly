import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/domain/models/dashboard_widget_config.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/dashboard/presentation/providers/widget_providers.dart';
import 'package:questly/features/dashboard/presentation/widgets/active_quests_section.dart';
import 'package:questly/features/dashboard/presentation/widgets/daily_productivity_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/dashboard_header.dart';
import 'package:questly/features/dashboard/presentation/widgets/focus_squad_bar.dart';
import 'package:questly/features/dashboard/presentation/widgets/progression_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/quick_actions_bar.dart';
import 'package:questly/features/dashboard/presentation/widgets/todays_challenge_banner.dart';
import 'package:questly/features/dashboard/presentation/widgets/widget_customizer_sheet.dart';
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
    final widgetsConfigState = ref.watch(dashboardWidgetsProvider);

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

              final activeWidgets = widgetsConfigState.value?.where((w) => w.isVisible).toList() ??
                  DashboardWidgetConfig.defaultWidgets;

              return RefreshIndicator(
                onRefresh: () =>
                    ref.read(dashboardStateProvider.notifier).refresh(),
                color: AppColors.limePrimary,
                child: ListView(
                  padding: AppSpacing.screenPadding,
                  children: [
                    // Header with Avatar (opens Profile) & XP pill
                    DashboardHeader(profile: data.profile),
                    const SizedBox(height: AppSpacing.xs),

                    // Customizer Pill Bar
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'PERSONAL OS',
                          style: AppTypography.labelSmall.copyWith(
                            fontFamily: 'Oswald',
                            letterSpacing: 1.2,
                            color: AppColors.textTertiary,
                          ),
                        ),
                        InkWell(
                          onTap: () => WidgetCustomizerSheet.show(context),
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.tune_rounded,
                                  size: 14,
                                  color: AppColors.limePrimary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'CUSTOMIZE',
                                  style: AppTypography.labelSmall.copyWith(
                                    color: AppColors.limePrimary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Dynamic Ordered Widgets Rendering
                    for (final widgetConfig in activeWidgets) ...[
                      _buildWidgetByType(
                        context,
                        widgetConfig.type,
                        data,
                        previewHeatmap,
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],

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

  Widget _buildWidgetByType(
    BuildContext context,
    DashboardWidgetType type,
    dynamic data,
    Map<String, HeatmapDayData> previewHeatmap,
  ) {
    switch (type) {
      case DashboardWidgetType.focusSquad:
        return const FocusSquadBar();
      case DashboardWidgetType.todaysChallenge:
        return const TodaysChallengeBanner();
      case DashboardWidgetType.progression:
        return ProgressionCard(
          levelInfo: data.levelInfo,
          streak: data.streak,
        );
      case DashboardWidgetType.quickActions:
        return const QuickActionsBar();
      case DashboardWidgetType.dailyProductivity:
        return DailyProductivityCard(
          completedTasks: data.todayCompletedCount,
          totalTasks: data.todayTotalCount,
          productivityScore: data.productivityScore,
          streak: data.streak,
        );
      case DashboardWidgetType.activityHeatmap:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
          ],
        );
      case DashboardWidgetType.activeQuests:
        return ActiveQuestsSection(quests: data.activeQuests);
      default:
        return const SizedBox.shrink();
    }
  }
}
