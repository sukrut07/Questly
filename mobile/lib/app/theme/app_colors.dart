import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Dark Palette (Primary / Default)
  static const Color darkBackground = Color(0xFF101114);
  static const Color darkSurface = Color(0xFF191B20);
  static const Color darkElevatedSurface = Color(0xFF22252C);
  static const Color darkCardSurface = Color(0xFF1B1D24);
  static const Color darkBorder = Color(0xFF2B2E39);

  static const Color darkPrimary = Color(0xFF8B7CFF);
  static const Color darkSecondary = Color(0xFF5CE1B9);
  static const Color darkAccent = Color(0xFFFFC857);

  static const Color darkTextPrimary = Color(0xFFF5F5F7);
  static const Color darkTextSecondary = Color(0xFF9A9DA8);
  static const Color darkTextMuted = Color(0xFF6B6E7B);
  static const Color darkError = Color(0xFFFF647C);
  static const Color darkSuccess = Color(0xFF5CE1B9);
  static const Color darkWarning = Color(0xFFFFC857);

  // Light Palette
  static const Color lightBackground = Color(0xFFF6F7FB);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightElevatedSurface = Color(0xFFEDEFF6);
  static const Color lightCardSurface = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFDCDFEA);

  static const Color lightPrimary = Color(0xFF7056E8);
  static const Color lightSecondary = Color(0xFF0D9488);
  static const Color lightAccent = Color(0xFFD97706);

  static const Color lightTextPrimary = Color(0xFF191B23);
  static const Color lightTextSecondary = Color(0xFF64748B);
  static const Color lightTextMuted = Color(0xFF94A3B8);
  static const Color lightError = Color(0xFFE11D48);
  static const Color lightSuccess = Color(0xFF10B981);
  static const Color lightWarning = Color(0xFFF59E0B);

  // Gamification Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF8B7CFF), Color(0xFF6C5CE7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFFFFC857), Color(0xFFFF9F43)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF5CE1B9), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGlowGradient = LinearGradient(
    colors: [Color(0x338B7CFF), Color(0x008B7CFF)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}

