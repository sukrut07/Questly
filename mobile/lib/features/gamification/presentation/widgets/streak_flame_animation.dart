import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';

/// A rich, multi-layered undulating procedural flame with drifting ember particles.
class StreakFlameWidget extends StatefulWidget {
  final double size;
  final bool showEmbers;
  final Color? flameTint;

  const StreakFlameWidget({
    super.key,
    this.size = 64.0,
    this.showEmbers = true,
    this.flameTint,
  });

  @override
  State<StreakFlameWidget> createState() => _StreakFlameWidgetState();
}

class _StreakFlameWidgetState extends State<StreakFlameWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<_EmberParticle> _particles = [];
  final math.Random _random = math.Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();

    // Generate initial ember particles
    if (widget.showEmbers) {
      for (int i = 0; i < 8; i++) {
        _particles.add(
          _EmberParticle(
            x: 0.35 + _random.nextDouble() * 0.3,
            y: 0.3 + _random.nextDouble() * 0.7,
            size: 1.5 + _random.nextDouble() * 2.5,
            speed: 0.4 + _random.nextDouble() * 0.6,
            opacity: 0.4 + _random.nextDouble() * 0.6,
            drift: (_random.nextDouble() - 0.5) * 0.2,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final progress = _controller.value;
        return CustomPaint(
          size: Size(widget.size, widget.size),
          painter: _FlamePainter(
            progress: progress,
            particles: _particles,
            tint: widget.flameTint,
          ),
        );
      },
    );
  }
}

class _EmberParticle {
  double x;
  double y;
  double size;
  double speed;
  double opacity;
  double drift;

  _EmberParticle({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.opacity,
    required this.drift,
  });
}

class _FlamePainter extends CustomPainter {
  final double progress;
  final List<_EmberParticle> particles;
  final Color? tint;

  _FlamePainter({
    required this.progress,
    required this.particles,
    this.tint,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final center = Offset(w * 0.5, h * 0.5);

    // 1. Ambient warm radial aura
    final auraRadius = w * 0.55;
    final auraPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          (tint ?? const Color(0xFFFF9F43)).withValues(
            alpha: 0.25 + 0.1 * math.sin(progress * 2 * math.pi),
          ),
          Colors.transparent,
        ],
      ).createShader(Rect.fromCircle(center: center, radius: auraRadius));
    canvas.drawCircle(center, auraRadius, auraPaint);

    // 2. Outer Flame (Deep Amber / Fire Orange)
    final outerFlamePaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.bottomCenter,
        end: Alignment.topCenter,
        colors: [
          const Color(0xFFFF3838),
          tint ?? const Color(0xFFFF9F43),
          const Color(0xFFFFC048),
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    final outerPath = _createFlamePath(
      w: w,
      h: h,
      tipWiggle: math.sin(progress * 2 * math.pi) * (w * 0.08),
      bellyWiggle: math.cos(progress * 2 * math.pi) * (w * 0.04),
      heightFactor: 0.88 + 0.06 * math.sin(progress * 4 * math.pi),
    );
    canvas.drawPath(outerPath, outerFlamePaint);

    // 3. Middle Flame (Bright Gold / Yellow)
    final midFlamePaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.bottomCenter,
        end: Alignment.topCenter,
        colors: [
          Color(0xFFFF9F43),
          Color(0xFFFFD32A),
          Color(0xFFFFF275),
        ],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..style = PaintingStyle.fill;

    const midScale = 0.68;
    final midPath = _createFlamePath(
      w: w * midScale,
      h: h * midScale,
      tipWiggle: math.cos(progress * 2 * math.pi) * (w * 0.05),
      bellyWiggle: math.sin(progress * 2 * math.pi) * (w * 0.03),
      heightFactor: 0.85 + 0.07 * math.cos(progress * 3 * math.pi),
    );
    canvas.save();
    canvas.translate(w * 0.16, h * 0.22);
    canvas.drawPath(midPath, midFlamePaint);
    canvas.restore();

    // 4. Inner White-Hot Core (Pure Spark)
    final corePaint = Paint()
      ..color = Colors.white.withValues(
        alpha: 0.85 + 0.15 * math.sin(progress * 6 * math.pi),
      )
      ..style = PaintingStyle.fill;

    const coreScale = 0.35;
    final corePath = _createFlamePath(
      w: w * coreScale,
      h: h * coreScale,
      tipWiggle: 0,
      bellyWiggle: 0,
      heightFactor: 0.75,
    );
    canvas.save();
    canvas.translate(w * 0.325, h * 0.48);
    canvas.drawPath(corePath, corePaint);
    canvas.restore();

    // 5. Drifting Ember Particles
    for (final p in particles) {
      final currentY = (p.y - (progress * p.speed)) % 1.0;
      final currentX = (p.x + math.sin((progress + p.y) * 2 * math.pi) * p.drift).clamp(0.1, 0.9);
      final fade = (1.0 - currentY).clamp(0.0, 1.0) * p.opacity;

      final emberPaint = Paint()
        ..color = const Color(0xFFFFD32A).withValues(alpha: fade);

      canvas.drawCircle(
        Offset(currentX * w, currentY * h),
        p.size * (w / 64.0),
        emberPaint,
      );
    }
  }

  Path _createFlamePath({
    required double w,
    required double h,
    required double tipWiggle,
    required double bellyWiggle,
    required double heightFactor,
  }) {
    final path = Path();
    final baseY = h * 0.95;
    final tipY = h * (1.0 - heightFactor);
    final tipX = (w * 0.5) + tipWiggle;

    // Start at bottom center
    path.moveTo(w * 0.5, baseY);

    // Left base curve to left belly
    path.cubicTo(
      w * 0.1 - bellyWiggle,
      baseY - (h * 0.15),
      w * 0.05 + bellyWiggle,
      baseY - (h * 0.45),
      w * 0.25,
      baseY - (h * 0.65),
    );

    // Left waist inward curve to tip
    path.cubicTo(
      w * 0.35,
      baseY - (h * 0.78),
      tipX - (w * 0.1),
      tipY + (h * 0.15),
      tipX,
      tipY,
    );

    // Right curve from tip downwards
    path.cubicTo(
      tipX + (w * 0.1),
      tipY + (h * 0.15),
      w * 0.65,
      baseY - (h * 0.78),
      w * 0.75,
      baseY - (h * 0.65),
    );

    // Right belly to base
    path.cubicTo(
      w * 0.95 - bellyWiggle,
      baseY - (h * 0.45),
      w * 0.9 + bellyWiggle,
      baseY - (h * 0.15),
      w * 0.5,
      baseY,
    );

    path.close();
    return path;
  }

  @override
  bool shouldRepaint(covariant _FlamePainter oldDelegate) => true;
}

/// An interactive streak flame badge with live animation & tap-to-celebrate modal.
class StreakFlameBadge extends StatelessWidget {
  final int streakDays;
  final bool showMultiplier;
  final VoidCallback? onTap;

  const StreakFlameBadge({
    super.key,
    required this.streakDays,
    this.showMultiplier = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap ??
          () {
            HapticFeedback.lightImpact();
            StreakFlameDialog.show(
              context,
              streakCount: streakDays,
              xpEarned: 50,
              taskTitle: 'Daily Momentum Maintained',
            );
          },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFFF9F43).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: const Color(0xFFFF9F43).withValues(alpha: 0.35),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFFF9F43).withValues(alpha: 0.15),
              blurRadius: 8,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const StreakFlameWidget(size: 20, showEmbers: false),
            const SizedBox(width: 6),
            Text(
              '$streakDays DAY STREAK',
              style: AppTypography.captionBold.copyWith(
                color: const Color(0xFFFFB86C),
                letterSpacing: 0.8,
                fontSize: 11,
              ),
            ),
            if (showMultiplier) ...[
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                decoration: BoxDecoration(
                  color: AppColors.limePrimary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '1.2x',
                  style: TextStyle(
                    fontFamily: GoogleFonts.spaceMono().fontFamily,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: AppColors.limePrimary,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Full celebration modal ported directly from Next.js `StreakFlameAnimation.tsx`.
class StreakFlameDialog extends StatelessWidget {
  final int streakCount;
  final int xpEarned;
  final String? taskTitle;

  const StreakFlameDialog({
    super.key,
    required this.streakCount,
    this.xpEarned = 50,
    this.taskTitle,
  });

  static Future<void> show(
    BuildContext context, {
    required int streakCount,
    int xpEarned = 50,
    String? taskTitle,
  }) {
    HapticFeedback.heavyImpact();
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => StreakFlameDialog(
        streakCount: streakCount,
        xpEarned: xpEarned,
        taskTitle: taskTitle,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Container(
        width: double.infinity,
        constraints: const BoxConstraints(maxWidth: 380),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1E222D),
              Color(0xFF141720),
              Color(0xFF0C0E14),
            ],
          ),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: const Color(0xFFFF9F43).withValues(alpha: 0.4),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFFF9F43).withValues(alpha: 0.25),
              blurRadius: 36,
              spreadRadius: 4,
            ),
          ],
        ),
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Close Button
            Align(
              alignment: Alignment.topRight,
              child: IconButton(
                icon: const Icon(Icons.close, color: AppColors.textSecondary, size: 20),
                onPressed: () => Navigator.of(context).pop(),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ),

            // Large Animated Flame
            const SizedBox(
              width: 130,
              height: 130,
              child: StreakFlameWidget(size: 130, showEmbers: true),
            ),

            const SizedBox(height: AppSpacing.sm),

            // Streak Pill Tag
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFF9F43).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFFFF9F43).withValues(alpha: 0.35),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.local_fire_department,
                    size: 14,
                    color: Color(0xFFFF9F43),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'STREAK MAINTAINED',
                    style: AppTypography.captionBold.copyWith(
                      color: const Color(0xFFFFB86C),
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xs),

            // Days Strong Title
            Text(
              '$streakCount ${streakCount == 1 ? 'Day' : 'Days'} Strong',
              style: AppTypography.displayMedium.copyWith(
                fontSize: 28,
                letterSpacing: 1.0,
                fontWeight: FontWeight.w900,
              ),
            ),

            if (taskTitle != null) ...[
              const SizedBox(height: 4),
              Text(
                'Completed: $taskTitle',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            const SizedBox(height: AppSpacing.md),

            // Reward Stats Row
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.03),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.darkBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'XP EARNED',
                          style: TextStyle(
                            fontFamily: GoogleFonts.spaceMono().fontFamily,
                            fontSize: 10,
                            color: AppColors.textTertiary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.bolt,
                              size: 16,
                              color: AppColors.limePrimary,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '+$xpEarned XP',
                              style: AppTypography.titleMedium.copyWith(
                                color: AppColors.limePrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.03),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.darkBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'BONUS MULTIPLIER',
                          style: TextStyle(
                            fontFamily: GoogleFonts.spaceMono().fontFamily,
                            fontSize: 10,
                            color: AppColors.textTertiary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.emoji_events,
                              size: 16,
                              color: Color(0xFFFFD32A),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '1.2x Active',
                              style: AppTypography.titleMedium.copyWith(
                                color: const Color(0xFFFFD32A),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Continue Action Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF9F43),
                  foregroundColor: Colors.black,
                  elevation: 6,
                  shadowColor: const Color(0xFFFF9F43).withValues(alpha: 0.4),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () => Navigator.of(context).pop(),
                child: Text(
                  'KEEP THE MOMENTUM',
                  style: AppTypography.labelBold.copyWith(
                    color: Colors.black,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
