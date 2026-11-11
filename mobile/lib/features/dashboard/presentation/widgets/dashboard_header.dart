import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/core/utils/date_utils.dart';
import 'package:questly/shared/models/user_profile.dart';
import 'package:questly/shared/widgets/questly_xp_indicator.dart';

class DashboardHeader extends StatelessWidget {
  final UserProfile profile;

  const DashboardHeader({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    final greeting = AppDateUtils.getGreeting();

    return Row(
      children: [
        // Avatar with level badge ring (tapping opens Profile)
        GestureDetector(
          onTap: () => context.push(RoutePaths.profile),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.darkCard,
                  border: Border.all(color: AppColors.limePrimary, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.limePrimary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.person_rounded,
                    color: AppColors.limePrimary,
                    size: 26,
                  ),
                ),
              ),
              Positioned(
                bottom: -2,
                right: -2,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 5,
                    vertical: 1,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.lavenderAccent,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.darkBase, width: 1.5),
                  ),
                  child: Text(
                    'L${profile.level}',
                    style: const TextStyle(
                      color: AppColors.darkBase,
                      fontWeight: FontWeight.w900,
                      fontSize: 9,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.sm),

        // Greeting and Display Name
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                greeting.toUpperCase(),
                style: AppTypography.captionBold.copyWith(
                  color: AppColors.lavenderAccent,
                  letterSpacing: 1.2,
                ),
              ),
              Text(
                profile.displayName.toUpperCase(),
                style: AppTypography.titleLarge.copyWith(
                  letterSpacing: 0.8,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),

        // Matiks-style XP Pill
        QuestlyXPIndicator(
          currentXp: profile.totalXp,
          level: profile.level,
          compact: true,
        ),
        const SizedBox(width: AppSpacing.xs),

        // Notification Bell Icon Button
        IconButton(
          icon: const Icon(
            Icons.notifications_none_rounded,
            color: AppColors.textPrimary,
          ),
          onPressed: () => context.push(RoutePaths.notifications),
          tooltip: 'Notifications',
        ),
      ],
    );
  }
}
