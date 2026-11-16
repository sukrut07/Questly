import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/quests/presentation/widgets/quest_checklist_card.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_card.dart';

class ActiveQuestsSection extends ConsumerWidget {
  final List<Quest> quests;

  const ActiveQuestsSection({super.key, required this.quests});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                color: isDark
                    ? AppColors.darkTextPrimary
                    : AppColors.lightTextPrimary,
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
                      color: isDark
                          ? AppColors.darkPrimary
                          : AppColors.lightPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xxs),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 12,
                    color: isDark
                        ? AppColors.darkPrimary
                        : AppColors.lightPrimary,
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
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: quests.take(3).length,
            itemBuilder: (context, index) {
              final quest = quests[index];
              return QuestChecklistCard(
                quest: quest,
                onChanged: () =>
                    ref.read(dashboardStateProvider.notifier).refresh(),
              );
            },
          ),
      ],
    );
  }
}
