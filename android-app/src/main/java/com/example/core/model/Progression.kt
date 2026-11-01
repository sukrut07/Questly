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

enum class WorldPresentationMode(val displayName: String, val recoveryTip: String) {
    FLOURISHING("Flourishing", "Active today! Your realm radiates maximum magical energy and particle light."),
    STABLE("Stable", "Recent activity maintained. Your structures remain steady and clear."),
    RESTING("Resting", "World at rest under tranquil skies. Complete any quest or focus session to awaken full radiance!")
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
        "Reach a 2-day streak to ignite First Sparks."
    ),
    FIRST_SPARKS(
        2,
        "First Sparks",
        "Glowing campfire and awakening crystal embers",
        2,
        "The central crystal warms and embers flicker into life. Momentum is building.",
        "Reach a 5-day streak to trigger Awakening."
    ),
    AWAKENING(
        3,
        "The Awakening",
        "Vibrant flora, stone paths, and rising structures",
        5,
        "Energy courses through the soil. Campfire shines bright and new paths open.",
        "Reach a 10-day streak to expand into a Growing Realm."
    ),
    GROWING_REALM(
        4,
        "The Growing Realm",
        "Expanded watchtowers and fortified stone pathways",
        10,
        "Watchtowers illuminate the horizon. Bridges span outwards and habit roots run deep.",
        "Reach a 20-day streak to raise the Radiant Citadel."
    ),
    RADIANT_CITADEL(
        5,
        "The Radiant Citadel",
        "Gilded landmarks, floating obelisks, and aurora",
        20,
        "Majestic spires harness deep work focus with celestial crystals and rare banners.",
        "Reach a 30-day streak to ascend to the Celestial Kingdom."
    ),
    CELESTIAL_KINGDOM(
        6,
        "The Celestial Kingdom",
        "Pinnacle realm bathed in stardust and celestial splendor",
        30,
        "An enduring monument to sustainable consistency, mastery, and world-building.",
        "Pinnacle mastery achieved! Kingdom at permanent maximal radiance."
    );

    companion object {
        // Compatibility aliases
        val THE_AWAKENING get() = AWAKENING
        val THE_GROWING_REALM get() = GROWING_REALM
        val THE_RADIANT_CITADEL get() = RADIANT_CITADEL
        val THE_CELESTIAL_KINGDOM get() = CELESTIAL_KINGDOM

        fun fromStreak(streakDays: Int): WorldStage {
            return when {
                streakDays >= 30 -> CELESTIAL_KINGDOM
                streakDays >= 20 -> RADIANT_CITADEL
                streakDays >= 10 -> GROWING_REALM
                streakDays >= 5 -> AWAKENING
                streakDays >= 2 -> FIRST_SPARKS
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
    val isProtectedToday: Boolean = false,
    val freezesRemaining: Int = 1
) {
    val worldStage: WorldStage get() = WorldStage.fromStreak(currentStreak)

    val presentationMode: WorldPresentationMode
        get() {
            if (lastActiveDate.isEmpty()) return WorldPresentationMode.RESTING
            return try {
                val last = java.time.LocalDate.parse(lastActiveDate)
                val today = java.time.LocalDate.now()
                val diff = java.time.temporal.ChronoUnit.DAYS.between(last, today)
                when {
                    diff == 0L -> WorldPresentationMode.FLOURISHING
                    diff <= 1L -> WorldPresentationMode.STABLE
                    else -> WorldPresentationMode.RESTING
                }
            } catch (_: Exception) {
                WorldPresentationMode.STABLE
            }
        }
}
