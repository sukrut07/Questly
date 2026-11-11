import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';

class QuestlyXPIndicator extends StatelessWidget {
  final int? xp;
  final int? currentXp;
  final int? level;
  final bool isCompact;
  final bool compact;

  const QuestlyXPIndicator({
    super.key,
    this.xp,
    this.currentXp,
    this.level,
    this.isCompact = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveXp = currentXp ?? xp ?? 0;
    final effectiveCompact = isCompact || compact;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: effectiveCompact ? 8 : 12,
        vertical: effectiveCompact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkElevatedSurface
            : AppColors.lightElevatedSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
        border: Border.all(
          color: AppColors.primaryLime.withValues(alpha: 0.35),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryLime,
            ),
            child: const Icon(
              Icons.bolt_rounded,
              size: 11,
              color: Colors.black,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            '$effectiveXp XP',
            style: TextStyle(
              fontFamily: GoogleFonts.oswald().fontFamily,
              fontSize: effectiveCompact ? 13 : 15,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: isDark
                  ? AppColors.textPrimary
                  : AppColors.lightTextPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
