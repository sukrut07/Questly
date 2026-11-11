import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/shared/widgets/questly_card.dart';

class QuestlyStatCard extends StatelessWidget {
  final String? label;
  final String? title;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? accentColor;
  final VoidCallback? onTap;

  const QuestlyStatCard({
    super.key,
    this.label,
    this.title,
    required this.value,
    this.subtitle,
    this.icon,
    this.accentColor,
    this.onTap,
  }) : assert(
         label != null || title != null,
         'Either label or title must be provided',
       );

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color =
        accentColor ??
        (isDark ? AppColors.primaryLime : AppColors.lightPrimary);
    final displayLabel = (label ?? title ?? '').toUpperCase();

    return QuestlyCard(
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                displayLabel,
                style: TextStyle(
                  fontFamily: GoogleFonts.oswald().fontFamily,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8,
                  color: isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary,
                ),
              ),
              if (icon != null) Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: TextStyle(
              fontFamily: GoogleFonts.oswald().fontFamily,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: isDark
                  ? AppColors.textPrimary
                  : AppColors.lightTextPrimary,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle!,
              style: TextStyle(
                fontFamily: GoogleFonts.inter().fontFamily,
                fontSize: 11,
                color: isDark ? AppColors.textMuted : AppColors.lightTextMuted,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }
}
