import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/empty_state.dart';
import 'package:questly/shared/widgets/stat_badge.dart';

class QuestsScreen extends ConsumerStatefulWidget {
  const QuestsScreen({super.key});

  @override
  ConsumerState<QuestsScreen> createState() => _QuestsScreenState();
}

class _QuestsScreenState extends ConsumerState<QuestsScreen> {
  QuestCategory? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final questRepo = ref.watch(questRepositoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quest Journal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            onPressed: () => context.pushNamed(RouteNames.createQuest),
            tooltip: 'Create Quest',
          ),
        ],
      ),
      body: FutureBuilder<List<Quest>>(
        future: questRepo.getQuests(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final allQuests = snapshot.data ?? [];
          final filtered = _selectedCategory == null
              ? allQuests
              : allQuests.where((q) => q.category == _selectedCategory).toList();

          return Column(
            children: [
              // Category filter pills
              SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  children: [
                    FilterChip(
                      label: const Text('All Categories'),
                      selected: _selectedCategory == null,
                      onSelected: (_) => setState(() => _selectedCategory = null),
                      backgroundColor: isDark ? AppColors.darkCardSurface : AppColors.lightCardSurface,
                      selectedColor: AppColors.darkPrimary.withValues(alpha: 0.25),
                      checkmarkColor: AppColors.darkPrimary,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    ...QuestCategory.values.map((cat) {
                      return Padding(
                        padding: const EdgeInsets.only(right: AppSpacing.xs),
                        child: FilterChip(
                          avatar: Icon(cat.icon, size: 16),
                          label: Text(cat.displayName),
                          selected: _selectedCategory == cat,
                          onSelected: (_) => setState(() {
                            _selectedCategory = _selectedCategory == cat ? null : cat;
                          }),
                          backgroundColor:
                              isDark ? AppColors.darkCardSurface : AppColors.lightCardSurface,
                          selectedColor: AppColors.darkPrimary.withValues(alpha: 0.25),
                          checkmarkColor: AppColors.darkPrimary,
                        ),
                      );
                    }),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xs),

              // List of Quests
              Expanded(
                child: filtered.isEmpty
                    ? EmptyState(
                        icon: Icons.explore_off_rounded,
                        title: 'No Quests Found',
                        description: 'Create a new quest to begin your productivity adventure!',
                        actionLabel: 'Create Quest',
                        onAction: () => context.pushNamed(RouteNames.createQuest),
                      )
                    : ListView.separated(
                        padding: AppSpacing.screenPadding,
                        itemCount: filtered.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
                        itemBuilder: (context, index) {
                          final quest = filtered[index];
                          return AppCard(
                            onTap: () => context.pushNamed(
                              RouteNames.questDetail,
                              pathParameters: {'id': quest.id},
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      quest.category.icon,
                                      size: 18,
                                      color: isDark ? AppColors.darkPrimary : AppColors.lightPrimary,
                                    ),
                                    const SizedBox(width: AppSpacing.xs),
                                    Expanded(
                                      child: Text(
                                        quest.title,
                                        style: theme.textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.w700,
                                          color: isDark
                                              ? AppColors.darkTextPrimary
                                              : AppColors.lightTextPrimary,
                                        ),
                                      ),
                                    ),
                                    StatBadge(
                                      label: '+${quest.xpReward} XP',
                                      color: AppColors.darkAccent,
                                    ),
                                  ],
                                ),
                                if (quest.description.isNotEmpty) ...[
                                  const SizedBox(height: AppSpacing.xs),
                                  Text(
                                    quest.description,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: isDark
                                          ? AppColors.darkTextSecondary
                                          : AppColors.lightTextSecondary,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: AppSpacing.sm),
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
                                    const Spacer(),
                                    Text(
                                      '${quest.subtasks.where((s) => s.isCompleted).length}/${quest.subtasks.length} tasks',
                                      style: theme.textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
