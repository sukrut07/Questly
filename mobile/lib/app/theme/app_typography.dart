import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  AppTypography._();

  static TextTheme createTextTheme(Color primaryTextColor, Color secondaryTextColor) {
    final displayFont = GoogleFonts.oswald().fontFamily;
    final bodyFont = GoogleFonts.inter().fontFamily;

    return TextTheme(
      // Display: Bold, condensed, energetic uppercase for main titles
      displayLarge: TextStyle(
        fontFamily: displayFont,
        fontSize: 34,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
        color: primaryTextColor,
      ),
      displayMedium: TextStyle(
        fontFamily: displayFont,
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.4,
        color: primaryTextColor,
      ),
      displaySmall: TextStyle(
        fontFamily: displayFont,
        fontSize: 24,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.2,
        color: primaryTextColor,
      ),
      headlineMedium: TextStyle(
        fontFamily: displayFont,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.2,
        color: primaryTextColor,
      ),
      headlineSmall: TextStyle(
        fontFamily: displayFont,
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.3,
        color: primaryTextColor,
      ),

      // Titles & Subtitles: Hybrid Oswald / Inter
      titleLarge: TextStyle(
        fontFamily: displayFont,
        fontSize: 17,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.4,
        color: primaryTextColor,
      ),
      titleMedium: TextStyle(
        fontFamily: bodyFont,
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: primaryTextColor,
      ),
      titleSmall: TextStyle(
        fontFamily: bodyFont,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: secondaryTextColor,
      ),

      // Body: Clean, readable Inter
      bodyLarge: TextStyle(
        fontFamily: bodyFont,
        fontSize: 15,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: primaryTextColor,
      ),
      bodyMedium: TextStyle(
        fontFamily: bodyFont,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.4,
        color: secondaryTextColor,
      ),
      bodySmall: TextStyle(
        fontFamily: bodyFont,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: secondaryTextColor,
      ),

      // Labels: Sharp, punchy buttons & tags
      labelLarge: TextStyle(
        fontFamily: displayFont,
        fontSize: 15,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
        color: primaryTextColor,
      ),
      labelMedium: TextStyle(
        fontFamily: displayFont,
        fontSize: 13,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        color: secondaryTextColor,
      ),
      labelSmall: TextStyle(
        fontFamily: displayFont,
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.6,
        color: secondaryTextColor,
      ),
    );
  }

  // Display style shortcut for stats / numbers
  static TextStyle statDisplay({
    double fontSize = 28,
    FontWeight fontWeight = FontWeight.w800,
    Color color = Colors.white,
  }) {
    return TextStyle(
      fontFamily: GoogleFonts.oswald().fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      letterSpacing: -0.5,
      color: color,
    );
  }
}
