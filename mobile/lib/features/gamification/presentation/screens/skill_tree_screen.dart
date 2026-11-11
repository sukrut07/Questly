import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/gamification/data/repositories/skill_tree_repository.dart';
import 'package:questly/features/gamification/domain/models/skill_tree.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class SkillTreeScreen extends StatefulWidget {
  const SkillTreeScreen({super.key});

  @override
  State<SkillTreeScreen> createState() => _SkillTreeScreenState();
}

class _SkillTreeScreenState extends State<SkillTreeScreen> {
  final _repository = SkillTreeRepository();
  SkillBranch? _selectedBranch;

  @override
  Widget build(BuildContext context) {
    final allNodes = _repository.getSkillNodes();
    final nodes = _selectedBranch == null
        ? allNodes
        : allNodes.where((n) => n.branch == _selectedBranch).toList();

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(
                        Icons.arrow_back_ios_new,
                        color: AppColors.textPrimary,
                        size: 20,
                      ),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SKILL TREE & MASTERY',
                          style: AppTypography.titleLarge.copyWith(
                            letterSpacing: 1.0,
                          ),
                        ),
                        Text(
                          'Unlock RPG passive perks via real productivity milestones',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Branch Selector Pills
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  children: [
                    FilterChip(
                      label: const Text('ALL BRANCHES'),
                      labelStyle: TextStyle(
                        color: _selectedBranch == null
                            ? AppColors.darkBase
                            : AppColors.textPrimary,
                        fontWeight: _selectedBranch == null
                            ? FontWeight.bold
                            : FontWeight.normal,
                        fontSize: 11,
                      ),
                      selected: _selectedBranch == null,
                      onSelected: (_) => setState(() => _selectedBranch = null),
                      backgroundColor: AppColors.darkCard,
                      selectedColor: AppColors.limePrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: _selectedBranch == null
                              ? AppColors.limePrimary
                              : AppColors.darkBorder,
                        ),
                      ),
                      showCheckmark: false,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    ...SkillBranch.values.map((branch) {
                      final isSelected = _selectedBranch == branch;
                      return Padding(
                        padding: const EdgeInsets.only(right: AppSpacing.xs),
                        child: FilterChip(
                          avatar: Icon(
                            branch.icon,
                            size: 14,
                            color: isSelected
                                ? AppColors.darkBase
                                : AppColors.limePrimary,
                          ),
                          label: Text(branch.displayName.toUpperCase()),
                          labelStyle: TextStyle(
                            color: isSelected
                                ? AppColors.darkBase
                                : AppColors.textPrimary,
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal,
                            fontSize: 11,
                          ),
                          selected: isSelected,
                          onSelected: (_) => setState(() {
                            _selectedBranch = isSelected ? null : branch;
                          }),
                          backgroundColor: AppColors.darkCard,
                          selectedColor: AppColors.limePrimary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(
                              color: isSelected
                                  ? AppColors.limePrimary
                                  : AppColors.darkBorder,
                            ),
                          ),
                          showCheckmark: false,
                        ),
                      );
                    }),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.sm),

              // Nodes List
              Expanded(
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: nodes.length,
                  itemBuilder: (context, index) {
                    final node = nodes[index];
                    final isComplete = node.progressPercent >= 1.0;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: QuestlyCard(
                        borderColor: isComplete
                            ? AppColors.limePrimary.withValues(alpha: 0.5)
                            : node.isUnlocked
                            ? AppColors.lavenderAccent.withValues(alpha: 0.4)
                            : AppColors.darkBorder,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      node.branch.icon,
                                      size: 16,
                                      color: AppColors.lavenderAccent,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      node.branch.displayName.toUpperCase(),
                                      style: AppTypography.captionBold.copyWith(
                                        color: AppColors.lavenderAccent,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: node.isUnlocked
                                        ? AppColors.limePrimary.withValues(
                                            alpha: 0.15,
                                          )
                                        : AppColors.darkBorder,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    node.isUnlocked
                                        ? 'REQ LVL ${node.requiredLevel}'
                                        : 'LOCKED',
                                    style: AppTypography.captionBold.copyWith(
                                      color: node.isUnlocked
                                          ? AppColors.limePrimary
                                          : AppColors.textTertiary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              node.name.toUpperCase(),
                              style: AppTypography.titleMedium.copyWith(
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              node.description,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.sm),

                            // Progress Bar
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'PROGRESS',
                                  style: AppTypography.captionBold.copyWith(
                                    color: AppColors.textTertiary,
                                    fontSize: 10,
                                  ),
                                ),
                                Text(
                                  '${node.currentProgress}/${node.maxProgress} (${(node.progressPercent * 100).toInt()}%)',
                                  style: AppTypography.captionBold.copyWith(
                                    color: isComplete
                                        ? AppColors.limePrimary
                                        : AppColors.textSecondary,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: node.progressPercent,
                                minHeight: 6,
                                backgroundColor: AppColors.darkBorder,
                                valueColor: AlwaysStoppedAnimation(
                                  isComplete
                                      ? AppColors.limePrimary
                                      : AppColors.lavenderAccent,
                                ),
                              ),
                            ),

                            if (node.cosmeticReward != null) ...[
                              const SizedBox(height: AppSpacing.sm),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.stars,
                                    size: 14,
                                    color: AppColors.limePrimary,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'UNLOCKS: ${node.cosmeticReward!.toUpperCase()}',
                                    style: AppTypography.captionBold.copyWith(
                                      color: AppColors.limePrimary,
                                      fontSize: 10,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
