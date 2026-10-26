package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.Color

private val QuestlyDarkColorScheme = darkColorScheme(
    primary = PrimaryViolet,
    onPrimary = Color(0xFF0F0B24),
    primaryContainer = Color(0xFF2E2754),
    onPrimaryContainer = Color(0xFFEADBFF),
    secondary = SecondaryBlue,
    onSecondary = Color(0xFF003355),
    secondaryContainer = Color(0xFF163E5E),
    onSecondaryContainer = Color(0xFFCFE5FF),
    tertiary = GoldAchievement,
    onTertiary = Color(0xFF3E2E00),
    tertiaryContainer = Color(0xFF5A4300),
    onTertiaryContainer = Color(0xFFFFE08B),
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkCardSurface,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorder,
    error = ErrorRed,
    onError = Color.White
)

private val QuestlyLightColorScheme = lightColorScheme(
    primary = PrimaryVioletLight,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEADBFF),
    onPrimaryContainer = Color(0xFF2E2754),
    secondary = Color(0xFF026AA7),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD4EDFF),
    onSecondaryContainer = Color(0xFF003355),
    tertiary = GoldAchievementLight,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE8B3),
    onTertiaryContainer = Color(0xFF3E2E00),
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightCardSurface,
    onSurfaceVariant = LightTextSecondary,
    outline = LightBorder,
    error = ErrorRed,
    onError = Color.White
)

object QuestlyThemeTokens {
    val colors: QuestlyCustomColors
        @Composable
        @ReadOnlyComposable
        get() = LocalQuestlyCustomColors.current
}

@Composable
fun QuestlyTheme(
    themePreference: String = "dark", // "dark", "light", "system"
    content: @Composable () -> Unit
) {
    val isSystemDark = isSystemInDarkTheme()
    val isDark = when (themePreference) {
        "light" -> false
        "dark" -> true
        else -> isSystemDark
    }

    val customColors = if (isDark) {
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
    } else {
        QuestlyCustomColors(
            background = LightBackground,
            surface = LightSurface,
            cardSurface = LightCardSurface,
            elevatedSurface = LightElevatedSurface,
            border = LightBorder,
            primaryText = LightTextPrimary,
            secondaryText = LightTextSecondary,
            mutedText = LightTextMuted,
            primaryAccent = PrimaryVioletLight,
            secondaryAccent = Color(0xFF026AA7),
            success = SuccessGreenLight,
            gold = GoldAchievementLight,
            isDark = false
        )
    }

    val colorScheme = if (isDark) QuestlyDarkColorScheme else QuestlyLightColorScheme

    CompositionLocalProvider(LocalQuestlyCustomColors provides customColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
