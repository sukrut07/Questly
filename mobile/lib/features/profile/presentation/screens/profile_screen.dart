import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/core/constants/app_constants.dart';
import 'package:questly/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/shared/models/user_profile.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/stat_badge.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _showEditProfileDialog(
    BuildContext context,
    WidgetRef ref,
    UserProfile profile,
  ) {
    final nameController = TextEditingController(text: profile.displayName);
    final titleController = TextEditingController(text: profile.title);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161922),
        title: const Text(
          'Edit Profile & Aspirations',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'DISPLAY NAME',
              style: TextStyle(
                fontSize: 10,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            TextField(
              controller: nameController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.darkCard,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text(
              'SCHOLAR TITLE / GOAL',
              style: TextStyle(
                fontSize: 10,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            TextField(
              controller: titleController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.darkCard,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.limePrimary,
              foregroundColor: AppColors.darkBase,
            ),
            onPressed: () async {
              final newName = nameController.text.trim();
              final newTitle = titleController.text.trim();
              if (newName.isNotEmpty) {
                await ref.read(dashboardRepositoryProvider).updateProfile(
                  displayName: newName,
                  title: newTitle.isNotEmpty ? newTitle : null,
                );
                ref.read(dashboardStateProvider.notifier).refresh();
              }
              if (ctx.mounted) Navigator.of(ctx).pop();
            },
            child: const Text(
              'SAVE',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  void _showResetConfirmDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1313),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.error),
            SizedBox(width: 8),
            Text(
              'Start Realm from 0?',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: const Text(
          'This will clear all active quests, roadmaps, notes, focus history, and reset your level to Level 1 (0 XP) so you can input everything from scratch.\n\nThis cannot be undone.',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              await ref.read(questRepositoryProvider).clearAll();
              await ref.read(roadmapRepositoryProvider).clearAll();
              await ref.read(notebookRepositoryProvider).clearAll();
              await ref.read(focusRepositoryProvider).clearAll();
              await ref.read(dashboardRepositoryProvider).resetToZero();

              ref.read(dashboardStateProvider.notifier).refresh();
              ref.invalidate(analyticsDataProvider);

              if (ctx.mounted) Navigator.of(ctx).pop();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'All maps and metrics reset to 0! Ready for your custom input.',
                    ),
                    backgroundColor: AppColors.limePrimary,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            child: const Text(
              'CONFIRM RESET TO 0',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final dashboardAsync = ref.watch(dashboardStateProvider);
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Adventurer Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.pushNamed(RouteNames.settings),
            tooltip: 'Settings',
          ),
        ],
      ),
      body: dashboardAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (data) {
          final profile = data.profile;

          return ListView(
            padding: AppSpacing.screenPadding,
            children: [
              // Profile Header Card
              AppCard(
                hasGlow: true,
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AppColors.primaryGradient,
                        border: Border.all(
                          color: isDark
                              ? AppColors.darkBorder
                              : AppColors.lightBorder,
                          width: 2.5,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.person_rounded,
                          size: 44,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          profile.displayName,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: isDark
                                ? AppColors.darkTextPrimary
                                : AppColors.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        IconButton(
                          icon: const Icon(
                            Icons.edit_outlined,
                            size: 18,
                            color: AppColors.limePrimary,
                          ),
                          onPressed: () => _showEditProfileDialog(
                            context,
                            ref,
                            profile,
                          ),
                          tooltip: 'Edit Profile & Title',
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xxs),
                    Text(
                      profile.title,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        StatBadge(
                          label: 'Level ${profile.level}',
                          color: AppColors.darkAccent,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        StatBadge(
                          label: profile.currentStage.stageName,
                          color: AppColors.darkPrimary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        StatBadge(
                          label: '${profile.totalXp} Total XP',
                          color: AppColors.darkSecondary,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Appearance & Settings Section
              Text(
                'Preferences & Display',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),

              AppCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(
                        isDark
                            ? Icons.dark_mode_rounded
                            : Icons.light_mode_rounded,
                        color: AppColors.darkPrimary,
                      ),
                      title: const Text('Dark Mode Theme'),
                      subtitle: Text(
                        themeMode == ThemeMode.dark
                            ? 'Dark Mode Active'
                            : 'Light Mode Active',
                      ),
                      trailing: Switch(
                        value: isDark,
                        onChanged: (_) {
                          ref.read(themeModeProvider.notifier).toggleTheme();
                        },
                        activeThumbColor: AppColors.darkPrimary,
                      ),
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(
                        Icons.account_tree_rounded,
                        color: AppColors.limePrimary,
                      ),
                      title: const Text('Skill Tree & Mastery'),
                      subtitle: const Text(
                        'RPG perk progression & mastery branches',
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => context.push(RoutePaths.skillTree),
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(
                        Icons.videogame_asset_rounded,
                        color: AppColors.lavenderAccent,
                      ),
                      title: const Text('Mind Snap Arcade'),
                      subtitle: const Text(
                        'Fast cognitive duels & mental breaks',
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => context.push(RoutePaths.arcade),
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(
                        Icons.emoji_events_outlined,
                        color: AppColors.darkAccent,
                      ),
                      title: const Text('Achievements & Badges'),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => context.pushNamed(RouteNames.achievements),
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(
                        Icons.notifications_none_rounded,
                        color: AppColors.darkSecondary,
                      ),
                      title: const Text('Notification Preferences'),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => context.pushNamed(RouteNames.notifications),
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(
                        Icons.tune_rounded,
                        color: Color(0xFF67B8FF),
                      ),
                      title: const Text('Application Settings'),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => context.pushNamed(RouteNames.settings),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Danger Zone: Reset Realm to 0
              Text(
                'Data & Realm Control',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.error,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),

              AppCard(
                borderColor: AppColors.error.withValues(alpha: 0.35),
                padding: EdgeInsets.zero,
                child: ListTile(
                  leading: const Icon(
                    Icons.restart_alt_rounded,
                    color: AppColors.error,
                  ),
                  title: const Text(
                    'Reset Realm to Zero (Start from 0)',
                    style: TextStyle(
                      color: AppColors.error,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: const Text(
                    'Clear all quests, roadmaps, notes, focus history & XP to 0',
                  ),
                  trailing: const Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.error,
                  ),
                  onTap: () => _showResetConfirmDialog(context, ref),
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              Center(
                child: Text(
                  'Questly Mobile v${AppConstants.appVersion}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.darkTextMuted
                        : AppColors.lightTextMuted,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
