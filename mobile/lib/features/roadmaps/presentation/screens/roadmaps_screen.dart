import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/roadmaps/domain/models/roadmap.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class RoadmapsScreen extends ConsumerStatefulWidget {
  const RoadmapsScreen({super.key});

  @override
  ConsumerState<RoadmapsScreen> createState() => _RoadmapsScreenState();
}

class _RoadmapsScreenState extends ConsumerState<RoadmapsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Roadmap> _activeRoadmaps = [];
  List<Roadmap> _templates = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final repo = ref.read(roadmapRepositoryProvider);
    final active = await repo.getRoadmaps();
    final templates = await repo.getTemplates();
    if (mounted) {
      setState(() {
        _activeRoadmaps = active;
        _templates = templates;
        _isLoading = false;
      });
    }
  }

  Future<void> _cloneTemplate(Roadmap template) async {
    final repo = ref.read(roadmapRepositoryProvider);
    final newRoadmap = template.copyWith(
      id: 'roadmap_${DateTime.now().millisecondsSinceEpoch}',
      startDate: DateTime.now(),
      targetCompletionDate: DateTime.now().add(const Duration(days: 90)),
      milestones: template.milestones
          .map((m) => m.copyWith(isCompleted: false))
          .toList(),
    );
    await repo.saveRoadmap(newRoadmap);
    await _loadData();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${template.title} added to your journeys!'),
          backgroundColor: AppColors.limePrimary,
          behavior: SnackBarBehavior.floating,
        ),
      );
      _tabController.animateTo(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) => [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.md,
                    AppSpacing.md,
                    AppSpacing.xs,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'ROADMAPS',
                            style: AppTypography.displayMedium.copyWith(
                              letterSpacing: 1.2,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.lavenderAccent.withValues(
                                alpha: 0.15,
                              ),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.lavenderAccent.withValues(
                                  alpha: 0.4,
                                ),
                              ),
                            ),
                            child: Text(
                              '${_activeRoadmaps.length} ACTIVE',
                              style: AppTypography.captionBold.copyWith(
                                color: AppColors.lavenderAccent,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        'Visual goal paths, milestone checkpoints & structured mastery',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      TabBar(
                        controller: _tabController,
                        indicatorColor: AppColors.limePrimary,
                        indicatorWeight: 3,
                        labelColor: AppColors.limePrimary,
                        unselectedLabelColor: AppColors.textSecondary,
                        labelStyle: AppTypography.labelBold.copyWith(
                          letterSpacing: 1.0,
                        ),
                        unselectedLabelStyle: AppTypography.labelMedium,
                        dividerColor: AppColors.darkBorder,
                        tabs: const [
                          Tab(text: 'MY JOURNEYS'),
                          Tab(text: 'TEMPLATES'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
            body: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.limePrimary,
                    ),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [_buildActiveRoadmapsTab(), _buildTemplatesTab()],
                  ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.limePrimary,
        foregroundColor: AppColors.darkBase,
        icon: const Icon(Icons.add, size: 20),
        label: Text(
          'NEW ROADMAP',
          style: AppTypography.labelBold.copyWith(color: AppColors.darkBase),
        ),
        onPressed: () =>
            context.push(RoutePaths.createRoadmap).then((_) => _loadData()),
      ),
    );
  }

  Widget _buildActiveRoadmapsTab() {
    if (_activeRoadmaps.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.alt_route,
              size: 54,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'NO ACTIVE ROADMAPS',
              style: AppTypography.headlineSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select a template or create your own custom milestone path.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _activeRoadmaps.length,
      itemBuilder: (context, index) {
        final rm = _activeRoadmaps[index];
        final progress = rm.progress;
        final isComplete = progress >= 1.0;

        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: QuestlyCard(
            borderColor: isComplete
                ? AppColors.limePrimary.withValues(alpha: 0.5)
                : AppColors.darkBorder,
            onTap: () => context
                .push(RoutePaths.roadmapDetail.replaceAll(':id', rm.id))
                .then((_) => _loadData()),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.lavenderAccent.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        rm.category.toUpperCase(),
                        style: AppTypography.captionBold.copyWith(
                          color: AppColors.lavenderAccent,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                    Text(
                      '+${rm.totalXpReward} XP',
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.limePrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  rm.title.toUpperCase(),
                  style: AppTypography.titleLarge.copyWith(letterSpacing: 0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  rm.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),

                // Milestones dots & progress
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${rm.completedMilestonesCount}/${rm.milestones.length} MILESTONES',
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '${(progress * 100).toInt()}%',
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
                const SizedBox(height: AppSpacing.md),

                // Footer CTA
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'TAP TO EXPLORE JOURNEY',
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.limePrimary,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const Icon(
                      Icons.arrow_forward,
                      size: 16,
                      color: AppColors.limePrimary,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTemplatesTab() {
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _templates.length,
      itemBuilder: (context, index) {
        final t = _templates[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: QuestlyCard(
            borderColor: AppColors.darkBorder,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.limePrimary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'TEMPLATE',
                        style: AppTypography.captionBold.copyWith(
                          color: AppColors.limePrimary,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                    Text(
                      '${t.milestones.length} STAGES',
                      style: AppTypography.captionBold.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  t.title.toUpperCase(),
                  style: AppTypography.titleLarge.copyWith(letterSpacing: 0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  t.description,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                QuestlyButton(
                  text: 'START THIS JOURNEY',
                  icon: Icons.play_arrow,
                  variant: QuestlyButtonVariant.primaryLime,
                  size: QuestlyButtonSize.medium,
                  onPressed: () => _cloneTemplate(t),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
