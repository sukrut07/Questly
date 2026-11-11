import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
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

  // Generate mock realistic activity heatmap data for the past 120 days
  Map<String, HeatmapDayData> _generateHeatmapData() {
    final map = <String, HeatmapDayData>{};
    final now = DateTime.now();

    for (int i = 0; i < 112; i++) {
      final date = now.subtract(Duration(days: i));
      final dateKey = DateFormat('yyyy-MM-dd').format(date);
      // Realistic pseudorandom pattern based on day of week and seed
      final weekday = date.weekday;
      final isWeekend =
          weekday == DateTime.saturday || weekday == DateTime.sunday;
      final base = (i * 7 + weekday * 3) % 7;
      final count = isWeekend ? (base % 3) : ((base + 2) % 6);
      final xp = count * 45 + (base * 10);
      final focusMins = count * 25 + (base * 5);

      map[dateKey] = HeatmapDayData(
        date: date,
        count: count,
        xpEarned: xp,
        focusMinutes: focusMins,
      );
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardStateProvider);
    final streakDays = dashboardAsync.asData?.value.streak.currentStreak ?? 14;
    final heatmapData = _generateHeatmapData();

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
                                  '+24% VELOCITY',
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
                        'Heatmaps, consistency metrics & productivity analytics',
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

              // KPI Stats Grid
              SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.md),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    children: [
                      const Row(
                        children: [
                          Expanded(
                            child: QuestlyStatCard(
                              title: 'COMPLETION RATE',
                              value: '94.2%',
                              subtitle: '+5.4% from last week',
                              icon: Icons.check_circle_outline,
                              accentColor: AppColors.limePrimary,
                            ),
                          ),
                          SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: QuestlyStatCard(
                              title: 'FOCUS TIME',
                              value: '38.5h',
                              subtitle: 'Top 10% productive',
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
                              subtitle: 'Personal record: 28d',
                              icon: Icons.local_fire_department,
                              accentColor: const Color(0xFFFF9F43),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          const Expanded(
                            child: QuestlyStatCard(
                              title: 'XP VELOCITY',
                              value: '+1,840',
                              subtitle: 'This week',
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

              // Heatmap Section
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

              // Weekly Productivity Bar Chart
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
                              maxY: 8,
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
                                                  color: index == 3
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
                                _makeBarGroup(0, 4, false),
                                _makeBarGroup(1, 6, false),
                                _makeBarGroup(2, 5, false),
                                _makeBarGroup(3, 7, true), // Peak today
                                _makeBarGroup(4, 3, false),
                                _makeBarGroup(5, 4, false),
                                _makeBarGroup(6, 2, false),
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

  BarChartGroupData _makeBarGroup(int x, double y, bool isHighlight) {
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
            toY: 8,
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
      child: Container(
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
          style: TextStyle(
            color: isSelected ? AppColors.darkBase : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 11,
            letterSpacing: 0.8,
          ),
        ),
      ),
    );
  }
}
