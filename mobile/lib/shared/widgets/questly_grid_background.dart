import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';

class QuestlyGridBackground extends StatelessWidget {
  final Widget child;
  final bool showGrid;

  const QuestlyGridBackground({
    super.key,
    required this.child,
    this.showGrid = true,
  });

  @override
  Widget build(BuildContext context) {
    if (!showGrid) return child;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gridColor = isDark
        ? AppColors.primaryLime.withValues(alpha: 0.035)
        : Colors.black.withValues(alpha: 0.03);

    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: _GridPatternPainter(gridColor: gridColor),
          ),
        ),
        child,
      ],
    );
  }
}

class _GridPatternPainter extends CustomPainter {
  final Color gridColor;
  final double step;

  const _GridPatternPainter({
    required this.gridColor,
    this.step = 32.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = gridColor
      ..strokeWidth = 1.0;

    // Draw vertical grid lines
    for (double x = 0; x <= size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Draw horizontal grid lines
    for (double y = 0; y <= size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _GridPatternPainter oldDelegate) =>
      oldDelegate.gridColor != gridColor || oldDelegate.step != step;
}
