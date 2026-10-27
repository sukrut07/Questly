package com.example.core.model

enum class AchievementCategory(val displayName: String) {
    QUESTS("Quests"),
    FOCUS("Focus Time"),
    STREAKS("Consistency"),
    ARCADE("Arcade & Games"),
    MASTERY("Mastery")
}

data class Achievement(
    val id: String,
    val title: String,
    val description: String,
    val iconName: String,
    val category: AchievementCategory,
    val targetValue: Int,
    val currentValue: Int = 0,
    val isUnlocked: Boolean = false,
    val unlockedAt: Long? = null,
    val xpReward: Int = 50,
    val cosmeticReward: String? = null
) {
    val progressPercent: Float
        get() = if (targetValue <= 0) 1f else (currentValue.toFloat() / targetValue.toFloat()).coerceIn(0f, 1f)
}
