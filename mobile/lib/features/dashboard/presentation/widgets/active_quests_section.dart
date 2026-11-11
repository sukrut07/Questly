import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/stat_badge.dart';

class ActiveQuestsSection extends StatelessWidget {
  final List<Quest> quests;

  const ActiveQuestsSection({
    super.key,
    required this.quests,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Active Quests',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
            ),
            TextButton(
              onPressed: () => context.goNamed(RouteNames.quests),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'View all (${quests.length})',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xxs),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 12,
                    color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xs),

        if (quests.isEmpty)
          AppCard(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24.0),
                child: Column(
                  children: [
                    const Icon(
                      Icons.flag_outlined,
                      size: 32,
                      color: AppColors.darkTextMuted,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'No active quests right now',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: quests.take(3).length,
            separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final quest = quests[index];
              return _QuestItemCard(quest: quest);
            },
          ),
      ],
    );
  }
}

class _QuestItemCard extends StatelessWidget {
  final Quest quest;

  const _QuestItemCard({required this.quest});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      onTap: () => context.pushNamed(
        RouteNames.questDetail,
        pathParameters: {'id': quest.id},
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category Icon Container
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkElevatedSurface : AppColors.lightElevatedSurface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                child: Icon(
                  quest.category.icon,
                  size: 20,
                  color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                ),
              ),

              const SizedBox(width: AppSpacing.sm),

              // Title and Description
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quest.title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (quest.description.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        quest.description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),

              // XP Reward Badge
              StatBadge(
                label: '+${quest.xpReward} XP',
                icon: Icons.bolt_rounded,
                color: AppColors.darkAccent,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Footer Tags (Category, Difficulty, Estimated Time)
          Row(
            children: [
              StatBadge(
                label: quest.category.displayName,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
              const SizedBox(width: AppSpacing.xs),
              StatBadge(
                label: quest.difficulty.displayName,
                color: quest.difficulty.badgeColor,
              ),
              const Spacer(),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.schedule_rounded,
                    size: 14,
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                  ),
                  const SizedBox(width: AppSpacing.xxs),
                  Text(
                    '${quest.estimatedMinutes}m',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
