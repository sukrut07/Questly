import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/roadmaps/domain/models/roadmap.dart';
import 'package:questly/features/roadmaps/presentation/widgets/roadmap_path_painter.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class RoadmapDetailScreen extends ConsumerStatefulWidget {
  final String roadmapId;

  const RoadmapDetailScreen({
    super.key,
    required this.roadmapId,
  });

  @override
  ConsumerState<RoadmapDetailScreen> createState() => _RoadmapDetailScreenState();
}

class _RoadmapDetailScreenState extends ConsumerState<RoadmapDetailScreen> {
  Roadmap? _roadmap;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRoadmap();
  }

  Future<void> _loadRoadmap() async {
    setState(() => _isLoading = true);
    final repo = ref.read(roadmapRepositoryProvider);
    final r = await repo.getRoadmapById(widget.roadmapId);
    if (mounted) {
      setState(() {
        _roadmap = r;
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleMilestone(String milestoneId) async {
    final repo = ref.read(roadmapRepositoryProvider);
    await repo.toggleMilestone(widget.roadmapId, milestoneId);
    await _loadRoadmap();
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

    final roadmap = _roadmap;
    if (roadmap == null) {
      return Scaffold(
        backgroundColor: AppColors.darkBase,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(
          child: Text(
            'Roadmap not found',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ),
      );
    }

    final completedCount = roadmap.completedMilestonesCount;
    final totalCount = roadmap.milestones.length;
    final progress = roadmap.progress;

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // Top Bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 20),
                        onPressed: () => context.pop(),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: Text(
                          roadmap.category.toUpperCase(),
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.lavenderAccent,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.limePrimary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.limePrimary.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          '+${roadmap.totalXpReward} XP',
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.limePrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Header Information
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        roadmap.title.toUpperCase(),
                        style: AppTypography.displayMedium.copyWith(
                          fontSize: 26,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        roadmap.description,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),

                      // Progress Card
                      QuestlyCard(
                        borderColor: AppColors.limePrimary.withValues(alpha: 0.3),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'ROADMAP PROGRESS',
                                  style: AppTypography.labelBold.copyWith(
                                    color: AppColors.textSecondary,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                                Text(
                                  '$completedCount / $totalCount COMPLETED (${(progress * 100).toInt()}%)',
                                  style: AppTypography.captionBold.copyWith(
                                    color: AppColors.limePrimary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: progress,
                                minHeight: 8,
                                backgroundColor: AppColors.darkBorder,
                                valueColor: const AlwaysStoppedAnimation(AppColors.limePrimary),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        'JOURNEY PATH',
                        style: AppTypography.headlineSmall.copyWith(
                          color: AppColors.limePrimary,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                    ],
                  ),
                ),
              ),

              // Milestone Timeline List
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final milestone = roadmap.milestones[index];
                      final isLast = index == roadmap.milestones.length - 1;

                      return _MilestoneItem(
                        milestone: milestone,
                        isLast: isLast,
                        onToggle: () => _toggleMilestone(milestone.id),
                        onStartFocus: () => context.push(RoutePaths.focus),
                      );
                    },
                    childCount: roadmap.milestones.length,
                  ),
                ),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: AppSpacing.xxl),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MilestoneItem extends StatelessWidget {
  final RoadmapMilestone milestone;
  final bool isLast;
  final VoidCallback onToggle;
  final VoidCallback onStartFocus;

  const _MilestoneItem({
    required this.milestone,
    required this.isLast,
    required this.onToggle,
    required this.onStartFocus,
  });

  @override
  Widget build(BuildContext context) {
    final isDone = milestone.isCompleted;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step Line & Badge
          SliverTimelineIndicator(
            order: milestone.order,
            isCompleted: isDone,
            isLast: isLast,
          ),
          const SizedBox(width: AppSpacing.md),

          // Milestone Detail Card
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.lg),
              child: QuestlyCard(
                borderColor: isDone
                    ? AppColors.limePrimary.withValues(alpha: 0.4)
                    : AppColors.darkBorder,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'STAGE ${milestone.order}'.toUpperCase(),
                                style: AppTypography.captionBold.copyWith(
                                  color: isDone ? AppColors.limePrimary : AppColors.lavenderAccent,
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                milestone.title,
                                style: AppTypography.titleMedium.copyWith(
                                  decoration: isDone ? TextDecoration.lineThrough : null,
                                  color: isDone ? AppColors.textSecondary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isDone
                                ? AppColors.limePrimary.withValues(alpha: 0.15)
                                : AppColors.lavenderAccent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '+${milestone.xpReward} XP',
                            style: AppTypography.captionBold.copyWith(
                              color: isDone ? AppColors.limePrimary : AppColors.lavenderAccent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      milestone.description,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),

                    if (milestone.subtasks.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.sm),
                      ...milestone.subtasks.map((st) => Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(
                              children: [
                                Icon(
                                  isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                                  size: 14,
                                  color: isDone ? AppColors.limePrimary : AppColors.textTertiary,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    st,
                                    style: AppTypography.caption.copyWith(
                                      color: isDone ? AppColors.textSecondary : AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )),
                    ],

                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Expanded(
                          child: QuestlyButton(
                            text: isDone ? 'COMPLETED' : 'MARK COMPLETE',
                            icon: isDone ? Icons.check : Icons.done_all,
                            variant: isDone ? QuestlyButtonVariant.darkOutline : QuestlyButtonVariant.primaryLime,
                            size: QuestlyButtonSize.small,
                            onPressed: onToggle,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        QuestlyButton(
                          text: 'FOCUS',
                          icon: Icons.timer_outlined,
                          variant: QuestlyButtonVariant.secondaryLavender,
                          size: QuestlyButtonSize.small,
                          onPressed: onStartFocus,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SliverTimelineIndicator extends StatelessWidget {
  final int order;
  final bool isCompleted;
  final bool isLast;

  const SliverTimelineIndicator({
    super.key,
    required this.order,
    required this.isCompleted,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isCompleted ? AppColors.limePrimary : AppColors.darkCard,
            shape: BoxShape.circle,
            border: Border.all(
              color: isCompleted ? AppColors.limePrimary : AppColors.darkBorder,
              width: 2,
            ),
            boxShadow: isCompleted
                ? [
                    BoxShadow(
                      color: AppColors.limePrimary.withValues(alpha: 0.35),
                      blurRadius: 8,
                      spreadRadius: 1,
                    )
                  ]
                : null,
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, size: 18, color: AppColors.darkBase)
                : Text(
                    '$order',
                    style: AppTypography.captionBold.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
          ),
        ),
        if (!isLast)
          Expanded(
            child: Container(
              width: 3,
              margin: const EdgeInsets.symmetric(vertical: 4),
              color: isCompleted ? AppColors.limePrimary : AppColors.darkBorder,
            ),
          ),
      ],
    );
  }
}
