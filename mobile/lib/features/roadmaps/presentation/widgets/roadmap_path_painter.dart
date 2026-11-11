import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';

class MilestoneNodePosition {
  final Offset center;
  final bool isCompleted;
  final bool isActive;
  final int order;

  const MilestoneNodePosition({
    required this.center,
    required this.isCompleted,
    required this.isActive,
    required this.order,
  });
}

class RoadmapSerpentinePainter extends CustomPainter {
  final List<MilestoneNodePosition> nodes;
  final double progress; // 0.0 to 1.0

  RoadmapSerpentinePainter({required this.nodes, this.progress = 1.0});

  @override
  void paint(Canvas canvas, Size size) {
    if (nodes.isEmpty) return;

    // Track road width
    const double trackWidth = 8.0;

    // 1. Draw base road path
    final basePath = Path();
    basePath.moveTo(nodes.first.center.dx, nodes.first.center.dy);

    for (int i = 0; i < nodes.length - 1; i++) {
      final p1 = nodes[i].center;
      final p2 = nodes[i + 1].center;
      final midY = (p1.dy + p2.dy) / 2;

      // Cubic bezier creating a smooth S-curve
      basePath.cubicTo(p1.dx, midY, p2.dx, midY, p2.dx, p2.dy);
    }

    // Paint dark base road track
    final basePaint = Paint()
      ..color = AppColors.darkBorder
      ..strokeWidth = trackWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(basePath, basePaint);

    // 2. Draw completed progress path in electric lime
    int lastCompletedIndex = -1;
    for (int i = 0; i < nodes.length; i++) {
      if (nodes[i].isCompleted) {
        lastCompletedIndex = i;
      }
    }

    if (lastCompletedIndex >= 0) {
      final completedPath = Path();
      completedPath.moveTo(nodes.first.center.dx, nodes.first.center.dy);

      for (int i = 0; i < lastCompletedIndex; i++) {
        final p1 = nodes[i].center;
        final p2 = nodes[i + 1].center;
        final midY = (p1.dy + p2.dy) / 2;
        completedPath.cubicTo(p1.dx, midY, p2.dx, midY, p2.dx, p2.dy);
      }

      // Glow effect behind completed path
      final glowPaint = Paint()
        ..color = AppColors.limePrimary.withValues(alpha: 0.3)
        ..strokeWidth = trackWidth + 6
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
      canvas.drawPath(completedPath, glowPaint);

      // Solid lime road
      final limePaint = Paint()
        ..color = AppColors.limePrimary
        ..strokeWidth = trackWidth
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;
      canvas.drawPath(completedPath, limePaint);
    }

    // 3. Draw nodes
    for (final node in nodes) {
      final center = node.center;
      const double radius = 18.0;

      if (node.isCompleted) {
        // Outer glow
        canvas.drawCircle(
          center,
          radius + 4,
          Paint()
            ..color = AppColors.limePrimary.withValues(alpha: 0.35)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
        );
        // Filled circle
        canvas.drawCircle(
          center,
          radius,
          Paint()..color = AppColors.limePrimary,
        );
        // Checkmark or text
        final textPainter = TextPainter(
          text: const TextSpan(
            text: '✓',
            style: TextStyle(
              color: AppColors.darkBase,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        textPainter.paint(
          canvas,
          Offset(
            center.dx - textPainter.width / 2,
            center.dy - textPainter.height / 2,
          ),
        );
      } else if (node.isActive) {
        // Active lavender pulse
        canvas.drawCircle(
          center,
          radius + 6,
          Paint()
            ..color = AppColors.lavenderAccent.withValues(alpha: 0.4)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6),
        );
        canvas.drawCircle(center, radius, Paint()..color = AppColors.darkCard);
        canvas.drawCircle(
          center,
          radius,
          Paint()
            ..color = AppColors.lavenderAccent
            ..strokeWidth = 3
            ..style = PaintingStyle.stroke,
        );
        // Step number
        final textPainter = TextPainter(
          text: TextSpan(
            text: '${node.order}',
            style: const TextStyle(
              color: AppColors.lavenderAccent,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        textPainter.paint(
          canvas,
          Offset(
            center.dx - textPainter.width / 2,
            center.dy - textPainter.height / 2,
          ),
        );
      } else {
        // Locked / upcoming node
        canvas.drawCircle(center, radius, Paint()..color = AppColors.darkCard);
        canvas.drawCircle(
          center,
          radius,
          Paint()
            ..color = AppColors.darkBorder
            ..strokeWidth = 2
            ..style = PaintingStyle.stroke,
        );
        final textPainter = TextPainter(
          text: TextSpan(
            text: '${node.order}',
            style: const TextStyle(
              color: AppColors.textTertiary,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        textPainter.paint(
          canvas,
          Offset(
            center.dx - textPainter.width / 2,
            center.dy - textPainter.height / 2,
          ),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant RoadmapSerpentinePainter oldDelegate) {
    return oldDelegate.nodes != nodes || oldDelegate.progress != progress;
  }
}
