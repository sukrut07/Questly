import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_spacing.dart';

class StatBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Color color;
  final Color? textColor;
  final VoidCallback? onTap;

  const StatBadge({
    super.key,
    required this.label,
    this.icon,
    required this.color,
    this.textColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget badge = Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
        border: Border.all(
          color: color.withValues(alpha: 0.35),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: color),
            const SizedBox(width: AppSpacing.xxs),
          ],
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: textColor ?? color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: badge);
    }
    return badge;
  }
}
