import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';

class HeatmapDayData {
  final DateTime date;
  final int count;
  final int xpEarned;
  final int focusMinutes;

  const HeatmapDayData({
    required this.date,
    this.count = 0,
    this.xpEarned = 0,
    this.focusMinutes = 0,
  });

  int get level {
    if (count == 0 && focusMinutes == 0 && xpEarned == 0) return 0;
    if (count <= 1 && focusMinutes < 25 && xpEarned < 25) return 1;
    if (count <= 3 || focusMinutes < 50 || xpEarned < 60) return 2;
    if (count <= 5 || focusMinutes < 90 || xpEarned < 120) return 3;
    return 4; // Peak intensity
  }
}

class QuestlyHeatmap extends StatefulWidget {
  final Map<String, HeatmapDayData> activityData; // YYYY-MM-DD -> data
  final int weeksToShow;
  final ValueChanged<HeatmapDayData>? onDateSelected;
  final bool showHeader;
  final bool compact;

  const QuestlyHeatmap({
    super.key,
    required this.activityData,
    this.weeksToShow = 16,
    this.onDateSelected,
    this.showHeader = true,
    this.compact = false,
  });

  @override
  State<QuestlyHeatmap> createState() => _QuestlyHeatmapState();
}

class _QuestlyHeatmapState extends State<QuestlyHeatmap>
    with SingleTickerProviderStateMixin {
  DateTime? _selectedDate;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Color _getColorForLevel(int level, bool isDark) {
    switch (level) {
      case 1:
        return AppColors.heatmapLevel1;
      case 2:
        return AppColors.heatmapLevel2;
      case 3:
        return AppColors.heatmapLevel3;
      case 4:
        return AppColors.heatmapLevel4;
      case 0:
      default:
        return isDark ? AppColors.heatmapLevel0 : Colors.grey.shade200;
    }
  }

  void _showDayDetailsSheet(BuildContext context, HeatmapDayData data) {
    final dateFormatted = DateFormat('EEEE, MMMM d, yyyy').format(data.date);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : Colors.grey.shade300,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkBorder : Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        dateFormatted.toUpperCase(),
                        style: AppTypography.titleSmall.copyWith(
                          color: AppColors.lavenderAccent,
                          letterSpacing: 1.0,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        data.level == 0
                            ? 'No logged activity'
                            : 'Level ${data.level} Activity Intensity',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.limePrimary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.limePrimary.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Text(
                    '+${data.xpEarned} XP',
                    style: AppTypography.captionBold.copyWith(
                      color: AppColors.limePrimary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _MetricBadge(
                    icon: Icons.check_circle_outline,
                    label: 'TASKS COMPLETED',
                    value: '${data.count}',
                    color: AppColors.limePrimary,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _MetricBadge(
                    icon: Icons.timer_outlined,
                    label: 'FOCUS MINUTES',
                    value: '${data.focusMinutes}m',
                    color: AppColors.lavenderAccent,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _MetricBadge(
                    icon: Icons.local_fire_department,
                    label: 'MOMENTUM',
                    value: data.count > 0 ? 'ACTIVE' : 'IDLE',
                    color: const Color(0xFFFF9F43),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final totalDays = widget.weeksToShow * 7;
    final startDate = today.subtract(Duration(days: totalDays - 1));

    // Group into columns (weeks)
    final columns = <List<DateTime>>[];
    for (int w = 0; w < widget.weeksToShow; w++) {
      final col = <DateTime>[];
      for (int d = 0; d < 7; d++) {
        col.add(startDate.add(Duration(days: w * 7 + d)));
      }
      columns.add(col);
    }

    final selectedKey = _selectedDate != null
        ? DateFormat('yyyy-MM-dd').format(_selectedDate!)
        : null;
    final selectedData = selectedKey != null
        ? widget.activityData[selectedKey] ??
              HeatmapDayData(date: _selectedDate!)
        : null;

    final cellSize = widget.compact ? 11.0 : 13.5;
    final cellMargin = widget.compact ? 2.5 : 3.5;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Grid with Weekday Labels on Left
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Weekday labels (Mon, Wed, Fri)
            Padding(
              padding: EdgeInsets.only(top: 2, right: cellMargin + 2),
              child: Column(
                children: [
                  _WeekdayLabel('M', cellSize, cellMargin),
                  _WeekdayLabel('', cellSize, cellMargin),
                  _WeekdayLabel('W', cellSize, cellMargin),
                  _WeekdayLabel('', cellSize, cellMargin),
                  _WeekdayLabel('F', cellSize, cellMargin),
                  _WeekdayLabel('', cellSize, cellMargin),
                  _WeekdayLabel('S', cellSize, cellMargin),
                ],
              ),
            ),

            // Scrollable Grid
            Expanded(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: columns.map((week) {
                    return Padding(
                      padding: EdgeInsets.only(right: cellMargin),
                      child: Column(
                        children: week.map((date) {
                          final key = DateFormat('yyyy-MM-dd').format(date);
                          final data =
                              widget.activityData[key] ??
                              HeatmapDayData(date: date);
                          final isFuture = date.isAfter(today);
                          final isToday =
                              date.year == today.year &&
                              date.month == today.month &&
                              date.day == today.day;
                          final isSelected =
                              _selectedDate != null &&
                              _selectedDate!.year == date.year &&
                              _selectedDate!.month == date.month &&
                              _selectedDate!.day == date.day;

                          final cellColor = isFuture
                              ? Colors.transparent
                              : _getColorForLevel(data.level, isDark);

                          return GestureDetector(
                            onTap: isFuture
                                ? null
                                : () {
                                    HapticFeedback.selectionClick();
                                    setState(() => _selectedDate = date);
                                    widget.onDateSelected?.call(data);
                                    _showDayDetailsSheet(context, data);
                                  },
                            child: AnimatedBuilder(
                              animation: _pulseController,
                              builder: (context, child) {
                                final todayBorderColor = isToday
                                    ? AppColors.limePrimary.withValues(
                                        alpha:
                                            0.5 + 0.5 * _pulseController.value,
                                      )
                                    : Colors.transparent;

                                return Container(
                                  width: cellSize,
                                  height: cellSize,
                                  margin: EdgeInsets.only(bottom: cellMargin),
                                  decoration: BoxDecoration(
                                    color: cellColor,
                                    borderRadius: BorderRadius.circular(3),
                                    border: isSelected
                                        ? Border.all(
                                            color: Colors.white,
                                            width: 1.5,
                                          )
                                        : isToday
                                        ? Border.all(
                                            color: todayBorderColor,
                                            width: 1.5,
                                          )
                                        : Border.all(
                                            color: isFuture
                                                ? Colors.transparent
                                                : (isDark
                                                      ? AppColors.darkBorder
                                                            .withValues(
                                                              alpha: 0.5,
                                                            )
                                                      : Colors.grey.shade300),
                                            width: 0.5,
                                          ),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: AppColors.limePrimary
                                                  .withValues(alpha: 0.4),
                                              blurRadius: 4,
                                            ),
                                          ]
                                        : isToday
                                        ? [
                                            BoxShadow(
                                              color: AppColors.limePrimary
                                                  .withValues(
                                                    alpha:
                                                        0.25 *
                                                        _pulseController.value,
                                                  ),
                                              blurRadius: 4,
                                            ),
                                          ]
                                        : null,
                                  ),
                                );
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.sm),

        // Legend & Selection Tooltip
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Selected Date Info
            if (selectedData != null)
              Expanded(
                child: Text(
                  '${DateFormat('MMM d').format(selectedData.date)}: ${selectedData.count} tasks · ${selectedData.focusMinutes}m focus · +${selectedData.xpEarned} XP',
                  style: TextStyle(
                    fontFamily: GoogleFonts.inter().fontFamily,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? AppColors.primaryLime
                        : AppColors.lightPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              )
            else
              Text(
                'Tap cell for details · Pulse = Today',
                style: TextStyle(
                  fontFamily: GoogleFonts.inter().fontFamily,
                  fontSize: 11,
                  color: isDark
                      ? AppColors.textMuted
                      : AppColors.lightTextMuted,
                ),
              ),

            // 5-level scale legend
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'LESS',
                  style: TextStyle(
                    fontFamily: GoogleFonts.oswald().fontFamily,
                    fontSize: 9,
                    letterSpacing: 0.5,
                    color: isDark
                        ? AppColors.textMuted
                        : AppColors.lightTextMuted,
                  ),
                ),
                const SizedBox(width: 4),
                for (int l = 0; l <= 4; l++)
                  Container(
                    width: 9,
                    height: 9,
                    margin: const EdgeInsets.symmetric(horizontal: 1.5),
                    decoration: BoxDecoration(
                      color: _getColorForLevel(l, isDark),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                const SizedBox(width: 4),
                Text(
                  'MORE',
                  style: TextStyle(
                    fontFamily: GoogleFonts.oswald().fontFamily,
                    fontSize: 9,
                    letterSpacing: 0.5,
                    color: isDark
                        ? AppColors.textMuted
                        : AppColors.lightTextMuted,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _WeekdayLabel extends StatelessWidget {
  final String text;
  final double cellSize;
  final double cellMargin;

  const _WeekdayLabel(this.text, this.cellSize, this.cellMargin);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12,
      height: cellSize,
      margin: EdgeInsets.only(bottom: cellMargin),
      alignment: Alignment.center,
      child: Text(
        text,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.bold,
          color: AppColors.textTertiary,
          fontFamily: GoogleFonts.spaceMono().fontFamily,
        ),
      ),
    );
  }
}

class _MetricBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _MetricBadge({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.darkBase,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.darkBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 8.5,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
              fontFamily: GoogleFonts.spaceMono().fontFamily,
            ),
          ),
        ],
      ),
    );
  }
}
