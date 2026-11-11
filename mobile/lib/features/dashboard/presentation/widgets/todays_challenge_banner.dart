import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';

class TodaysChallengeBanner extends StatelessWidget {
  const TodaysChallengeBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "TODAY'S CHALLENGE",
          style: AppTypography.labelBold.copyWith(
            color: AppColors.textSecondary,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Row(
          children: [
            // Puzzle Duel Tile (Lavender)
            Expanded(
              child: GestureDetector(
                onTap: () => context.push(RoutePaths.arcade),
                child: Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.lavenderAccent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'PUZZLE',
                        style: TextStyle(
                          fontFamily: AppTypography.displayFont,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                          color: AppColors.darkBase,
                        ),
                      ),
                      const Icon(
                        Icons.play_arrow_rounded,
                        color: AppColors.darkBase,
                        size: 26,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),

            // Deep Work Sprint Tile (Lime)
            Expanded(
              child: GestureDetector(
                onTap: () => context.push(RoutePaths.focus),
                child: Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.limePrimary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'FOCUS',
                        style: TextStyle(
                          fontFamily: AppTypography.displayFont,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                          color: AppColors.darkBase,
                        ),
                      ),
                      const Icon(
                        Icons.timer_rounded,
                        color: AppColors.darkBase,
                        size: 24,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
