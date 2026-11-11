import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  AppTypography._();

  static String? get displayFont => GoogleFonts.oswald().fontFamily;
  static String? get bodyFont => GoogleFonts.inter().fontFamily;

  // Static TextStyle Getters for Dark Default UI
  static TextStyle get displayLarge => TextStyle(
    fontFamily: displayFont,
    fontSize: 34,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
    color: Colors.white,
  );

  static TextStyle get displayMedium => TextStyle(
    fontFamily: displayFont,
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.4,
    color: Colors.white,
  );

  static TextStyle get displaySmall => TextStyle(
    fontFamily: displayFont,
    fontSize: 24,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.2,
    color: Colors.white,
  );

  static TextStyle get headlineMedium => TextStyle(
    fontFamily: displayFont,
    fontSize: 20,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.2,
    color: Colors.white,
  );

  static TextStyle get headlineSmall => TextStyle(
    fontFamily: displayFont,
    fontSize: 18,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.3,
    color: Colors.white,
  );

  static TextStyle get titleLarge => TextStyle(
    fontFamily: displayFont,
    fontSize: 17,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.4,
    color: Colors.white,
  );

  static TextStyle get titleMedium => TextStyle(
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );

  static TextStyle get titleSmall => TextStyle(
    fontFamily: bodyFont,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: const Color(0xFFA6A6A6),
  );

  static TextStyle get bodyLarge => TextStyle(
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: Colors.white,
  );

  static TextStyle get bodyMedium => TextStyle(
    fontFamily: bodyFont,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.4,
    color: const Color(0xFFA6A6A6),
  );

  static TextStyle get bodySmall => TextStyle(
    fontFamily: bodyFont,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: const Color(0xFFA6A6A6),
  );

  static TextStyle get labelLarge => TextStyle(
    fontFamily: displayFont,
    fontSize: 15,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.8,
    color: Colors.white,
  );

  static TextStyle get labelMedium => TextStyle(
    fontFamily: displayFont,
    fontSize: 13,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: const Color(0xFFA6A6A6),
  );

  static TextStyle get labelSmall => TextStyle(
    fontFamily: displayFont,
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.6,
    color: const Color(0xFFA6A6A6),
  );

  static TextStyle get labelBold => TextStyle(
    fontFamily: displayFont,
    fontSize: 12,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.8,
    color: Colors.white,
  );

  static TextStyle get caption => TextStyle(
    fontFamily: bodyFont,
    fontSize: 11,
    color: const Color(0xFF727272),
  );

  static TextStyle get captionBold => TextStyle(
    fontFamily: displayFont,
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.5,
    color: Colors.white,
  );

  static TextTheme createTextTheme(
    Color primaryTextColor,
    Color secondaryTextColor,
  ) {
    return TextTheme(
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
      fontFamily: displayFont,
      fontSize: fontSize,
      fontWeight: fontWeight,
      letterSpacing: -0.5,
      color: color,
    );
  }
}
