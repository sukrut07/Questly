import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';

enum QuestlyCardAccent { none, lime, lavender }

class QuestlyCard extends StatefulWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final Color? borderColor;
  final QuestlyCardAccent accent;
  final bool hasGlow;

  const QuestlyCard({
    super.key,
    required this.child,
    this.padding = AppSpacing.cardPadding,
    this.onTap,
    this.backgroundColor,
    this.borderColor,
    this.accent = QuestlyCardAccent.none,
    this.hasGlow = false,
  });

  @override
  State<QuestlyCard> createState() => _QuestlyCardState();
}

class _QuestlyCardState extends State<QuestlyCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 80),
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.985,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final defaultBg = isDark
        ? AppColors.darkCardBackground
        : AppColors.lightCardSurface;

    Color resolvedBorderColor =
        widget.borderColor ??
        (isDark ? AppColors.darkBorder : AppColors.lightBorder);

    if (widget.borderColor == null) {
      if (widget.accent == QuestlyCardAccent.lime) {
        resolvedBorderColor = AppColors.primaryLime.withValues(alpha: 0.5);
      } else if (widget.accent == QuestlyCardAccent.lavender) {
        resolvedBorderColor = AppColors.lavender.withValues(alpha: 0.5);
      }
    }

    final decoration = BoxDecoration(
      color: widget.backgroundColor ?? defaultBg,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      border: Border.all(color: resolvedBorderColor, width: 1.2),
      boxShadow: widget.hasGlow || widget.accent == QuestlyCardAccent.lime
          ? [
              BoxShadow(
                color: AppColors.primaryLime.withValues(alpha: 0.08),
                blurRadius: 16,
                spreadRadius: 1,
                offset: const Offset(0, 4),
              ),
            ]
          : null,
    );

    if (widget.onTap != null) {
      return AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) =>
            Transform.scale(scale: _scaleAnimation.value, child: child),
        child: GestureDetector(
          onTapDown: (_) {
            _controller.forward();
            HapticFeedback.selectionClick();
          },
          onTapUp: (_) => _controller.reverse(),
          onTapCancel: () => _controller.reverse(),
          onTap: widget.onTap,
          child: Container(
            decoration: decoration,
            padding: widget.padding,
            child: widget.child,
          ),
        ),
      );
    }

    return Container(
      decoration: decoration,
      padding: widget.padding,
      child: widget.child,
    );
  }
}
