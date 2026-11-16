import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/quests/presentation/widgets/quest_checklist_card.dart';
import 'package:questly/features/quests/presentation/widgets/quick_task_bottom_sheet.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/questly_button.dart';

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
            border: Border.all(
              color: AppColors.limePrimary.withValues(alpha: 0.3),
            ),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20.0),
                child: Column(
                  children: [
                    const Icon(
                      Icons.checklist_rounded,
                      size: 34,
                      color: AppColors.limePrimary,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'START YOUR REALM FROM 0',
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: AppColors.limePrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Add your first task on priority to earn checklist XP and ignite your streak.',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    QuestlyButton(
                      text: '+ ADD FIRST TASK',
                      icon: Icons.add,
                      size: QuestlyButtonSize.small,
                      variant: QuestlyButtonVariant.primaryLime,
                      onPressed: () => QuickTaskBottomSheet.show(context),
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
