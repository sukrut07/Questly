import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/core/extensions/context_extensions.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_button.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/stat_badge.dart';

class QuestDetailScreen extends ConsumerStatefulWidget {
  final String questId;

  const QuestDetailScreen({
    super.key,
    required this.questId,
  });

  @override
  ConsumerState<QuestDetailScreen> createState() => _QuestDetailScreenState();
}

class _QuestDetailScreenState extends ConsumerState<QuestDetailScreen> {
  Quest? _quest;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadQuest();
  }

  Future<void> _loadQuest() async {
    setState(() => _isLoading = true);
    final repo = ref.read(questRepositoryProvider);
    final q = await repo.getQuestById(widget.questId);
    if (mounted) {
      setState(() {
        _quest = q;
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleSubtask(String subtaskId) async {
    if (_quest == null) return;
    final repo = ref.read(questRepositoryProvider);
    final updated = await repo.toggleSubtask(_quest!.id, subtaskId);
    ref.read(dashboardStateProvider.notifier).refresh();
    setState(() => _quest = updated);
  }

  Future<void> _completeQuest() async {
    if (_quest == null) return;
    final repo = ref.read(questRepositoryProvider);
    final updated = await repo.completeQuest(_quest!.id);
    ref.read(dashboardStateProvider.notifier).refresh();
    setState(() => _quest = updated);
    if (mounted) {
      context.showSnackBar('🎉 Quest completed! +${_quest!.xpReward} XP earned!');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_quest == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Quest Not Found')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('This quest does not exist or was deleted.'),
              const SizedBox(height: AppSpacing.md),
              AppButton(label: 'Back', onPressed: () => context.pop()),
            ],
          ),
        ),
      );
    }

    final quest = _quest!;

    return Scaffold(
      appBar: AppBar(
        title: Text(quest.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () => context.showSnackBar('Sharing quest...'),
          ),
        ],
      ),
      body: ListView(
        padding: AppSpacing.screenPadding,
        children: [
          // Banner Card
          AppCard(
            hasGlow: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    StatBadge(
                      label: quest.category.displayName,
                      icon: quest.category.icon,
                      color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                    ),
                    StatBadge(
                      label: '+${quest.xpReward} XP Reward',
                      icon: Icons.bolt_rounded,
                      color: AppColors.darkAccent,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  quest.title,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                  ),
                ),
                if (quest.description.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    quest.description,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    StatBadge(
                      label: quest.difficulty.displayName,
                      color: quest.difficulty.badgeColor,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    StatBadge(
                      label: quest.status.displayName,
                      color: quest.status == QuestStatus.completed
                          ? AppColors.darkSuccess
                          : AppColors.darkTextMuted,
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Subtasks Header
          Text(
            'Quest Milestones (${quest.subtasks.where((s) => s.isCompleted).length}/${quest.subtasks.length})',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: AppSpacing.xs),

          if (quest.subtasks.isEmpty)
            AppCard(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: Text(
                  'No subtasks for this quest. Mark it complete when done!',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
              ),
            )
          else
            ...quest.subtasks.map((sub) {
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                child: AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  onTap: () => _toggleSubtask(sub.id),
                  child: Row(
                    children: [
                      Checkbox(
                        value: sub.isCompleted,
                        onChanged: (_) => _toggleSubtask(sub.id),
                        activeColor: AppColors.darkSuccess,
                      ),
                      Expanded(
                        child: Text(
                          sub.title,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            decoration: sub.isCompleted ? TextDecoration.lineThrough : null,
                            color: sub.isCompleted
                                ? (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted)
                                : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

          const SizedBox(height: AppSpacing.xl),

          if (quest.status != QuestStatus.completed)
            AppButton(
              label: 'Claim & Complete Quest (+${quest.xpReward} XP)',
              leadingIcon: Icons.check_circle_outline_rounded,
              onPressed: _completeQuest,
              isFullWidth: true,
            ),
        ],
      ),
    );
  }
}
