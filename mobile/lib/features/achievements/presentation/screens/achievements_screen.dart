import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class AchievementsScreen extends ConsumerStatefulWidget {
  const AchievementsScreen({super.key});

  @override
  ConsumerState<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends ConsumerState<AchievementsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> _computeDynamicBadges({
    required int completedQuests,
    required int streakDays,
    required int focusMinutes,
    required int totalXp,
  }) {
    return [
      {
        'title': 'First Quest Victor',
        'desc': 'Complete your very first mission.',
        'category': 'Quests',
        'xp': '+50 XP',
        'tier': 'Bronze',
        'unlocked': completedQuests >= 1,
        'progress': '${math.min(completedQuests, 1)}/1 quests',
      },
      {
        'title': '7-Day Momentum',
        'desc': 'Maintain an active daily streak for 7 continuous days.',
        'category': 'Streaks',
        'xp': '+150 XP',
        'tier': 'Silver',
        'unlocked': streakDays >= 7,
        'progress': '${math.min(streakDays, 7)}/7 days',
      },
      {
        'title': 'Deep Work Initiate',
        'desc': 'Accumulate 120 minutes of distraction-free focus sessions.',
        'category': 'Focus',
        'xp': '+200 XP',
        'tier': 'Gold',
        'unlocked': focusMinutes >= 120,
        'progress': '${math.min(focusMinutes, 120)}/120m',
      },
      {
        'title': 'Citadel Architect',
        'desc': 'Complete an entire 7-stage learning journey roadmap.',
        'category': 'Roadmaps',
        'xp': '+350 XP',
        'tier': 'Diamond',
        'unlocked': totalXp >= 1000,
        'progress': '${math.min((totalXp ~/ 150), 7)}/7 stages',
      },
      {
        'title': 'Grandmaster Flow',
        'desc': 'Accumulate 250+ focus minutes in deep flow state.',
        'category': 'Focus',
        'xp': '+500 XP',
        'tier': 'Legendary',
        'unlocked': focusMinutes >= 250,
        'progress': '${math.min(focusMinutes, 250)}/250m',
      },
      {
        'title': 'Speed Mind Prodigy',
        'desc': 'Earn 100+ XP across focus sessions and arcade games.',
        'category': 'Arcade',
        'xp': '+250 XP',
        'tier': 'Gold',
        'unlocked': totalXp >= 100,
        'progress': '${math.min(totalXp, 100)}/100 XP',
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    final dashboardAsync = ref.watch(dashboardStateProvider);
    final analyticsAsync = ref.watch(analyticsDataProvider);

    final completedQuests =
        analyticsAsync.asData?.value.totalQuestsCompleted ?? 0;
    final streakDays = dashboardAsync.asData?.value.streak.currentStreak ?? 0;
    final focusMinutes = analyticsAsync.asData?.value.focusMinutesTotal ?? 0;
    final totalXp = dashboardAsync.asData?.value.profile.totalXp ?? 0;

    final allBadges = _computeDynamicBadges(
      completedQuests: completedQuests,
      streakDays: streakDays,
      focusMinutes: focusMinutes,
      totalXp: totalXp,
    );
    final unlockedCount = allBadges.where((b) => b['unlocked'] as bool).length;

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
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
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TROPHIES & BADGES',
                            style: AppTypography.titleLarge.copyWith(
                              letterSpacing: 1.0,
                            ),
                          ),
                          Text(
                            'Earn exclusive badges across streaks, focus & roadmaps',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.limePrimary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppColors.limePrimary.withValues(alpha: 0.4),
                        ),
                      ),
                      child: Text(
                        '$unlockedCount / ${allBadges.length} UNLOCKED',
                        style: AppTypography.captionBold.copyWith(
                          color: AppColors.limePrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Filter Tabs
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.limePrimary,
                  indicatorWeight: 3,
                  labelColor: AppColors.limePrimary,
                  unselectedLabelColor: AppColors.textSecondary,
                  labelStyle: AppTypography.labelBold.copyWith(fontSize: 11),
                  unselectedLabelStyle: AppTypography.labelMedium.copyWith(
                    fontSize: 11,
                  ),
                  dividerColor: AppColors.darkBorder,
                  tabs: const [
                    Tab(text: 'ALL'),
                    Tab(text: 'FOCUS'),
                    Tab(text: 'STREAKS'),
                    Tab(text: 'QUESTS'),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xs),

              // Badges Grid
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildBadgeList(allBadges),
                    _buildBadgeList(
                      allBadges.where((b) => b['category'] == 'Focus').toList(),
                    ),
                    _buildBadgeList(
                      allBadges
                          .where((b) => b['category'] == 'Streaks')
                          .toList(),
                    ),
                    _buildBadgeList(
                      allBadges
                          .where((b) => b['category'] == 'Quests')
                          .toList(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadgeList(List<Map<String, dynamic>> badges) {
    if (badges.isEmpty) {
      return Center(
        child: Text(
          'No trophies in this tier yet.',
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      );
    }

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: badges.length,
      itemBuilder: (context, index) {
        final b = badges[index];
        final unlocked = b['unlocked'] as bool;
        final tier = b['tier'] as String;

        final tierColor = switch (tier) {
          'Bronze' => const Color(0xFFCD7F32),
          'Silver' => const Color(0xFFC0C0C0),
          'Gold' => const Color(0xFFFFD700),
          'Diamond' => const Color(0xFF67B8FF),
          'Legendary' => AppColors.limePrimary,
          _ => AppColors.limePrimary,
        };

        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: QuestlyCard(
            borderColor: unlocked
                ? tierColor.withValues(alpha: 0.5)
                : AppColors.darkBorder,
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: unlocked
                        ? tierColor.withValues(alpha: 0.15)
                        : AppColors.darkBase,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: unlocked ? tierColor : AppColors.darkBorder,
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: Icon(
                      unlocked
                          ? Icons.emoji_events_rounded
                          : Icons.lock_outline_rounded,
                      color: unlocked ? tierColor : AppColors.textTertiary,
                      size: 26,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              (b['title'] as String).toUpperCase(),
                              style: AppTypography.titleMedium.copyWith(
                                fontWeight: FontWeight.bold,
                                color: unlocked
                                    ? AppColors.textPrimary
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: tierColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              tier.toUpperCase(),
                              style: AppTypography.captionBold.copyWith(
                                fontSize: 9,
                                color: tierColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        b['desc'] as String,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'PROGRESS: ${b['progress']}',
                            style: AppTypography.captionBold.copyWith(
                              fontSize: 10,
                              color: AppColors.textTertiary,
                            ),
                          ),
                          Text(
                            b['xp'] as String,
                            style: AppTypography.captionBold.copyWith(
                              fontSize: 11,
                              color: unlocked
                                  ? AppColors.limePrimary
                                  : AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
