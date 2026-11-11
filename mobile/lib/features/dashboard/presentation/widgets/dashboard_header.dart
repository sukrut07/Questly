import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/core/utils/date_utils.dart';
import 'package:questly/shared/models/user_profile.dart';
import 'package:questly/shared/widgets/stat_badge.dart';

class DashboardHeader extends StatelessWidget {
  final UserProfile profile;

  const DashboardHeader({
    super.key,
    required this.profile,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final greeting = AppDateUtils.getGreeting();

    return Row(
      children: [
        // Avatar with level badge ring
        Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppColors.primaryGradient,
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  width: 2,
                ),
              ),
              child: const Center(
                child: Icon(
                  Icons.person_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
            Positioned(
              bottom: -4,
              right: -4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.darkAccent,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                  border: Border.all(
                    color: isDark ? AppColors.darkBackground : AppColors.lightBackground,
                    width: 1.5,
                  ),
                ),
                child: Text(
                  'L${profile.level}',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: Colors.black,
                    fontWeight: FontWeight.w800,
                    fontSize: 10,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: AppSpacing.sm),

        // Greeting and Display Name
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$greeting,',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              Text(
                profile.displayName,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),

        // Stage Badge
        StatBadge(
          label: profile.currentStage.stageName,
          icon: Icons.shield_rounded,
          color: AppColors.darkPrimary,
        ),
        const SizedBox(width: AppSpacing.xs),

        // Notification Bell Icon Button
        IconButton(
          icon: Icon(
            Icons.notifications_none_rounded,
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
          onPressed: () => context.pushNamed(RouteNames.notifications),
          tooltip: 'Notifications',
        ),
      ],
    );
  }
}
