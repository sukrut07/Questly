import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/presentation/providers/widget_providers.dart';
import 'package:questly/shared/widgets/app_button.dart';

class WidgetCustomizerSheet extends ConsumerWidget {
  const WidgetCustomizerSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      isScrollControlled: true,
      builder: (context) => const WidgetCustomizerSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final widgetsState = ref.watch(dashboardWidgetsProvider);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'CUSTOMIZE DASHBOARD',
                  style: AppTypography.headlineSmall.copyWith(
                    fontFamily: 'Oswald',
                    letterSpacing: 1.0,
                    color: AppColors.limePrimary,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    ref
                        .read(dashboardWidgetsProvider.notifier)
                        .restoreDefaults();
                  },
                  child: Text(
                    'RESET',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.lavenderSecondary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Toggle visibility and drag to reorder personal OS cards.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            widgetsState.when(
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.lg),
                  child: CircularProgressIndicator(
                    color: AppColors.limePrimary,
                  ),
                ),
              ),
              error: (err, _) => Center(
                child: Text(
                  'Failed to load widgets: $err',
                  style: AppTypography.bodySmall,
                ),
              ),
              data: (widgets) {
                return SizedBox(
                  height: 360,
                  child: ReorderableListView.builder(
                    itemCount: widgets.length,
                    // ignore: deprecated_member_use
                    onReorder: (oldIdx, newIdx) {
                      ref
                          .read(dashboardWidgetsProvider.notifier)
                          .reorder(oldIdx, newIdx);
                    },
                    itemBuilder: (context, index) {
                      final widget = widgets[index];
                      return Container(
                        key: ValueKey(widget.id),
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.darkCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: widget.isVisible
                                ? AppColors.limePrimary.withValues(alpha: 0.2)
                                : AppColors.darkBorder,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.drag_indicator_rounded,
                              color: AppColors.textTertiary,
                              size: 20,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                widget.title,
                                style: AppTypography.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: widget.isVisible
                                      ? AppColors.textPrimary
                                      : AppColors.textTertiary,
                                ),
                              ),
                            ),
                            Switch.adaptive(
                              value: widget.isVisible,
                              activeTrackColor: AppColors.limePrimary
                                  .withValues(alpha: 0.6),
                              onChanged: (val) {
                                ref
                                    .read(dashboardWidgetsProvider.notifier)
                                    .toggleVisibility(widget.id, val);
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
            ),
            const SizedBox(height: AppSpacing.md),
            AppButton(
              label: 'DONE',
              isFullWidth: true,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    );
  }
}
