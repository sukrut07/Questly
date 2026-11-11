import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final Border? border;
  final Gradient? gradient;
  final bool hasGlow;

  const AppCard({
    super.key,
    required this.child,
    this.padding = AppSpacing.cardPadding,
    this.onTap,
    this.backgroundColor,
    this.border,
    this.gradient,
    this.hasGlow = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final defaultBg = isDark ? AppColors.darkCardSurface : AppColors.lightCardSurface;
    final defaultBorderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    final boxDecoration = BoxDecoration(
      color: gradient == null ? (backgroundColor ?? defaultBg) : null,
      gradient: gradient,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      border: border ?? Border.all(color: defaultBorderColor, width: 1.0),
      boxShadow: hasGlow
          ? [
              BoxShadow(
                color: (isDark ? AppColors.darkPrimary : AppColors.lightPrimary).withValues(alpha: 0.15),
                blurRadius: 16,
                spreadRadius: 2,
                offset: const Offset(0, 4),
              ),
            ]
          : null,
    );

    if (onTap != null) {
      return Container(
        decoration: boxDecoration,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            child: Padding(
              padding: padding,
              child: child,
            ),
          ),
        ),
      );
    }

    return Container(
      decoration: boxDecoration,
      padding: padding,
      child: child,
    );
  }
}
