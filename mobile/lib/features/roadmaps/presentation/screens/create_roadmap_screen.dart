import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/roadmaps/domain/models/roadmap.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';

class CreateRoadmapScreen extends ConsumerStatefulWidget {
  const CreateRoadmapScreen({super.key});

  @override
  ConsumerState<CreateRoadmapScreen> createState() =>
      _CreateRoadmapScreenState();
}

class _CreateRoadmapScreenState extends ConsumerState<CreateRoadmapScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _category = 'Engineering';

  final List<TextEditingController> _milestoneControllers = [
    TextEditingController(text: 'Phase 1: Fundamentals & Environment Setup'),
    TextEditingController(text: 'Phase 2: Core Architecture & Implementation'),
    TextEditingController(text: 'Phase 3: Integration & Testing Sprint'),
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    for (final c in _milestoneControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _addMilestone() {
    setState(() {
      _milestoneControllers.add(
        TextEditingController(
          text: 'Phase ${_milestoneControllers.length + 1}: Next Milestone',
        ),
      );
    });
  }

  void _removeMilestone(int index) {
    if (_milestoneControllers.length <= 1) return;
    setState(() {
      _milestoneControllers.removeAt(index);
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final repo = ref.read(roadmapRepositoryProvider);
    final milestones = <RoadmapMilestone>[];

    for (int i = 0; i < _milestoneControllers.length; i++) {
      milestones.add(
        RoadmapMilestone(
          id: 'ms_${DateTime.now().millisecondsSinceEpoch}_$i',
          order: i + 1,
          title: _milestoneControllers[i].text.trim(),
          description: 'Milestone stage ${i + 1}',
          xpReward: 100 + (i * 25),
        ),
      );
    }

    final newRoadmap = Roadmap(
      id: 'roadmap_${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      category: _category,
      startDate: DateTime.now(),
      targetCompletionDate: DateTime.now().add(const Duration(days: 90)),
      milestones: milestones,
    );

    await repo.saveRoadmap(newRoadmap);

    if (mounted) {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBase,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: AppColors.textPrimary,
            size: 20,
          ),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'CREATE ROADMAP',
          style: AppTypography.titleLarge.copyWith(letterSpacing: 1.0),
        ),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              Text(
                'ROADMAP DETAILS',
                style: AppTypography.captionBold.copyWith(
                  color: AppColors.limePrimary,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextFormField(
                controller: _titleController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Title',
                  labelStyle: const TextStyle(color: AppColors.textSecondary),
                  hintText: 'e.g., Cloud Native DevOps Specialist',
                  hintStyle: const TextStyle(color: AppColors.textTertiary),
                  filled: true,
                  fillColor: AppColors.darkCard,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
                validator: (val) => val == null || val.trim().isEmpty
                    ? 'Please enter a title'
                    : null,
              ),
              const SizedBox(height: AppSpacing.md),
              TextFormField(
                controller: _descController,
                maxLines: 2,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Description',
                  labelStyle: const TextStyle(color: AppColors.textSecondary),
                  hintText: 'What is the end outcome of this learning path?',
                  hintStyle: const TextStyle(color: AppColors.textTertiary),
                  filled: true,
                  fillColor: AppColors.darkCard,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              DropdownButtonFormField<String>(
                initialValue: _category,
                dropdownColor: AppColors.darkCard,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Category',
                  labelStyle: const TextStyle(color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.darkCard,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'Engineering',
                    child: Text('Engineering'),
                  ),
                  DropdownMenuItem(
                    value: 'Computer Science',
                    child: Text('Computer Science'),
                  ),
                  DropdownMenuItem(
                    value: 'Artificial Intelligence',
                    child: Text('Artificial Intelligence'),
                  ),
                  DropdownMenuItem(
                    value: 'Academics',
                    child: Text('Academics'),
                  ),
                  DropdownMenuItem(
                    value: 'Personal Growth',
                    child: Text('Personal Growth'),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _category = val);
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'MILESTONES & STAGES',
                    style: AppTypography.captionBold.copyWith(
                      color: AppColors.limePrimary,
                      letterSpacing: 1.2,
                    ),
                  ),
                  TextButton.icon(
                    icon: const Icon(
                      Icons.add,
                      size: 16,
                      color: AppColors.lavenderAccent,
                    ),
                    label: Text(
                      'ADD STAGE',
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.lavenderAccent,
                      ),
                    ),
                    onPressed: _addMilestone,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),

              ...List.generate(_milestoneControllers.length, (idx) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: QuestlyCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundColor: AppColors.limePrimary.withValues(
                            alpha: 0.2,
                          ),
                          child: Text(
                            '${idx + 1}',
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.limePrimary,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: TextFormField(
                            controller: _milestoneControllers[idx],
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 14,
                            ),
                            decoration: const InputDecoration(
                              isDense: true,
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        if (_milestoneControllers.length > 1)
                          IconButton(
                            icon: const Icon(
                              Icons.close,
                              size: 18,
                              color: AppColors.textTertiary,
                            ),
                            onPressed: () => _removeMilestone(idx),
                          ),
                      ],
                    ),
                  ),
                );
              }),

              const SizedBox(height: AppSpacing.xl),
              QuestlyButton(
                text: 'CREATE ROADMAP',
                icon: Icons.check,
                variant: QuestlyButtonVariant.primaryLime,
                size: QuestlyButtonSize.large,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
