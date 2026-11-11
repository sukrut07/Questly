import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/empty_state.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class QuestsScreen extends ConsumerStatefulWidget {
  const QuestsScreen({super.key});

  @override
  ConsumerState<QuestsScreen> createState() => _QuestsScreenState();
}

class _QuestsScreenState extends ConsumerState<QuestsScreen> {
  QuestCategory? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final questRepo = ref.watch(questRepositoryProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.md,
                  AppSpacing.md,
                  AppSpacing.xs,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QUESTS & TASKS',
                          style: AppTypography.displayMedium.copyWith(
                            letterSpacing: 1.2,
                          ),
                        ),
                        Text(
                          'Daily missions, priorities & focus challenges',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.add,
                        color: AppColors.limePrimary,
                        size: 28,
                      ),
                      onPressed: () => context.push(RoutePaths.createQuest),
                    ),
                  ],
                ),
              ),

              // Category filter pills
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  children: [
                    FilterChip(
                      label: const Text('ALL CATEGORIES'),
                      labelStyle: TextStyle(
                        color: _selectedCategory == null
                            ? AppColors.darkBase
                            : AppColors.textPrimary,
                        fontWeight: _selectedCategory == null
                            ? FontWeight.bold
                            : FontWeight.normal,
                        fontSize: 11,
                      ),
                      selected: _selectedCategory == null,
                      onSelected: (_) =>
                          setState(() => _selectedCategory = null),
                      backgroundColor: AppColors.darkCard,
                      selectedColor: AppColors.limePrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: _selectedCategory == null
                              ? AppColors.limePrimary
                              : AppColors.darkBorder,
                        ),
                      ),
                      showCheckmark: false,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    ...QuestCategory.values.map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: AppSpacing.xs),
                        child: FilterChip(
                          avatar: Icon(
                            cat.icon,
                            size: 14,
                            color: isSelected
                                ? AppColors.darkBase
                                : AppColors.textPrimary,
                          ),
                          label: Text(cat.displayName.toUpperCase()),
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
                            _selectedCategory = isSelected ? null : cat;
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

              const SizedBox(height: AppSpacing.xs),

              // List of Quests
              Expanded(
                child: FutureBuilder<List<Quest>>(
                  future: questRepo.getQuests(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.limePrimary,
                        ),
                      );
                    }

                    final allQuests = snapshot.data ?? [];
                    final filtered = _selectedCategory == null
                        ? allQuests
                        : allQuests
                              .where((q) => q.category == _selectedCategory)
                              .toList();

                    if (filtered.isEmpty) {
                      return EmptyState(
                        icon: Icons.explore_off_rounded,
                        title: 'NO QUESTS FOUND',
                        description: 'Create a new mission to begin your productivity adventure!',
                        actionLabel: 'NEW QUEST',
                        onAction: () => context.push(RoutePaths.createQuest),
                      );
                    }

                    return ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final quest = filtered[index];
                        final completedSubtasks = quest.subtasks
                            .where((s) => s.isCompleted)
                            .length;
                        final totalSubtasks = quest.subtasks.length;
                        final isDone = quest.status == QuestStatus.completed;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                          child: QuestlyCard(
                            borderColor: isDone
                                ? AppColors.limePrimary.withValues(alpha: 0.4)
                                : AppColors.darkBorder,
                            onTap: () => context.push(
                              RoutePaths.questDetail.replaceAll(
                                ':id',
                                quest.id,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
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
                                          quest.category.displayName
                                              .toUpperCase(),
                                          style: AppTypography.captionBold
                                              .copyWith(
                                                color: AppColors.limePrimary,
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
                                        color: AppColors.limePrimary.withValues(
                                          alpha: 0.15,
                                        ),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        '+${quest.xpReward} XP',
                                        style: AppTypography.captionBold
                                            .copyWith(
                                              color: AppColors.limePrimary,
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  quest.title.toUpperCase(),
                                  style: AppTypography.titleMedium.copyWith(
                                    fontWeight: FontWeight.bold,
                                    decoration: isDone
                                        ? TextDecoration.lineThrough
                                        : null,
                                  ),
                                ),
                                if (quest.description.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    quest.description,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: AppSpacing.sm),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '$completedSubtasks/$totalSubtasks SUBTASKS',
                                      style: AppTypography.captionBold.copyWith(
                                        color: AppColors.textTertiary,
                                        fontSize: 11,
                                      ),
                                    ),
                                    QuestlyButton(
                                      text: 'FOCUS',
                                      icon: Icons.timer_outlined,
                                      variant: QuestlyButtonVariant.darkOutline,
                                      size: QuestlyButtonSize.small,
                                      onPressed: () =>
                                          context.push(RoutePaths.focus),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.limePrimary,
        foregroundColor: AppColors.darkBase,
        child: const Icon(Icons.add, size: 28),
        onPressed: () => context.push(RoutePaths.createQuest),
      ),
    );
  }
}
