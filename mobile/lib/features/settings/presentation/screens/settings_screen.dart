import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/core/constants/app_constants.dart';
import 'package:questly/features/analytics/presentation/providers/analytics_providers.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/shared/widgets/app_card.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: AppSpacing.screenPadding,
        children: [
          Text(
            'General',
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
                  leading: const Icon(
                    Icons.volume_up_outlined,
                    color: AppColors.darkPrimary,
                  ),
                  title: const Text('Sound Effects & Audio'),
                  trailing: Switch(
                    value: true,
                    onChanged: (val) {},
                    activeThumbColor: AppColors.darkPrimary,
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(
                    Icons.vibration_rounded,
                    color: AppColors.darkSecondary,
                  ),
                  title: const Text('Haptic Feedback'),
                  trailing: Switch(
                    value: true,
                    onChanged: (val) {},
                    activeThumbColor: AppColors.darkSecondary,
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(
                    Icons.cloud_sync_outlined,
                    color: AppColors.darkAccent,
                  ),
                  title: const Text('Cloud Synchronization'),
                  subtitle: const Text('Local offline-first mode active'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Data Management & Reset',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.error,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          AppCard(
            border: Border.all(
              color: AppColors.error.withValues(alpha: 0.35),
            ),
            padding: EdgeInsets.zero,
            child: ListTile(
              leading: const Icon(
                Icons.restart_alt_rounded,
                color: AppColors.error,
              ),
              title: const Text(
                'Reset All Data to Zero (Start Fresh)',
                style: TextStyle(
                  color: AppColors.error,
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: const Text(
                'Wipe all roadmaps, tasks, notes, focus history & XP to 0',
              ),
              trailing: const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.error,
              ),
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: const Color(0xFF1E1313),
                    title: const Row(
                      children: [
                        Icon(
                          Icons.warning_amber_rounded,
                          color: AppColors.error,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Reset All Data to 0?',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    content: const Text(
                      'This will reset your quests, roadmaps, notes, focus history, and level to 0 so you can input everything yourself from a clean slate.\n\nAre you sure?',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
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
                          await ref
                              .read(dashboardRepositoryProvider)
                              .resetToZero();

                          ref.read(dashboardStateProvider.notifier).refresh();
                          ref.invalidate(analyticsDataProvider);

                          if (ctx.mounted) Navigator.of(ctx).pop();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'All data reset to 0! Input your custom tasks and journeys.',
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
              },
            ),
          ),

          const SizedBox(height: AppSpacing.lg),
          Text(
            'About Questly',
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
                  title: const Text('Version'),
                  trailing: Text(
                    AppConstants.appVersion,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                ),
                const Divider(),
                ListTile(
                  title: const Text('Migration Architecture'),
                  trailing: Text(
                    'Flutter 3 + Riverpod + GoRouter',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? AppColors.darkPrimary
                          : AppColors.lightPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
