import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';

enum QuestlyButtonVariant {
  primaryLime,
  secondaryLavender,
  darkOutline,
  ghostText,
  danger,
}

class QuestlyButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final QuestlyButtonVariant variant;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final bool isLoading;
  final bool isFullWidth;
  final EdgeInsetsGeometry? padding;

  const QuestlyButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = QuestlyButtonVariant.primaryLime,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
    this.isFullWidth = false,
    this.padding,
  });

  @override
  State<QuestlyButton> createState() => _QuestlyButtonState();
}

class _QuestlyButtonState extends State<QuestlyButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 90),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails _) {
    if (widget.onPressed != null && !widget.isLoading) {
      _controller.forward();
      HapticFeedback.lightImpact();
    }
  }

  void _onTapUp(TapUpDetails _) {
    _controller.reverse();
  }

  void _onTapCancel() {
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    Color fg;
    Border? border;

    switch (widget.variant) {
      case QuestlyButtonVariant.primaryLime:
        bg = AppColors.primaryLime;
        fg = Colors.black;
        break;
      case QuestlyButtonVariant.secondaryLavender:
        bg = AppColors.lavender;
        fg = Colors.black;
        break;
      case QuestlyButtonVariant.darkOutline:
        bg = isDark ? AppColors.darkElevatedSurface : AppColors.lightElevatedSurface;
        fg = isDark ? AppColors.textPrimary : AppColors.lightTextPrimary;
        border = Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1.2,
        );
        break;
      case QuestlyButtonVariant.ghostText:
        bg = Colors.transparent;
        fg = isDark ? AppColors.primaryLime : AppColors.lightPrimary;
        break;
      case QuestlyButtonVariant.danger:
        bg = AppColors.error;
        fg = Colors.white;
        break;
    }

    if (widget.onPressed == null) {
      bg = isDark ? AppColors.darkElevatedSurface : Colors.grey.shade300;
      fg = AppColors.textMuted;
      border = null;
    }

    final buttonText = Text(
      widget.label.toUpperCase(),
      style: TextStyle(
        fontFamily: GoogleFonts.oswald().fontFamily,
        fontSize: 15,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
        color: fg,
      ),
    );

    Widget content = Row(
      mainAxisSize: widget.isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading) ...[
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(fg),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
        ] else if (widget.leadingIcon != null) ...[
          Icon(widget.leadingIcon, size: 18, color: fg),
          const SizedBox(width: AppSpacing.xs),
        ],
        buttonText,
        if (!widget.isLoading && widget.trailingIcon != null) ...[
          const SizedBox(width: AppSpacing.xs),
          Icon(widget.trailingIcon, size: 18, color: fg),
        ],
      ],
    );

    Widget buttonBody = AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) => Transform.scale(
        scale: _scaleAnimation.value,
        child: child,
      ),
      child: GestureDetector(
        onTapDown: _onTapDown,
        onTapUp: _onTapUp,
        onTapCancel: _onTapCancel,
        onTap: widget.isLoading ? null : widget.onPressed,
        child: Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
            border: border,
            boxShadow: widget.variant == QuestlyButtonVariant.primaryLime &&
                    widget.onPressed != null
                ? [
                    BoxShadow(
                      color: AppColors.primaryLime.withValues(alpha: 0.25),
                      blurRadius: 12,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : null,
          ),
          padding: widget.padding ??
              const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: content,
        ),
      ),
    );

    if (widget.isFullWidth) {
      return SizedBox(width: double.infinity, child: buttonBody);
    }
    return buttonBody;
  }
}
