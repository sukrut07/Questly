import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';

enum AppButtonVariant { primary, secondary, outline, text, danger }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final bool isLoading;
  final bool isFullWidth;
  final EdgeInsetsGeometry? padding;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
    this.isFullWidth = false,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    Widget childContent = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
        ] else if (leadingIcon != null) ...[
          Icon(leadingIcon, size: 18),
          const SizedBox(width: AppSpacing.xs),
        ],
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
            color: _getTextColor(isDark),
          ),
        ),
        if (!isLoading && trailingIcon != null) ...[
          const SizedBox(width: AppSpacing.xs),
          Icon(trailingIcon, size: 18),
        ],
      ],
    );

    Widget button;
    switch (variant) {
      case AppButtonVariant.primary:
        button = Container(
          decoration: BoxDecoration(
            gradient: onPressed != null && !isLoading
                ? AppColors.primaryGradient
                : null,
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            color: onPressed == null || isLoading
                ? (isDark
                      ? AppColors.darkElevatedSurface
                      : AppColors.lightElevatedSurface)
                : null,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: isLoading ? null : onPressed,
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              child: Padding(
                padding:
                    padding ??
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: childContent,
              ),
            ),
          ),
        );
        break;

      case AppButtonVariant.secondary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: isDark
                ? AppColors.darkElevatedSurface
                : AppColors.lightElevatedSurface,
            foregroundColor: isDark
                ? AppColors.darkTextPrimary
                : AppColors.lightTextPrimary,
            padding: padding,
          ),
          child: childContent,
        );
        break;

      case AppButtonVariant.outline:
        button = OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            padding: padding,
            side: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              width: 1.2,
            ),
          ),
          child: childContent,
        );
        break;

      case AppButtonVariant.text:
        button = TextButton(
          onPressed: isLoading ? null : onPressed,
          style: TextButton.styleFrom(
            padding:
                padding ??
                const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            foregroundColor: isDark
                ? AppColors.darkPrimary
                : AppColors.lightPrimary,
          ),
          child: childContent,
        );
        break;

      case AppButtonVariant.danger:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: isDark
                ? AppColors.darkError
                : AppColors.lightError,
            foregroundColor: Colors.white,
            padding: padding,
          ),
          child: childContent,
        );
        break;
    }

    if (isFullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }

  Color? _getTextColor(bool isDark) {
    if (variant == AppButtonVariant.primary ||
        variant == AppButtonVariant.danger) {
      return Colors.white;
    }
    if (variant == AppButtonVariant.outline ||
        variant == AppButtonVariant.secondary) {
      return isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    }
    if (variant == AppButtonVariant.text) {
      return isDark ? AppColors.darkPrimary : AppColors.lightPrimary;
    }
    return null;
  }
}
