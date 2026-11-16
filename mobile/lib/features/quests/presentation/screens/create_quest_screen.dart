import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/core/extensions/context_extensions.dart';
import 'package:questly/core/utils/validators.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_button.dart';
import 'package:questly/shared/widgets/app_text_field.dart';

class CreateQuestScreen extends ConsumerStatefulWidget {
  const CreateQuestScreen({super.key});

  @override
  ConsumerState<CreateQuestScreen> createState() => _CreateQuestScreenState();
}

class _CreateQuestScreenState extends ConsumerState<CreateQuestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _minutesController = TextEditingController(text: '30');

  QuestCategory _category = QuestCategory.coding;
  QuestDifficulty _difficulty = QuestDifficulty.medium;
  QuestPriority _priority = QuestPriority.high;
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _minutesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final minutes = int.tryParse(_minutesController.text.trim()) ?? 30;
      final xp = XpProgressionEngine.calculateTaskChecklistXp(
        priority: _priority,
        difficulty: _difficulty,
        estimatedMinutes: minutes,
      );

      final newQuest = Quest(
        id: 'quest_${DateTime.now().millisecondsSinceEpoch}',
        title: _titleController.text.trim(),
        description: _descController.text.trim(),
        category: _category,
        difficulty: _difficulty,
        priority: _priority,
        estimatedMinutes: minutes,
        xpReward: xp,
        createdAt: DateTime.now(),
      );

      final repo = ref.read(questRepositoryProvider);
      await repo.createQuest(newQuest);

      // Refresh dashboard if active
      ref.read(dashboardStateProvider.notifier).refresh();

      if (mounted) {
        context.showSnackBar(
          '✨ Quest "${newQuest.title}" forged successfully!',
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        context.showSnackBar('Failed to create quest: $e', isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Forge New Quest')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: AppSpacing.screenPadding,
            children: [
              AppTextField(
                controller: _titleController,
                label: 'Quest Title',
                hintText: 'e.g. Master Clean Architecture in Flutter',
                prefixIcon: Icons.flag_rounded,
                validator: (val) =>
                    Validators.required(val, message: 'Title is required'),
              ),
              const SizedBox(height: AppSpacing.md),

              AppTextField(
                controller: _descController,
                label: 'Description (Optional)',
                hintText: 'Define key milestones and target outcomes...',
                prefixIcon: Icons.notes_rounded,
                maxLines: 3,
              ),
              const SizedBox(height: AppSpacing.md),

              // Category Selector
              Text(
                'Category',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              DropdownButtonFormField<QuestCategory>(
                initialValue: _category,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.category_rounded),
                ),
                items: QuestCategory.values.map((cat) {
                  return DropdownMenuItem(
                    value: cat,
                    child: Text(cat.displayName),
                  );
                }).toList(),
                onChanged: (cat) =>
                    setState(() => _category = cat ?? _category),
              ),
              const SizedBox(height: AppSpacing.md),

              // Difficulty Selector
              Text(
                'Difficulty & XP Reward',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              DropdownButtonFormField<QuestDifficulty>(
                initialValue: _difficulty,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.shield_outlined),
                ),
                items: QuestDifficulty.values.map((diff) {
                  return DropdownMenuItem(
                    value: diff,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(diff.displayName),
                        Text(
                          '+${diff.xpReward} XP',
                          style: TextStyle(
                            color: diff.badgeColor,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (diff) =>
                    setState(() => _difficulty = diff ?? _difficulty),
              ),
              const SizedBox(height: AppSpacing.md),

              // Priority Selector (Checklist XP Multiplier)
              Text(
                'Priority & Checklist Multiplier',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              DropdownButtonFormField<QuestPriority>(
                initialValue: _priority,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.flag_rounded),
                ),
                items: QuestPriority.values.map((p) {
                  return DropdownMenuItem(
                    value: p,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(p.displayName),
                        Text(
                          p == QuestPriority.urgent
                              ? 'Urgent (+20 Bonus XP)'
                              : p == QuestPriority.high
                              ? 'High (+10 Bonus XP)'
                              : p == QuestPriority.medium
                              ? 'Normal (1.0x)'
                              : 'Low (0.8x)',
                          style: TextStyle(
                            color: p.color,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (p) => setState(() => _priority = p ?? _priority),
              ),
              const SizedBox(height: AppSpacing.md),

              // Estimated minutes
              AppTextField(
                controller: _minutesController,
                label: 'Estimated Minutes',
                hintText: '30',
                prefixIcon: Icons.timer_outlined,
                keyboardType: TextInputType.number,
                validator: Validators.positiveNumber,
              ),
              const SizedBox(height: AppSpacing.xl),

              AppButton(
                label: 'Forge Quest',
                onPressed: _submit,
                isLoading: _isLoading,
                isFullWidth: true,
                leadingIcon: Icons.auto_awesome_rounded,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
