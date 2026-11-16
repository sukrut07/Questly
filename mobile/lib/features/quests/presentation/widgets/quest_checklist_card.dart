import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_celebration_dialog.dart';

class QuestChecklistCard extends ConsumerStatefulWidget {
  final Quest quest;
  final VoidCallback? onChanged;
  final bool initiallyExpanded;

  const QuestChecklistCard({
    super.key,
    required this.quest,
    this.onChanged,
    this.initiallyExpanded = false,
  });

  @override
  ConsumerState<QuestChecklistCard> createState() => _QuestChecklistCardState();
}

class _QuestChecklistCardState extends ConsumerState<QuestChecklistCard> {
  late bool _isExpanded;
  bool _isAddingSubtask = false;
  final TextEditingController _subtaskController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.initiallyExpanded;
  }

  @override
  void dispose() {
    _subtaskController.dispose();
    super.dispose();
  }

  Future<void> _toggleParentQuest() async {
    HapticFeedback.mediumImpact();
    final repo = ref.read(questRepositoryProvider);
    final isDone = widget.quest.status == QuestStatus.completed;

    if (isDone) {
      await repo.updateQuest(
        widget.quest.copyWith(
          status: QuestStatus.inProgress,
          completedAt: null,
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '-${widget.quest.xpReward} XP (Quest returned to In-Progress)',
            ),
            backgroundColor: AppColors.darkCard,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } else {
      await repo.completeQuest(widget.quest.id);
      if (mounted) {
        QuestlyCelebrationDialog.show(
          context,
          title: widget.quest.title,
          xpReward: widget.quest.xpReward,
          badge:
              '${widget.quest.priority.displayName.toUpperCase()} PRIORITY CLEARED',
        );
      }
    }

    ref.read(dashboardStateProvider.notifier).refresh();
    ref.invalidate(analyticsDataProvider);
    widget.onChanged?.call();
    if (mounted) setState(() {});
  }

  Future<void> _toggleSubtask(String subtaskId) async {
    HapticFeedback.selectionClick();
    final wasCompleted = widget.quest.subtasks.any(
      (s) => s.id == subtaskId && s.isCompleted,
    );
    final subXp = XpProgressionEngine.calculateSubtaskXp(widget.quest.priority);

    final repo = ref.read(questRepositoryProvider);
    final updated = await repo.toggleSubtask(widget.quest.id, subtaskId);

    if (mounted) {
      if (!wasCompleted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.limePrimary,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '+$subXp XP • ${widget.quest.priority.displayName.toUpperCase()} Priority Subtask Checked!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            backgroundColor: const Color(0xFF161E12),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(milliseconds: 1800),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('-$subXp XP (Subtask Unchecked)'),
            backgroundColor: AppColors.darkCard,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(milliseconds: 1500),
          ),
        );
      }
    }

    // If all subtasks are now completed and parent is not, check if user completed the entire quest
    final allDone =
        updated.subtasks.isNotEmpty &&
        updated.subtasks.every((s) => s.isCompleted);

    if (allDone && updated.status != QuestStatus.completed) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('All subtasks completed for "${updated.title}"!'),
            backgroundColor: AppColors.limePrimary,
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(
              label: 'CLAIM +${updated.xpReward} XP',
              textColor: AppColors.darkBase,
              onPressed: () => _toggleParentQuest(),
            ),
          ),
        );
      }
    }

    ref.read(dashboardStateProvider.notifier).refresh();
    ref.invalidate(analyticsDataProvider);
    widget.onChanged?.call();
    if (mounted) setState(() {});
  }

  Future<void> _addSubtask() async {
    final text = _subtaskController.text.trim();
    if (text.isEmpty) return;

    HapticFeedback.lightImpact();
    final repo = ref.read(questRepositoryProvider);
    await repo.addSubtask(widget.quest.id, text);
    _subtaskController.clear();
    setState(() => _isAddingSubtask = false);

    ref.read(dashboardStateProvider.notifier).refresh();
    widget.onChanged?.call();
  }

  Future<void> _deleteSubtask(String subtaskId) async {
    HapticFeedback.lightImpact();
    final repo = ref.read(questRepositoryProvider);
    await repo.deleteSubtask(widget.quest.id, subtaskId);

    ref.read(dashboardStateProvider.notifier).refresh();
    widget.onChanged?.call();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final quest = widget.quest;
    final isDone = quest.status == QuestStatus.completed;
    final completedCount = quest.subtasks.where((s) => s.isCompleted).length;
    final totalCount = quest.subtasks.length;
    final progress = totalCount > 0
        ? completedCount / totalCount
        : (isDone ? 1.0 : 0.0);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: QuestlyCard(
        borderColor: isDone
            ? AppColors.limePrimary.withValues(alpha: 0.45)
            : _isExpanded
            ? AppColors.limePrimary.withValues(alpha: 0.3)
            : AppColors.darkBorder,
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Top Tags & XP Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      quest.category.icon,
                      size: 15,
                      color: isDone
                          ? AppColors.limePrimary
                          : AppColors.limePrimary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      quest.category.displayName.toUpperCase(),
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.limePrimary,
                        letterSpacing: 0.8,
                        fontSize: 10.5,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: quest.priority.color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: quest.priority.color.withValues(alpha: 0.3),
                          width: 0.8,
                        ),
                      ),
                      child: Text(
                        quest.priority.displayName.toUpperCase(),
                        style: TextStyle(
                          fontSize: 9,
                          fontFamily: GoogleFonts.spaceMono().fontFamily,
                          fontWeight: FontWeight.bold,
                          color: quest.priority.color,
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.limePrimary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.limePrimary.withValues(alpha: 0.35),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.bolt,
                        size: 13,
                        color: AppColors.limePrimary,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        '+${quest.xpReward} XP',
                        style: AppTypography.captionBold.copyWith(
                          color: AppColors.limePrimary,
                          fontSize: 10.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.sm),

            // 2. Parent Quest Header Checkbox & Title
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Tactile Parent Checkbox
                GestureDetector(
                  onTap: _toggleParentQuest,
                  child: Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: isDone
                          ? AppColors.limePrimary
                          : Colors.white.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(7),
                      border: Border.all(
                        color: isDone
                            ? AppColors.limePrimary
                            : AppColors.darkBorder,
                        width: 1.5,
                      ),
                      boxShadow: isDone
                          ? [
                              BoxShadow(
                                color: AppColors.limePrimary.withValues(
                                  alpha: 0.35,
                                ),
                                blurRadius: 6,
                              ),
                            ]
                          : null,
                    ),
                    child: isDone
                        ? const Icon(
                            Icons.check_rounded,
                            size: 18,
                            color: AppColors.darkBase,
                          )
                        : null,
                  ),
                ),

                const SizedBox(width: AppSpacing.sm),

                // Quest Title & Description
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        quest.title.toUpperCase(),
                        style: AppTypography.titleMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          decoration: isDone
                              ? TextDecoration.lineThrough
                              : null,
                          color: isDone
                              ? AppColors.textTertiary
                              : AppColors.textPrimary,
                        ),
                      ),
                      if (quest.description.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(
                          quest.description,
                          maxLines: _isExpanded ? 5 : 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.bodySmall.copyWith(
                            color: isDone
                                ? AppColors.textTertiary
                                : AppColors.textSecondary,
                            decoration: isDone
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Accordion Chevron
                if (totalCount > 0 || !_isExpanded)
                  IconButton(
                    icon: AnimatedRotation(
                      turns: _isExpanded ? 0.5 : 0.0,
                      duration: const Duration(milliseconds: 200),
                      child: const Icon(
                        Icons.keyboard_arrow_down_rounded,
                        color: AppColors.textSecondary,
                        size: 24,
                      ),
                    ),
                    onPressed: () => setState(() => _isExpanded = !_isExpanded),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),

            const SizedBox(height: AppSpacing.sm),

            // 3. Subtask Progress Mini Bar
            if (totalCount > 0) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.checklist_rtl_rounded,
                        size: 13,
                        color: isDone
                            ? AppColors.limePrimary
                            : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$completedCount OF $totalCount SUBTASKS DONE',
                        style: TextStyle(
                          fontSize: 10,
                          fontFamily: GoogleFonts.spaceMono().fontFamily,
                          fontWeight: FontWeight.bold,
                          color: isDone
                              ? AppColors.limePrimary
                              : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${(progress * 100).toInt()}%',
                    style: TextStyle(
                      fontSize: 10,
                      fontFamily: GoogleFonts.spaceMono().fontFamily,
                      fontWeight: FontWeight.bold,
                      color: AppColors.limePrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              Container(
                width: double.infinity,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: progress.clamp(0.0, 1.0),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.limePrimary, Color(0xFF42DFFF)],
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
            ],

            // 4. Expanded Subtask Checklist (Nested Model)
            if (_isExpanded) ...[
              const Divider(color: AppColors.darkBorder, height: 16),
              if (quest.subtasks.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Text(
                    'No subtasks yet. Break this quest down into manageable steps!',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textTertiary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                )
              else
                Column(
                  children: quest.subtasks.map((subtask) {
                    final subDone = subtask.isCompleted;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: subDone
                            ? AppColors.limePrimary.withValues(alpha: 0.05)
                            : Colors.white.withValues(alpha: 0.02),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: subDone
                              ? AppColors.limePrimary.withValues(alpha: 0.25)
                              : AppColors.darkBorder.withValues(alpha: 0.5),
                        ),
                      ),
                      child: Row(
                        children: [
                          // Tree Branch Guide Icon
                          const Icon(
                            Icons.subdirectory_arrow_right_rounded,
                            size: 14,
                            color: AppColors.textTertiary,
                          ),
                          const SizedBox(width: 8),

                          // Nested Subcheckbox
                          GestureDetector(
                            onTap: () => _toggleSubtask(subtask.id),
                            child: Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                color: subDone
                                    ? AppColors.limePrimary
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(5),
                                border: Border.all(
                                  color: subDone
                                      ? AppColors.limePrimary
                                      : AppColors.textSecondary,
                                  width: 1.2,
                                ),
                              ),
                              child: subDone
                                  ? const Icon(
                                      Icons.check,
                                      size: 14,
                                      color: AppColors.darkBase,
                                    )
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 10),

                          // Subtask Title
                          Expanded(
                            child: Text(
                              subtask.title,
                              style: AppTypography.bodySmall.copyWith(
                                decoration: subDone
                                    ? TextDecoration.lineThrough
                                    : null,
                                color: subDone
                                    ? AppColors.textTertiary
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ),

                          // Delete Subtask
                          IconButton(
                            icon: const Icon(
                              Icons.close_rounded,
                              size: 14,
                              color: AppColors.textTertiary,
                            ),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => _deleteSubtask(subtask.id),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),

              const SizedBox(height: 8),

              // Inline "Add Subtask" Form
              if (_isAddingSubtask) ...[
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 36,
                        child: TextField(
                          controller: _subtaskController,
                          autofocus: true,
                          style: AppTypography.bodySmall,
                          decoration: InputDecoration(
                            hintText: 'Enter subtask name...',
                            hintStyle: AppTypography.caption.copyWith(
                              color: AppColors.textTertiary,
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 8,
                            ),
                            filled: true,
                            fillColor: AppColors.darkElevatedSurface,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                color: AppColors.limePrimary,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                color: AppColors.darkBorder,
                              ),
                            ),
                          ),
                          onSubmitted: (_) => _addSubtask(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(
                        Icons.check_circle_rounded,
                        color: AppColors.limePrimary,
                        size: 26,
                      ),
                      onPressed: _addSubtask,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.cancel_rounded,
                        color: AppColors.textTertiary,
                        size: 24,
                      ),
                      onPressed: () => setState(() => _isAddingSubtask = false),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
              ] else ...[
                TextButton.icon(
                  onPressed: () => setState(() => _isAddingSubtask = true),
                  icon: const Icon(
                    Icons.add,
                    size: 14,
                    color: AppColors.limePrimary,
                  ),
                  label: Text(
                    '+ ADD SUBTASK',
                    style: TextStyle(
                      fontFamily: GoogleFonts.spaceMono().fontFamily,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.limePrimary,
                    ),
                  ),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: const Size(0, 24),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ],
            ],

            const SizedBox(height: AppSpacing.xs),

            // 5. Card Footer: Focus Action
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.schedule_rounded,
                      size: 13,
                      color: AppColors.textTertiary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '~${quest.estimatedMinutes} MINS',
                      style: TextStyle(
                        fontFamily: GoogleFonts.spaceMono().fontFamily,
                        fontSize: 10,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
                InkWell(
                  onTap: () => context.push(RoutePaths.focus),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.limePrimary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.limePrimary.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.play_arrow_rounded,
                          size: 13,
                          color: AppColors.limePrimary,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          'FOCUS',
                          style: TextStyle(
                            fontFamily: GoogleFonts.spaceMono().fontFamily,
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            color: AppColors.limePrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
