import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';

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
    if (count == 0 && focusMinutes == 0) return 0;
    if (count <= 1 && focusMinutes < 25) return 1;
    if (count <= 3 || focusMinutes < 50) return 2;
    if (count <= 5 || focusMinutes < 90) return 3;
    return 4; // Peak intensity
  }
}

class QuestlyHeatmap extends StatefulWidget {
  final Map<String, HeatmapDayData> activityData; // YYYY-MM-DD -> data
  final int weeksToShow;
  final ValueChanged<HeatmapDayData>? onDateSelected;

  const QuestlyHeatmap({
    super.key,
    required this.activityData,
    this.weeksToShow = 16,
    this.onDateSelected,
  });

  @override
  State<QuestlyHeatmap> createState() => _QuestlyHeatmapState();
}

class _QuestlyHeatmapState extends State<QuestlyHeatmap> {
  DateTime? _selectedDate;

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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    // Calculate dates starting from (weeksToShow * 7) days ago aligned to Sunday
    final totalDays = widget.weeksToShow * 7;
    final startDate = today.subtract(Duration(days: totalDays - 1));

    // Group into 7 rows (days of week) x columns (weeks)
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Scrollable Grid
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: columns.map((week) {
              return Padding(
                padding: const EdgeInsets.only(right: 3.5),
                child: Column(
                  children: week.map((date) {
                    final key = DateFormat('yyyy-MM-dd').format(date);
                    final data = widget.activityData[key] ?? HeatmapDayData(date: date);
                    final isFuture = date.isAfter(today);
                    final isSelected = _selectedDate != null &&
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
                            },
                      child: Container(
                        width: 14,
                        height: 14,
                        margin: const EdgeInsets.only(bottom: 3.5),
                        decoration: BoxDecoration(
                          color: cellColor,
                          borderRadius: BorderRadius.circular(3),
                          border: isSelected
                              ? Border.all(color: Colors.white, width: 1.5)
                              : Border.all(
                                  color: isFuture
                                      ? Colors.transparent
                                      : (isDark
                                          ? AppColors.darkBorder.withValues(alpha: 0.5)
                                          : Colors.grey.shade300),
                                  width: 0.5,
                                ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              );
            }).toList(),
          ),
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
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.primaryLime : AppColors.lightPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              )
            else
              Text(
                'Tap any cell for daily breakdown',
                style: TextStyle(
                  fontFamily: GoogleFonts.inter().fontFamily,
                  fontSize: 11,
                  color: isDark ? AppColors.textMuted : AppColors.lightTextMuted,
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
                    color: isDark ? AppColors.textMuted : AppColors.lightTextMuted,
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
                    color: isDark ? AppColors.textMuted : AppColors.lightTextMuted,
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
