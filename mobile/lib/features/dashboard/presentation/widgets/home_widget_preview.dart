import 'package:flutter/material.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../core/widgets/home_widget_service.dart';

enum WidgetPreviewSize { small, medium, large }

class HomeWidgetPreviewCard extends StatefulWidget {
  final HomeWidgetSnapshot snapshot;

  const HomeWidgetPreviewCard({
    super.key,
    required this.snapshot,
  });

  @override
  State<HomeWidgetPreviewCard> createState() => _HomeWidgetPreviewCardState();
}

class _HomeWidgetPreviewCardState extends State<HomeWidgetPreviewCard> {
  WidgetPreviewSize _selectedSize = WidgetPreviewSize.medium;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkCardBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.darkBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.widgets_outlined, size: 18, color: AppColors.primaryLime),
                  SizedBox(width: 8),
                  Text(
                    'HOME-SCREEN WIDGET PREVIEW',
                    style: TextStyle(
                      fontFamily: 'BarlowCondensed',
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                      letterSpacing: 0.5,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  _buildSizeToggle(WidgetPreviewSize.small, '2x2'),
                  const SizedBox(width: 4),
                  _buildSizeToggle(WidgetPreviewSize.medium, '4x2'),
                  const SizedBox(width: 4),
                  _buildSizeToggle(WidgetPreviewSize.large, '4x4'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Center(
            child: _buildWidgetBody(),
          ),
        ],
      ),
    );
  }

  Widget _buildSizeToggle(WidgetPreviewSize size, String label) {
    final isSelected = _selectedSize == size;
    return GestureDetector(
      onTap: () => setState(() => _selectedSize = size),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLime : AppColors.darkSecondaryBackground,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primaryLime : AppColors.darkBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildWidgetBody() {
    switch (_selectedSize) {
      case WidgetPreviewSize.small:
        return _buildSmallWidget();
      case WidgetPreviewSize.medium:
        return _buildMediumWidget();
      case WidgetPreviewSize.large:
        return _buildLargeWidget();
    }
  }

  Widget _buildSmallWidget() {
    return Container(
      width: 140,
      height: 140,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF090A0D),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.darkBorder, width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33B5FF55),
            blurRadius: 10,
            spreadRadius: 1,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: AppColors.primaryLime,
                  borderRadius: BorderRadius.circular(6),
                ),
                alignment: Alignment.center,
                child: const Text(
                  'Q',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 13,
                    color: Colors.black,
                  ),
                ),
              ),
              Text(
                '${widget.snapshot.streakDays}d 🔥',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFF806B),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${widget.snapshot.totalXp} XP',
                style: const TextStyle(
                  fontFamily: 'BarlowCondensed',
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                  color: AppColors.primaryLime,
                ),
              ),
              Text(
                'LVL ${widget.snapshot.userLevel} ${widget.snapshot.academicRank.toUpperCase()}',
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: widget.snapshot.totalTasks > 0
                  ? widget.snapshot.completedTasks / widget.snapshot.totalTasks
                  : 0.0,
              backgroundColor: AppColors.darkSecondaryBackground,
              valueColor: const AlwaysStoppedAnimation(AppColors.primaryLime),
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMediumWidget() {
    return Container(
      width: 290,
      height: 140,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF090A0D),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.darkBorder, width: 1.5),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLime,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      alignment: Alignment.center,
                      child: const Text('Q',
                          style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 12,
                              color: Colors.black)),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'LVL ${widget.snapshot.userLevel}',
                      style: const TextStyle(
                        fontFamily: 'BarlowCondensed',
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                        color: AppColors.primaryLime,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${widget.snapshot.totalXp} XP',
                      style: const TextStyle(
                        fontFamily: 'BarlowCondensed',
                        fontWeight: FontWeight.w900,
                        fontSize: 22,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${widget.snapshot.todayFocusMinutes}m flow today',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                Text(
                  '${widget.snapshot.completedTasks}/${widget.snapshot.totalTasks} tasks done',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryLime,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 1,
            height: double.infinity,
            color: AppColors.darkBorder,
            margin: const EdgeInsets.symmetric(horizontal: 10),
          ),
          Expanded(
            flex: 5,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'NEXT ACADEMIC ACTION',
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                    color: Color(0xFF42DFFF),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.snapshot.activeTaskTitle ?? 'No active tasks pending',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (widget.snapshot.activeTaskSubject != null) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF42DFFF).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      widget.snapshot.activeTaskSubject!,
                      style: const TextStyle(
                        fontSize: 9,
                        color: Color(0xFF42DFFF),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLargeWidget() {
    return Container(
      width: 290,
      height: 290,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF090A0D),
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppColors.darkBorder, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLime,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Text('Q',
                        style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                            color: Colors.black)),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'QUESTLY LVL ${widget.snapshot.userLevel}',
                    style: const TextStyle(
                      fontFamily: 'BarlowCondensed',
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                      color: AppColors.primaryLime,
                    ),
                  ),
                ],
              ),
              Text(
                '${widget.snapshot.streakDays}d streak 🔥',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFF806B),
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.darkSecondaryBackground,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.darkBorder),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMetricCol('XP', '${widget.snapshot.totalXp}', AppColors.primaryLime),
                _buildMetricCol('FLOW', '${widget.snapshot.todayFocusMinutes}m', const Color(0xFFA879FF)),
                _buildMetricCol('TASKS', '${widget.snapshot.completedTasks}/${widget.snapshot.totalTasks}', const Color(0xFF42DFFF)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'ACTIVE TIMETABLE CLASS',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF42DFFF),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF171A21),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.darkBorder),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.snapshot.nextClassTitle ?? 'No classes today',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      widget.snapshot.nextClassTime ?? '--',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF42DFFF),
                        fontFamily: 'SpaceMono',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontFamily: 'BarlowCondensed',
            fontWeight: FontWeight.w900,
            fontSize: 16,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
