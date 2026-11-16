import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_text_field.dart';
import 'package:questly/shared/widgets/questly_button.dart';

class QuickTaskBottomSheet extends ConsumerStatefulWidget {
  final VoidCallback? onCreated;

  const QuickTaskBottomSheet({super.key, this.onCreated});

  static Future<void> show(BuildContext context, {VoidCallback? onCreated}) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => QuickTaskBottomSheet(onCreated: onCreated),
    );
  }

  @override
  ConsumerState<QuickTaskBottomSheet> createState() =>
      _QuickTaskBottomSheetState();
}

class _QuickTaskBottomSheetState extends ConsumerState<QuickTaskBottomSheet> {
  final _titleController = TextEditingController();
  QuestCategory _selectedCategory = QuestCategory.study;
  QuestPriority _selectedPriority = QuestPriority.high;
  final QuestDifficulty _selectedDifficulty = QuestDifficulty.medium;
  int _estimatedMinutes = 30;
  bool _isSaving = false;

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  int get _xpReward => XpProgressionEngine.calculateTaskChecklistXp(
    priority: _selectedPriority,
    difficulty: _selectedDifficulty,
    estimatedMinutes: _estimatedMinutes,
  );

  Future<void> _handleSave() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    setState(() => _isSaving = true);

    final newQuest = Quest(
      id: 'quest_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      category: _selectedCategory,
      priority: _selectedPriority,
      difficulty: _selectedDifficulty,
      estimatedMinutes: _estimatedMinutes,
      xpReward: _xpReward,
      createdAt: DateTime.now(),
      status: QuestStatus.notStarted,
    );

    final repo = ref.read(questRepositoryProvider);
    await repo.createQuest(newQuest);

    if (mounted) {
      Navigator.of(context).pop();
      if (widget.onCreated != null) {
        widget.onCreated!();
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Task added: "$title" (+${newQuest.xpReward} XP)'),
          backgroundColor: AppColors.limePrimary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.lg,
        AppSpacing.lg + bottomInset,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF111319),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: AppColors.darkBorder, width: 1.5),
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'NEW ACADEMIC TASK',
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.limePrimary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '+$_xpReward XP',
                    style: AppTypography.captionBold.copyWith(
                      color: AppColors.limePrimary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _titleController,
              hintText: 'e.g. Solve LeetCode DP problem, Read paper...',
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'CATEGORY',
              style: AppTypography.captionBold.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children:
                  [
                    QuestCategory.study,
                    QuestCategory.coding,
                    QuestCategory.work,
                    QuestCategory.reading,
                  ].map((cat) {
                    final isSelected = _selectedCategory == cat;
                    return ChoiceChip(
                      label: Text(cat.displayName),
                      selected: isSelected,
                      selectedColor: AppColors.limePrimary,
                      backgroundColor: AppColors.darkCard,
                      labelStyle: TextStyle(
                        color: isSelected ? AppColors.darkBase : Colors.white,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.normal,
                        fontSize: 12,
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _selectedCategory = cat);
                      },
                    );
                  }).toList(),
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'PRIORITY & CHECKLIST REWARD',
                  style: AppTypography.captionBold.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  _selectedPriority == QuestPriority.urgent
                      ? 'HIGH XP MULTIPLIER (+20 BONUS)'
                      : _selectedPriority == QuestPriority.high
                      ? 'PRIORITY BOOST (+10 BONUS)'
                      : 'STANDARD XP',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: _selectedPriority.color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: QuestPriority.values.map((p) {
                final isSelected = _selectedPriority == p;
                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        p == QuestPriority.urgent
                            ? Icons.local_fire_department_rounded
                            : p == QuestPriority.high
                            ? Icons.priority_high_rounded
                            : Icons.flag_rounded,
                        size: 13,
                        color: isSelected ? AppColors.darkBase : p.color,
                      ),
                      const SizedBox(width: 4),
                      Text(p.displayName.toUpperCase()),
                    ],
                  ),
                  selected: isSelected,
                  selectedColor: p.color,
                  backgroundColor: AppColors.darkCard,
                  side: BorderSide(
                    color: isSelected ? p.color : AppColors.darkBorder,
                  ),
                  labelStyle: TextStyle(
                    color: isSelected ? AppColors.darkBase : Colors.white,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                    fontSize: 11,
                  ),
                  onSelected: (val) {
                    if (val) setState(() => _selectedPriority = p);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'ESTIMATED DURATION',
              style: AppTypography.captionBold.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [15, 25, 45, 60].map((mins) {
                final isSelected = _estimatedMinutes == mins;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: isSelected
                            ? AppColors.limePrimary.withValues(alpha: 0.2)
                            : AppColors.darkCard,
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.limePrimary
                              : AppColors.darkBorder,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                      onPressed: () => setState(() => _estimatedMinutes = mins),
                      child: Text(
                        '${mins}m',
                        style: TextStyle(
                          color: isSelected
                              ? AppColors.limePrimary
                              : Colors.white,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: AppSpacing.lg),
            QuestlyButton(
              text: 'CREATE TASK (+$_xpReward XP)',
              icon: Icons.add_task_rounded,
              size: QuestlyButtonSize.large,
              isFullWidth: true,
              isLoading: _isSaving,
              onPressed: _handleSave,
            ),
          ],
        ),
      ),
    );
  }
}
