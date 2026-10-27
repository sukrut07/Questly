package com.example.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

// --- Questly Living World Design Tokens ---

// Dark Palette
val DarkBackground = Color(0xFF0B0D14)
val DarkSecondaryBackground = Color(0xFF121522)
val DarkSurface = Color(0xFF121522)
val DarkCardSurface = Color(0xFF181D2C)
val DarkElevatedSurface = Color(0xFF20263A)
val DarkBorder = Color(0xFF282F45)
val DarkTextPrimary = Color(0xFFF5F6FC)
val DarkTextSecondary = Color(0xFFA6ADC4)
val DarkTextMuted = Color(0xFF6C738E)
val DarkPrimaryAccent = Color(0xFF8B7CFF)
val DarkSecondaryAccent = Color(0xFF67B8FF)
val DarkSuccess = Color(0xFF69D8A5)
val DarkAchievementGold = Color(0xFFF5C96A)
val DarkWarning = Color(0xFFFFB86B)
val DarkError = Color(0xFFFF6B7D)

// Light Palette
val LightBackground = Color(0xFFF5F6FB)
val LightSurface = Color(0xFFFFFFFF)
val LightSecondarySurface = Color(0xFFECEFFA)
val LightCardSurface = Color(0xFFFFFFFF)
val LightElevatedSurface = Color(0xFFECEFFA)
val LightBorder = Color(0xFFD7DBEB)
val LightTextPrimary = Color(0xFF202238)
val LightTextSecondary = Color(0xFF72758D)
val LightTextMuted = Color(0xFF9CA0B8)
val LightPrimaryAccent = Color(0xFF7056E8)
val LightSecondaryAccent = Color(0xFF026AA7)
val LightSuccess = Color(0xFF18895B)
val LightAchievementGold = Color(0xFFA87414)
val LightWarning = Color(0xFFD97706)
val LightError = Color(0xFFE11D48)

// Shared Brand Accents
val PrimaryViolet = DarkPrimaryAccent
val PrimaryVioletLight = LightPrimaryAccent
val SecondaryBlue = DarkSecondaryAccent
val SuccessGreen = DarkSuccess
val SuccessGreenLight = LightSuccess
val GoldAchievement = DarkAchievementGold
val GoldAchievementLight = LightAchievementGold
val WarningOrange = DarkWarning
val ErrorRed = DarkError

// Backward compatibility aliases
val TextPrimary = DarkTextPrimary
val TextSecondary = DarkTextSecondary
val TextMuted = DarkTextMuted

@Immutable
data class QuestlyCustomColors(
    val background: Color,
    val secondaryBackground: Color,
    val surface: Color,
    val secondarySurface: Color,
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
    val warning: Color,
    val error: Color,
    val isDark: Boolean
)

val LocalQuestlyCustomColors = staticCompositionLocalOf {
    QuestlyCustomColors(
        background = DarkBackground,
        secondaryBackground = DarkSecondaryBackground,
        surface = DarkSurface,
        secondarySurface = DarkSecondaryBackground,
        cardSurface = DarkCardSurface,
        elevatedSurface = DarkElevatedSurface,
        border = DarkBorder,
        primaryText = DarkTextPrimary,
        secondaryText = DarkTextSecondary,
        mutedText = DarkTextMuted,
        primaryAccent = DarkPrimaryAccent,
        secondaryAccent = DarkSecondaryAccent,
        success = DarkSuccess,
        gold = DarkAchievementGold,
        warning = DarkWarning,
        error = DarkError,
        isDark = true
    )
}
