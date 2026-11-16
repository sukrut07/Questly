import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:questly/features/gamification/presentation/widgets/streak_flame_animation.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';
import 'package:questly/shared/widgets/questly_heatmap.dart';
import 'package:questly/shared/widgets/questly_section_header.dart';
import 'package:questly/shared/widgets/questly_stat_card.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  int _selectedPeriodIndex = 0; // 0: Weekly, 1: Monthly, 2: All-Time
  HeatmapDayData? _selectedHeatmapDay;

  @override
  Widget build(BuildContext context) {
    final analyticsAsync = ref.watch(analyticsDataProvider);
    final analytics = analyticsAsync.asData?.value;

    final streakDays = analytics?.currentStreak ?? 1;
    final heatmapData = analytics?.heatmapData ?? <String, HeatmapDayData>{};
    final completionRateStr =
        '${(analytics?.weeklyCompletionRate ?? 0.0).toStringAsFixed(1)}%';
    final focusHoursStr =
        '${((analytics?.focusMinutesTotal ?? 0) / 60).toStringAsFixed(1)}h';
    final xpEarnedStr = '+${analytics?.totalXpEarned ?? 0}';

    final weeklyPattern =
        analytics?.weeklyPattern ?? const [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    final todayWeekdayIndex =
        DateTime.now().weekday - 1; // 0 for Mon, 6 for Sun
    final maxPatternVal = weeklyPattern.fold<double>(
      0.0,
      (prev, curr) => math.max(prev, curr),
    );
    final chartMaxY = math.max(6.0, maxPatternVal + 2);

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.md,
                    AppSpacing.md,
                    AppSpacing.xs,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'INSIGHTS',
                            style: AppTypography.displayMedium.copyWith(
                              letterSpacing: 1.2,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.limePrimary.withValues(
                                alpha: 0.15,
                              ),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.limePrimary.withValues(
                                  alpha: 0.4,
                                ),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.trending_up,
                                  size: 14,
                                  color: AppColors.limePrimary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'REAL-TIME AUDIT',
                                  style: AppTypography.captionBold.copyWith(
                                    color: AppColors.limePrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        'Live cadence, verified focus minutes & learning consistency',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),

                      // Period Selector
                      Row(
                        children: [
                          _buildPeriodTab(0, 'WEEKLY'),
                          const SizedBox(width: 8),
                          _buildPeriodTab(1, 'MONTHLY'),
                          const SizedBox(width: 8),
                          _buildPeriodTab(2, 'ALL TIME'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // KPI Stats Grid (Fully Dynamic)
              SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.md),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: QuestlyStatCard(
                              title: 'COMPLETION RATE',
                              value: completionRateStr,
                              subtitle:
                                  '${analytics?.totalQuestsCompleted ?? 0} quests finished',
                              icon: Icons.check_circle_outline,
                              accentColor: AppColors.limePrimary,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: QuestlyStatCard(
                              title: 'FOCUS TIME',
                              value: focusHoursStr,
                              subtitle:
                                  '${analytics?.focusMinutesTotal ?? 0}m logged',
                              icon: Icons.timer_outlined,
                              accentColor: AppColors.lavenderAccent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Expanded(
                            child: QuestlyStatCard(
                              title: 'DAILY STREAK',
                              value: '$streakDays DAYS',
                              subtitle: 'Active momentum',
                              icon: Icons.local_fire_department,
                              accentColor: const Color(0xFFFF9F43),
                              onTap: () {
                                StreakFlameDialog.show(
                                  context,
                                  streakCount: streakDays,
                                  xpEarned: 50,
                                  taskTitle: 'Consistency Maintained',
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: QuestlyStatCard(
                              title: 'TOTAL XP',
                              value: xpEarnedStr,
                              subtitle: 'Earned by student',
                              icon: Icons.bolt,
                              accentColor: AppColors.limePrimary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Heatmap Section (16 Weeks Real Cadence)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      QuestlySectionHeader(
                        title: 'ACTIVITY HEATMAP',
                        actionLabel: '16 WEEKS',
                        onAction: () {},
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      QuestlyCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            QuestlyHeatmap(
                              activityData: heatmapData,
                              weeksToShow: 16,
                              onDateSelected: (day) {
                                setState(() => _selectedHeatmapDay = day);
                              },
                            ),
                            if (_selectedHeatmapDay != null) ...[
                              const Divider(
                                color: AppColors.darkBorder,
                                height: 24,
                              ),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        DateFormat('EEEE, MMMM d, yyyy')
                                            .format(_selectedHeatmapDay!.date)
                                            .toUpperCase(),
                                        style: AppTypography.captionBold
                                            .copyWith(
                                              color: AppColors.lavenderAccent,
                                            ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${_selectedHeatmapDay!.count} tasks completed · ${_selectedHeatmapDay!.focusMinutes}m deep work',
                                        style: AppTypography.bodySmall,
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.limePrimary.withValues(
                                        alpha: 0.15,
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      '+${_selectedHeatmapDay!.xpEarned} XP',
                                      style: AppTypography.captionBold.copyWith(
                                        color: AppColors.limePrimary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Weekly Productivity Bar Chart (Actual Completed Tasks per Weekday)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      QuestlySectionHeader(
                        title: 'DAILY COMPLETION PATTERN',
                        actionLabel: 'THIS WEEK',
                        onAction: () {},
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      QuestlyCard(
                        child: SizedBox(
                          height: 180,
                          child: BarChart(
                            BarChartData(
                              alignment: BarChartAlignment.spaceAround,
                              maxY: chartMaxY,
                              barTouchData: BarTouchData(
                                enabled: true,
                                touchTooltipData: BarTouchTooltipData(
                                  getTooltipColor: (_) => AppColors.darkCard,
                                  getTooltipItem:
                                      (group, groupIndex, rod, rodIndex) {
                                        return BarTooltipItem(
                                          '${rod.toY.toInt()} Quests',
                                          AppTypography.captionBold.copyWith(
                                            color: AppColors.limePrimary,
                                          ),
                                        );
                                      },
                                ),
                              ),
                              titlesData: FlTitlesData(
                                show: true,
                                bottomTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    getTitlesWidget: (value, meta) {
                                      const days = [
                                        'M',
                                        'T',
                                        'W',
                                        'T',
                                        'F',
                                        'S',
                                        'S',
                                      ];
                                      final index = value.toInt();
                                      if (index >= 0 && index < days.length) {
                                        return Padding(
                                          padding: const EdgeInsets.only(
                                            top: 8.0,
                                          ),
                                          child: Text(
                                            days[index],
                                            style: AppTypography.captionBold
                                                .copyWith(
                                                  color:
                                                      index == todayWeekdayIndex
                                                      ? AppColors.limePrimary
                                                      : AppColors.textSecondary,
                                                ),
                                          ),
                                        );
                                      }
                                      return const SizedBox.shrink();
                                    },
                                  ),
                                ),
                                leftTitles: const AxisTitles(
                                  sideTitles: SideTitles(showTitles: false),
                                ),
                                topTitles: const AxisTitles(
                                  sideTitles: SideTitles(showTitles: false),
                                ),
                                rightTitles: const AxisTitles(
                                  sideTitles: SideTitles(showTitles: false),
                                ),
                              ),
                              gridData: const FlGridData(show: false),
                              borderData: FlBorderData(show: false),
                              barGroups: [
                                for (int i = 0; i < 7; i++)
                                  _makeBarGroup(
                                    i,
                                    weeklyPattern[i],
                                    i == todayWeekdayIndex,
                                    chartMaxY,
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xxl)),
            ],
          ),
        ),
      ),
    );
  }

  BarChartGroupData _makeBarGroup(
    int x,
    double y,
    bool isHighlight,
    double maxY,
  ) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: isHighlight
              ? AppColors.limePrimary
              : AppColors.lavenderAccent.withValues(alpha: 0.6),
          width: 16,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
          backDrawRodData: BackgroundBarChartRodData(
            show: true,
            toY: maxY,
            color: AppColors.darkBorder.withValues(alpha: 0.4),
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodTab(int index, String title) {
    final isSelected = _selectedPeriodIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedPeriodIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.limePrimary : AppColors.darkCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.limePrimary : AppColors.darkBorder,
          ),
        ),
        child: Text(
          title,
          style: AppTypography.captionBold.copyWith(
            color: isSelected ? AppColors.darkBase : AppColors.textSecondary,
            letterSpacing: 0.8,
            fontSize: 10,
          ),
        ),
      ),
    );
  }
}
