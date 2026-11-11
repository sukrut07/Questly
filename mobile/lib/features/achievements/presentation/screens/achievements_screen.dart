import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/stat_badge.dart';

class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final badges = [
      {'title': 'First Quest Done', 'desc': 'Completed your very first quest.', 'xp': '+50 XP', 'unlocked': true},
      {'title': '3-Day Momentum', 'desc': 'Kept your habit streak active for 3 days.', 'xp': '+100 XP', 'unlocked': true},
      {'title': 'Focus Master', 'desc': 'Accumulate 120 minutes of deep focus sprints.', 'xp': '+150 XP', 'unlocked': false},
      {'title': 'Citadel Architect', 'desc': 'Reach 20 days streak in the Living World.', 'xp': '+300 XP', 'unlocked': false},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Achievements & Badges'),
      ),
      body: ListView.separated(
        padding: AppSpacing.screenPadding,
        itemCount: badges.length,
        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
        itemBuilder: (context, index) {
          final b = badges[index];
          final unlocked = b['unlocked'] as bool;

          return AppCard(
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: unlocked
                        ? AppColors.darkAccent.withValues(alpha: 0.15)
                        : (isDark ? AppColors.darkElevatedSurface : AppColors.lightElevatedSurface),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    border: Border.all(
                      color: unlocked
                          ? AppColors.darkAccent
                          : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ),
                  ),
                  child: Icon(
                    unlocked ? Icons.emoji_events_rounded : Icons.lock_outline_rounded,
                    color: unlocked ? AppColors.darkAccent : AppColors.darkTextMuted,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        b['title'] as String,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        b['desc'] as String,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                StatBadge(
                  label: b['xp'] as String,
                  color: unlocked ? AppColors.darkAccent : AppColors.darkTextMuted,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
