package com.example.core.model

enum class ProgressionStage(
    val stageName: String,
    val subtitle: String,
    val minLevel: Int,
    val description: String
) {
    EXPLORER("Explorer", "Getting Started", 1, "Clean, minimal workspace. Learning the fundamentals of quest execution."),
    BUILDER("Builder", "Consistent Progress", 3, "Rich statistics, streak aura, and expanding personal capabilities."),
    STRATEGIST("Strategist", "Advanced Progression", 6, "Skill tree specialization, quest chains, and productivity mastery."),
    MASTER("Master", "Long-term Mastery", 10, "Prestige achievements, golden UI accents, and pinnacle productivity.")
}

enum class WorldStage(
    val stageNumber: Int,
    val title: String,
    val subtitle: String,
    val minStreakDays: Int,
    val description: String,
    val nextMilestoneDesc: String
) {
    FORGOTTEN_OUTPOST(
        1,
        "The Forgotten Outpost",
        "A quiet starter camp under twilight skies",
        0,
        "Dim crystals and quiet embers. The journey begins here.",
        "Reach a 3-day streak to awaken the realm."
    ),
    THE_AWAKENING(
        2,
        "The Awakening",
        "Glowing crystals and rising structures",
        3,
        "Campfire embers glow bright. Energy courses through the soil.",
        "Reach a 7-day streak to expand into a settlement."
    ),
    THE_GROWING_REALM(
        3,
        "The Growing Realm",
        "Expanded towers and stone pathways",
        7,
        "Watchtowers illuminate the horizon. Habit roots run deep.",
        "Reach a 14-day streak to raise the Citadel."
    ),
    THE_RADIANT_CITADEL(
        4,
        "The Radiant Citadel",
        "Gilded landmarks and floating obelisks",
        14,
        "Majestic spires harness your deep work focus.",
        "Reach a 30-day streak to ascend to the Celestial Kingdom."
    ),
    THE_CELESTIAL_KINGDOM(
        5,
        "The Celestial Kingdom",
        "Pinnacle realm bathed in stardust and aurora",
        30,
        "An enduring monument to sustainable consistency and mastery.",
        "Pinnacle mastery achieved! World at full radiance."
    );

    companion object {
        fun fromStreak(streakDays: Int): WorldStage {
            return when {
                streakDays >= 30 -> THE_CELESTIAL_KINGDOM
                streakDays >= 14 -> THE_RADIANT_CITADEL
                streakDays >= 7 -> THE_GROWING_REALM
                streakDays >= 3 -> THE_AWAKENING
                else -> FORGOTTEN_OUTPOST
            }
        }
    }
}

data class UserProfile(
    val id: Long = 1,
    val displayName: String = "Quest Explorer",
    val avatarId: String = "avatar_mage",
    val level: Int = 1,
    val totalXp: Int = 0,
    val currentStage: ProgressionStage = ProgressionStage.EXPLORER,
    val visualTheme: String = "dark",
    val title: String = "The Novice Adventurer",
    val createdAt: Long = System.currentTimeMillis()
)

data class LevelInfo(
    val currentLevel: Int,
    val currentLevelXp: Int,
    val requiredLevelXp: Int,
    val progressPercent: Float,
    val stage: ProgressionStage,
    val nextLevelUnlock: String
)

data class StreakInfo(
    val currentStreak: Int = 1,
    val longestStreak: Int = 1,
    val lastActiveDate: String = "",
    val activeDaysCount: Int = 1,
    val isProtectedToday: Boolean = false
) {
    val worldStage: WorldStage get() = WorldStage.fromStreak(currentStreak)
}
