import 'package:flutter/material.dart';

/// Questly 2.0 Design Tokens — Matiks-inspired, Questly-branded palette.
class AppColors {
  AppColors._();

  // Dark Palette (Primary / Default)
  static const Color darkBackground = Color(0xFF101010);
  static const Color darkSecondaryBackground = Color(0xFF171717);
  static const Color darkCardBackground = Color(0xFF202020);
  static const Color darkElevatedSurface = Color(0xFF282828);
  static const Color darkBorder = Color(0xFF343434);

  // Brand Accents
  static const Color primaryLime = Color(0xFFB5FF55);
  static const Color secondaryLime = Color(0xFF9CEB43);
  static const Color lavender = Color(0xFFB9A3FF);
  static const Color purple = Color(0xFF9575F5);

  // Backward-compatible aliases
  static const Color darkPrimary = primaryLime;
  static const Color darkSecondary = lavender;
  static const Color darkAccent = primaryLime;
  static const Color darkSurface = darkCardBackground;
  static const Color darkCardSurface = darkCardBackground;

  // Text Tokens
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA6A6A6);
  static const Color textMuted = Color(0xFF727272);

  static const Color darkTextPrimary = textPrimary;
  static const Color darkTextSecondary = textSecondary;
  static const Color darkTextMuted = textMuted;

  // Feedback Colors
  static const Color success = Color(0xFF68D391);
  static const Color warning = Color(0xFFFFCC66);
  static const Color error = Color(0xFFFF6B81);

  static const Color darkSuccess = success;
  static const Color darkWarning = warning;
  static const Color darkError = error;

  // Heatmap Intensity Shades (Lime Scale)
  static const Color heatmapLevel0 = Color(0xFF1A1A1A); // No activity
  static const Color heatmapLevel1 = Color(0xFF2B441B); // Low
  static const Color heatmapLevel2 = Color(0xFF558B2F); // Medium
  static const Color heatmapLevel3 = Color(0xFF8BC34A); // High
  static const Color heatmapLevel4 = Color(0xFFB5FF55); // Max intensity

  // Light Palette
  static const Color lightBackground = Color(0xFFF7F8FA);
  static const Color lightSecondaryBackground = Color(0xFFEEF0F5);
  static const Color lightCardSurface = Color(0xFFFFFFFF);
  static const Color lightElevatedSurface = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE2E4EB);

  static const Color lightPrimary = Color(0xFF1B8A00);
  static const Color lightSecondary = Color(0xFF6C4AB6);
  static const Color lightAccent = Color(0xFF00B020);

  static const Color lightTextPrimary = Color(0xFF121417);
  static const Color lightTextSecondary = Color(0xFF555B68);
  static const Color lightTextMuted = Color(0xFF8E95A5);
  static const Color lightError = Color(0xFFDC2626);
  static const Color lightSuccess = Color(0xFF16A34A);
  static const Color lightWarning = Color(0xFFD97706);

  // Gradients
  static const LinearGradient limeGradient = LinearGradient(
    colors: [primaryLime, secondaryLime],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [lavender, purple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradient = limeGradient;
  static const LinearGradient accentGradient = purpleGradient;

  static const LinearGradient cardGlowGradient = LinearGradient(
    colors: [Color(0x33B5FF55), Color(0x00B5FF55)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
