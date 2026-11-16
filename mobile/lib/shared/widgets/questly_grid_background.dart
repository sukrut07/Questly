import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';

class QuestlyGridBackground extends StatefulWidget {
  final Widget child;
  final bool showGrid;
  final double gridStep;
  final bool enableAnimation;

  const QuestlyGridBackground({
    super.key,
    required this.child,
    this.showGrid = true,
    this.gridStep = 32.0,
    this.enableAnimation = true,
  });

  @override
  State<QuestlyGridBackground> createState() => _QuestlyGridBackgroundState();
}

class _QuestlyGridBackgroundState extends State<QuestlyGridBackground>
    with SingleTickerProviderStateMixin {
  AnimationController? _controller;

  @override
  void initState() {
    super.initState();
    if (widget.enableAnimation) {
      _controller = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 8),
      )..repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(covariant QuestlyGridBackground oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enableAnimation != oldWidget.enableAnimation) {
      if (widget.enableAnimation) {
        _controller ??= AnimationController(
          vsync: this,
          duration: const Duration(seconds: 8),
        )..repeat(reverse: true);
      } else {
        _controller?.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.showGrid) return widget.child;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_controller == null || !widget.enableAnimation) {
      final baseGridColor = isDark
          ? AppColors.primaryLime.withValues(alpha: 0.04)
          : Colors.black.withValues(alpha: 0.03);

      return Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                gridColor: baseGridColor,
                step: widget.gridStep,
                animProgress: 0.0,
                isDark: isDark,
              ),
            ),
          ),
          widget.child,
        ],
      );
    }

    return AnimatedBuilder(
      animation: _controller!,
      builder: (context, child) {
        final animValue = _controller!.value;
        final alpha = isDark
            ? (0.035 + (0.025 * math.sin(animValue * math.pi)))
            : (0.025 + (0.015 * math.sin(animValue * math.pi)));
        final gridColor = isDark
            ? AppColors.primaryLime.withValues(alpha: alpha)
            : Colors.black.withValues(alpha: alpha);

        return Stack(
          children: [
            // Ambient Floating Neon Orbs
            Positioned.fill(
              child: CustomPaint(
                painter: _AmbientGlowPainter(
                  animValue: animValue,
                  isDark: isDark,
                ),
              ),
            ),
            // Cyber Grid Overlay with breathing lines & crosshair dots
            Positioned.fill(
              child: CustomPaint(
                painter: _GridPatternPainter(
                  gridColor: gridColor,
                  step: widget.gridStep,
                  animProgress: animValue,
                  isDark: isDark,
                ),
              ),
            ),
            widget.child,
          ],
        );
      },
    );
  }
}

class _AmbientGlowPainter extends CustomPainter {
  final double animValue;
  final bool isDark;

  const _AmbientGlowPainter({required this.animValue, required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    if (!isDark) return; // Keep crisp and clean on light mode

    // 1. Electric Lime drifting ambient glow top-left
    final limeCenterX =
        size.width * (0.2 + 0.1 * math.sin(animValue * 2 * math.pi));
    final limeCenterY =
        size.height * (0.15 + 0.08 * math.cos(animValue * 2 * math.pi));
    final limeRadius = math.min(size.width, size.height) * 0.45;

    final limePaint = Paint()
      ..shader =
          RadialGradient(
            colors: [
              AppColors.limePrimary.withValues(alpha: 0.045),
              AppColors.limePrimary.withValues(alpha: 0.0),
            ],
          ).createShader(
            Rect.fromCircle(
              center: Offset(limeCenterX, limeCenterY),
              radius: limeRadius,
            ),
          );

    canvas.drawCircle(Offset(limeCenterX, limeCenterY), limeRadius, limePaint);

    // 2. Lavender / Violet drifting ambient glow bottom-right
    final violetCenterX =
        size.width * (0.8 - 0.12 * math.cos(animValue * 2 * math.pi));
    final violetCenterY =
        size.height * (0.65 + 0.1 * math.sin(animValue * 2 * math.pi));
    final violetRadius = math.min(size.width, size.height) * 0.5;

    final violetPaint = Paint()
      ..shader =
          RadialGradient(
            colors: [
              AppColors.lavenderAccent.withValues(alpha: 0.04),
              AppColors.lavenderAccent.withValues(alpha: 0.0),
            ],
          ).createShader(
            Rect.fromCircle(
              center: Offset(violetCenterX, violetCenterY),
              radius: violetRadius,
            ),
          );

    canvas.drawCircle(
      Offset(violetCenterX, violetCenterY),
      violetRadius,
      violetPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _AmbientGlowPainter oldDelegate) {
    return oldDelegate.animValue != animValue || oldDelegate.isDark != isDark;
  }
}

class _GridPatternPainter extends CustomPainter {
  final Color gridColor;
  final double step;
  final double animProgress;
  final bool isDark;

  const _GridPatternPainter({
    required this.gridColor,
    required this.step,
    required this.animProgress,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = gridColor
      ..strokeWidth = 1.0;

    // Draw vertical lines
    for (double x = 0; x <= size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), linePaint);
    }

    // Draw horizontal lines
    for (double y = 0; y <= size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
    }

    // Draw subtle intersecting crosshair dots on grid nodes
    if (isDark) {
      final dotPaint = Paint()
        ..color = AppColors.limePrimary.withValues(
          alpha: 0.12 + 0.08 * math.sin(animProgress * math.pi),
        );

      final dotStep = step * 2; // Every 2nd intersection for visual elegance
      for (double x = step; x < size.width; x += dotStep) {
        for (double y = step; y < size.height; y += dotStep) {
          canvas.drawCircle(Offset(x, y), 1.0, dotPaint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant _GridPatternPainter oldDelegate) {
    return oldDelegate.gridColor != gridColor ||
        oldDelegate.step != step ||
        oldDelegate.animProgress != animProgress;
  }
}
