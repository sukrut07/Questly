import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/domain/models/dashboard_widget_config.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/dashboard/presentation/providers/widget_providers.dart';
import 'package:questly/features/dashboard/presentation/widgets/active_quests_section.dart';
import 'package:questly/features/dashboard/presentation/widgets/daily_productivity_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/dashboard_header.dart';
import 'package:questly/features/dashboard/presentation/widgets/progression_card.dart';
import 'package:questly/features/dashboard/presentation/widgets/quick_actions_bar.dart';
import 'package:questly/features/dashboard/presentation/widgets/todays_challenge_banner.dart';
import 'package:questly/features/dashboard/presentation/widgets/widget_customizer_sheet.dart';
import 'package:questly/features/dashboard/presentation/widgets/workload_balancer_card.dart';
import 'package:questly/features/quests/presentation/widgets/quick_task_bottom_sheet.dart';
import 'package:questly/shared/widgets/app_button.dart';
import 'package:questly/shared/widgets/app_loader.dart';
import 'package:questly/shared/widgets/questly_button.dart';
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
    final analyticsAsync = ref.watch(analyticsDataProvider);

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
              final previewHeatmap = analyticsAsync.asData?.value.heatmapData ??
                  <String, HeatmapDayData>{};

              final activeWidgets =
                  widgetsConfigState.value
                      ?.where((w) => w.isVisible)
                      .toList() ??
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
                          'COMMAND CENTER',
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
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
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

                    // Academic Workload Balancer
                    WorkloadBalancerCard(
                      plannedMinutes: data.activeQuests.fold<int>(
                        0,
                        (sum, q) =>
                            sum +
                            (q.estimatedMinutes > 0
                                ? q.estimatedMinutes
                                : 30),
                      ),
                      capacityMinutes: 180,
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Ready for Focus Session Card
                    QuestlyCard(
                      borderColor: AppColors.limePrimary.withValues(alpha: 0.4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.timer_rounded,
                                color: AppColors.limePrimary,
                                size: 18,
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              Text(
                                'Ready for a Focus Session?',
                                style: AppTypography.titleSmall.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Add your first task to start a verified focus sprint, or jump into an open study timer.',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Row(
                            children: [
                              QuestlyButton(
                                text: '+ ADD TASK',
                                icon: Icons.add,
                                size: QuestlyButtonSize.small,
                                variant: QuestlyButtonVariant.primaryLime,
                                onPressed: () =>
                                    QuickTaskBottomSheet.show(context),
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              QuestlyButton(
                                text: 'OPEN CHAMBER',
                                icon: Icons.play_arrow_rounded,
                                size: QuestlyButtonSize.small,
                                variant: QuestlyButtonVariant.darkOutline,
                                onPressed: () => context.push(RoutePaths.focus),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

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
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.limePrimary,
        foregroundColor: AppColors.darkBase,
        icon: const Icon(Icons.add_task_rounded, size: 20),
        label: Text(
          'NEW TASK',
          style: AppTypography.labelBold.copyWith(color: AppColors.darkBase),
        ),
        onPressed: () => QuickTaskBottomSheet.show(
          context,
          onCreated: () => ref.read(dashboardStateProvider.notifier).refresh(),
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
        return const SizedBox.shrink();
      case DashboardWidgetType.todaysChallenge:
        return const TodaysChallengeBanner();
      case DashboardWidgetType.progression:
        return ProgressionCard(levelInfo: data.levelInfo, streak: data.streak);
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
