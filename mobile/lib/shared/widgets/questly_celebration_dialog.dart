import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/widgets/questly_button.dart';

class QuestlyCelebrationDialog extends StatefulWidget {
  final String title;
  final int xpReward;
  final String? badge;

  const QuestlyCelebrationDialog({
    super.key,
    required this.title,
    required this.xpReward,
    this.badge,
  });

  static Future<void> show(
    BuildContext context, {
    required String title,
    required int xpReward,
    String? badge,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.75),
      builder: (context) => QuestlyCelebrationDialog(
        title: title,
        xpReward: xpReward,
        badge: badge,
      ),
    );
  }

  @override
  State<QuestlyCelebrationDialog> createState() =>
      _QuestlyCelebrationDialogState();
}

class _QuestlyCelebrationDialogState extends State<QuestlyCelebrationDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          // Confetti explosion background
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return CustomPaint(
                  painter: _ConfettiParticlesPainter(
                    progress: _controller.value,
                  ),
                );
              },
            ),
          ),

          // Main Card
          Container(
            width: double.infinity,
            constraints: const BoxConstraints(maxWidth: 360),
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              color: const Color(0xFF111319),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.limePrimary, width: 2),
              boxShadow: [
                BoxShadow(
                  color: AppColors.limePrimary.withValues(alpha: 0.3),
                  blurRadius: 24,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Trophy / Star Glowing Badge
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.limePrimary.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.limePrimary, width: 2),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.emoji_events_rounded,
                      color: AppColors.limePrimary,
                      size: 40,
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                Text(
                  'TASK COMPLETED!',
                  style: AppTypography.displayMedium.copyWith(
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w900,
                    fontSize: 22,
                  ),
                ),

                const SizedBox(height: AppSpacing.xs),

                Text(
                  widget.title,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: AppSpacing.md),

                // XP Reward Banner
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.limePrimary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '+${widget.xpReward} XP',
                    style: AppTypography.headlineSmall.copyWith(
                      color: AppColors.darkBase,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),

                if (widget.badge != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.lavenderAccent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.lavenderAccent.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.verified_rounded,
                          color: AppColors.lavenderAccent,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          widget.badge!,
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.lavenderAccent,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: AppSpacing.lg),

                QuestlyButton(
                  text: 'CONTINUE',
                  variant: QuestlyButtonVariant.primaryLime,
                  size: QuestlyButtonSize.large,
                  isFullWidth: true,
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ConfettiParticlesPainter extends CustomPainter {
  final double progress;

  _ConfettiParticlesPainter({required this.progress});

  static final List<Color> _colors = [
    AppColors.limePrimary,
    const Color(0xFF42DFFF),
    AppColors.lavenderAccent,
    const Color(0xFFFFD76A),
    const Color(0xFFFF806B),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    if (progress == 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final rand = math.Random(42);

    for (int i = 0; i < 36; i++) {
      final angle = (i * (360 / 36)) * (math.pi / 180);
      final speed = 80 + rand.nextDouble() * 120;
      final distance = speed * progress;

      final dx = center.dx + math.cos(angle) * distance;
      final dy =
          center.dy + math.sin(angle) * distance + (progress * progress * 50);

      final paint = Paint()
        ..color = _colors[i % _colors.length].withValues(
          alpha: (1.0 - progress * 0.7).clamp(0.0, 1.0),
        )
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(dx, dy);
      canvas.rotate(progress * 4 + i);
      canvas.drawRect(const Rect.fromLTWH(-3, -3, 6, 6), paint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _ConfettiParticlesPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
