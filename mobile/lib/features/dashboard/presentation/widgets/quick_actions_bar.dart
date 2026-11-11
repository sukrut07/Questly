import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';

class QuickActionsBar extends StatelessWidget {
  const QuickActionsBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'QUICK ACTIONS',
          style: AppTypography.labelBold.copyWith(
            color: AppColors.textSecondary,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _QuickActionButton(
              icon: Icons.add_task_rounded,
              label: 'New Quest',
              color: AppColors.limePrimary,
              onTap: () => context.push(RoutePaths.createQuest),
            ),
            _QuickActionButton(
              icon: Icons.timer_outlined,
              label: 'Deep Focus',
              color: AppColors.lavenderAccent,
              onTap: () => context.push(RoutePaths.focus),
            ),
            _QuickActionButton(
              icon: Icons.edit_note_rounded,
              label: 'Write Note',
              color: const Color(0xFFFFCC66),
              onTap: () {
                final noteId = 'note_${DateTime.now().millisecondsSinceEpoch}';
                context.push(RoutePaths.noteEditor.replaceAll(':id', noteId));
              },
            ),
            _QuickActionButton(
              icon: Icons.alt_route_rounded,
              label: 'Roadmaps',
              color: const Color(0xFF67B8FF),
              onTap: () => context.go(RoutePaths.roadmaps),
            ),
          ],
        ),
      ],
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: color.withValues(alpha: 0.35),
                  width: 1.5,
                ),
              ),
              child: Center(child: Icon(icon, color: color, size: 26)),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              label,
              style: AppTypography.captionBold.copyWith(
                fontSize: 11,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
