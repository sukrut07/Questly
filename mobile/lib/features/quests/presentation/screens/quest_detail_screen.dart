import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class QuestDetailScreen extends ConsumerStatefulWidget {
  final String questId;

  const QuestDetailScreen({super.key, required this.questId});

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Quest Completed! +${_quest!.xpReward} XP earned!'),
          backgroundColor: AppColors.limePrimary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.darkBase,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.limePrimary),
        ),
      );
    }

    if (_quest == null) {
      return Scaffold(
        backgroundColor: AppColors.darkBase,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(
              Icons.arrow_back_ios_new,
              color: AppColors.textPrimary,
            ),
            onPressed: () => context.pop(),
          ),
          title: const Text('Quest Not Found'),
        ),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'This mission does not exist or was deleted.',
                style: TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.md),
              QuestlyButton(text: 'GO BACK', onPressed: () => context.pop()),
            ],
          ),
        ),
      );
    }

    final quest = _quest!;
    final isDone = quest.status == QuestStatus.completed;
    final completedCount = quest.subtasks.where((s) => s.isCompleted).length;
    final totalCount = quest.subtasks.length;
    final progress = totalCount > 0 ? completedCount / totalCount : 0.0;

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              // Top Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.textPrimary,
                      size: 20,
                    ),
                    onPressed: () => context.pop(),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.limePrimary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.limePrimary.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Text(
                      '+${quest.xpReward} XP REWARD',
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.limePrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),

              // Banner Hero Card
              QuestlyCard(
                borderColor: isDone
                    ? AppColors.limePrimary
                    : AppColors.darkBorder,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          quest.category.icon,
                          size: 16,
                          color: AppColors.limePrimary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          quest.category.displayName.toUpperCase(),
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.limePrimary,
                            letterSpacing: 1.0,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.lavenderAccent.withValues(
                              alpha: 0.15,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            quest.difficulty.displayName.toUpperCase(),
                            style: AppTypography.captionBold.copyWith(
                              fontSize: 10,
                              color: AppColors.lavenderAccent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      quest.title.toUpperCase(),
                      style: AppTypography.displayMedium.copyWith(
                        fontSize: 26,
                        letterSpacing: 0.8,
                        decoration: isDone ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    if (quest.description.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        quest.description,
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.md),

                    // Progress Track
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'SUBTASKS COMPLETED',
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                        Text(
                          '$completedCount / $totalCount (${(progress * 100).toInt()}%)',
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.limePrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 6,
                        backgroundColor: AppColors.darkBorder,
                        valueColor: const AlwaysStoppedAnimation(
                          AppColors.limePrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Action Buttons Row: Focus Mode & Link Note
              Row(
                children: [
                  Expanded(
                    child: QuestlyButton(
                      text: 'START DEEP FOCUS',
                      icon: Icons.timer_outlined,
                      variant: QuestlyButtonVariant.primaryLime,
                      size: QuestlyButtonSize.medium,
                      onPressed: () => context.push(RoutePaths.focus),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  QuestlyButton(
                    text: 'NOTE',
                    icon: Icons.edit_note,
                    variant: QuestlyButtonVariant.darkOutline,
                    size: QuestlyButtonSize.medium,
                    onPressed: () {
                      final noteId =
                          'note_${DateTime.now().millisecondsSinceEpoch}';
                      context.push(
                        RoutePaths.noteEditor.replaceAll(':id', noteId),
                      );
                    },
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.lg),

              // Subtasks Checklist
              Text(
                'CHECKLIST ITEMS',
                style: AppTypography.labelBold.copyWith(
                  color: AppColors.textSecondary,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),

              if (quest.subtasks.isEmpty)
                const QuestlyCard(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 12.0),
                    child: Text(
                      'No subtasks for this quest. Tap Claim below once completed!',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                  ),
                )
              else
                ...quest.subtasks.map((sub) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                    child: QuestlyCard(
                      borderColor: sub.isCompleted
                          ? AppColors.limePrimary.withValues(alpha: 0.35)
                          : AppColors.darkBorder,
                      onTap: () => _toggleSubtask(sub.id),
                      child: Row(
                        children: [
                          Icon(
                            sub.isCompleted
                                ? Icons.check_circle_rounded
                                : Icons.radio_button_unchecked,
                            color: sub.isCompleted
                                ? AppColors.limePrimary
                                : AppColors.textTertiary,
                            size: 20,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Text(
                              sub.title,
                              style: AppTypography.bodyMedium.copyWith(
                                decoration: sub.isCompleted
                                    ? TextDecoration.lineThrough
                                    : null,
                                color: sub.isCompleted
                                    ? AppColors.textSecondary
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),

              const SizedBox(height: AppSpacing.xl),

              if (!isDone)
                QuestlyButton(
                  text: 'CLAIM & COMPLETE QUEST (+${quest.xpReward} XP)',
                  icon: Icons.check_circle_outline_rounded,
                  variant: QuestlyButtonVariant.primaryLime,
                  size: QuestlyButtonSize.large,
                  onPressed: _completeQuest,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
