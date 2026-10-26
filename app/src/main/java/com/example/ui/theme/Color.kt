package com.example.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

// Dark Palette
val DarkBackground = Color(0xFF0B0D14)
val DarkSurface = Color(0xFF121522)
val DarkCardSurface = Color(0xFF181D2C)
val DarkElevatedSurface = Color(0xFF20263A)
val DarkBorder = Color(0xFF282F45)
val DarkTextPrimary = Color(0xFFF5F6FC)
val DarkTextSecondary = Color(0xFFA6ADC4)
val DarkTextMuted = Color(0xFF6C738E)

// Light Palette
val LightBackground = Color(0xFFF5F6FB)
val LightSurface = Color(0xFFFFFFFF)
val LightCardSurface = Color(0xFFFFFFFF)
val LightElevatedSurface = Color(0xFFECEFFA)
val LightBorder = Color(0xFFD7DBEB)
val LightTextPrimary = Color(0xFF202238)
val LightTextSecondary = Color(0xFF72758D)
val LightTextMuted = Color(0xFF9CA0B8)

// Shared Brand Accents
val PrimaryViolet = Color(0xFF8B7CFF)
val PrimaryVioletLight = Color(0xFF7056E8)
val SecondaryBlue = Color(0xFF67B8FF)
val SuccessGreen = Color(0xFF69D8A5)
val SuccessGreenLight = Color(0xFF18895B)
val GoldAchievement = Color(0xFFF5C96A)
val GoldAchievementLight = Color(0xFFA87414)
val WarningOrange = Color(0xFFFFB86B)
val ErrorRed = Color(0xFFFF6B7D)

// Backward compatibility aliases
val TextPrimary = DarkTextPrimary
val TextSecondary = DarkTextSecondary
val TextMuted = DarkTextMuted

@Immutable
data class QuestlyCustomColors(
    val background: Color,
    val surface: Color,
    val cardSurface: Color,
    val elevatedSurface: Color,
    val border: Color,
    val primaryText: Color,
    val secondaryText: Color,
    val mutedText: Color,
    val primaryAccent: Color,
    val secondaryAccent: Color,
    val success: Color,
    val gold: Color,
    val isDark: Boolean
)

val LocalQuestlyCustomColors = staticCompositionLocalOf {
    QuestlyCustomColors(
        background = DarkBackground,
        surface = DarkSurface,
        cardSurface = DarkCardSurface,
        elevatedSurface = DarkElevatedSurface,
        border = DarkBorder,
        primaryText = DarkTextPrimary,
        secondaryText = DarkTextSecondary,
        mutedText = DarkTextMuted,
        primaryAccent = PrimaryViolet,
        secondaryAccent = SecondaryBlue,
        success = SuccessGreen,
        gold = GoldAchievement,
        isDark = true
    )
}
