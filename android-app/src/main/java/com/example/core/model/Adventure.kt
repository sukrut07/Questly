package com.example.core.model

enum class AdventureLevelType(val displayName: String, val iconName: String) {
    FOCUS("Deep Focus", "timer"),
    QUEST("Quest Mastery", "check_circle"),
    CONSISTENCY("Streak Vigil", "local_fire_department"),
    BOSS("Boss Challenge", "security"),
    SPECIAL("Special Trial", "auto_awesome")
}

enum class AdventureLevelStatus {
    LOCKED,
    AVAILABLE,
    IN_PROGRESS,
    COMPLETED,
    PERFECT
}

data class AdventureLevel(
    val levelNumber: Int,
    val zoneId: String,
    val zoneName: String,
    val title: String,
    val description: String,
    val levelType: AdventureLevelType,
    val difficulty: String = "Normal",
    val targetRequirement: Int,
    val requirementDescription: String,
    val xpReward: Int,
    val badgeReward: String? = null,
    val starsEarned: Int = 0,
    val status: AdventureLevelStatus = AdventureLevelStatus.LOCKED,
    val completedAt: Long? = null
)

data class AdventureZone(
    val id: String,
    val name: String,
    val levelRange: IntRange,
    val themeColorHex: Long,
    val description: String
)

object DefaultAdventureLevels {

    val ZONES = listOf(
        AdventureZone("whispering_glade", "Whispering Glade", 1..5, 0xFF4E9F3D, "Lush emerald woods where fledgling wanderers take their first focused steps."),
        AdventureZone("crystal_spires", "Crystal Spires", 6..10, 0xFF8B7CFF, "Towering amethyst spires humming with pure cognitive resonance."),
        AdventureZone("sunken_citadel", "Sunken Citadel", 11..15, 0xFF00ADB5, "An ancient submerged fortress holding secrets of uninterrupted flow states."),
        AdventureZone("astral_peaks", "Astral Peaks", 16..20, 0xFFF5C96A, "Pinnacle summits touching the aurora where legendary masters reside.")
    )

    fun getInitialLevels(): List<AdventureLevel> {
        return listOf(
            // Zone 1: Whispering Glade (Levels 1-5)
            AdventureLevel(
                levelNumber = 1,
                zoneId = "whispering_glade",
                zoneName = "Whispering Glade",
                title = "The First Step",
                description = "Complete your first task to awaken the slumbering glade.",
                levelType = AdventureLevelType.QUEST,
                difficulty = "Intro",
                targetRequirement = 1,
                requirementDescription = "Complete 1 Quest",
                xpReward = 50,
                status = AdventureLevelStatus.AVAILABLE
            ),
            AdventureLevel(
                levelNumber = 2,
                zoneId = "whispering_glade",
                zoneName = "Whispering Glade",
                title = "Deep Breathing",
                description = "Calm your senses and enter a 15-minute uninterrupted focus chamber.",
                levelType = AdventureLevelType.FOCUS,
                difficulty = "Easy",
                targetRequirement = 15,
                requirementDescription = "Complete 15 mins of Focus",
                xpReward = 60,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 3,
                zoneId = "whispering_glade",
                zoneName = "Whispering Glade",
                title = "Dual Resolve",
                description = "Build steady momentum by conquering two distinct tasks today.",
                levelType = AdventureLevelType.QUEST,
                difficulty = "Normal",
                targetRequirement = 2,
                requirementDescription = "Complete 2 Quests",
                xpReward = 75,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 4,
                zoneId = "whispering_glade",
                zoneName = "Whispering Glade",
                title = "Campfire Vigil",
                description = "Maintain your habit embers for at least 2 consecutive days.",
                levelType = AdventureLevelType.CONSISTENCY,
                difficulty = "Normal",
                targetRequirement = 2,
                requirementDescription = "Reach a 2-Day Streak",
                xpReward = 90,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 5,
                zoneId = "whispering_glade",
                zoneName = "Whispering Glade",
                title = "Glade Warden",
                description = "BOSS: Prove your dedication with 25 mins of deep focus and 2 completed quests.",
                levelType = AdventureLevelType.BOSS,
                difficulty = "Boss",
                targetRequirement = 25,
                requirementDescription = "Complete 25 min Focus & 2 Quests",
                xpReward = 150,
                badgeReward = "Glade Conqueror",
                status = AdventureLevelStatus.LOCKED
            ),

            // Zone 2: Crystal Spires (Levels 6-10)
            AdventureLevel(
                levelNumber = 6,
                zoneId = "crystal_spires",
                zoneName = "Crystal Spires",
                title = "Resonant Quartz",
                description = "Attune to the crystals with 25 minutes of deep undistracted work.",
                levelType = AdventureLevelType.FOCUS,
                difficulty = "Normal",
                targetRequirement = 25,
                requirementDescription = "Complete 25 mins Focus",
                xpReward = 80,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 7,
                zoneId = "crystal_spires",
                zoneName = "Crystal Spires",
                title = "Triple Crown",
                description = "Show task mastery by ticking off 3 quests in your daily backlog.",
                levelType = AdventureLevelType.QUEST,
                difficulty = "Normal",
                targetRequirement = 3,
                requirementDescription = "Complete 3 Quests",
                xpReward = 95,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 8,
                zoneId = "crystal_spires",
                zoneName = "Crystal Spires",
                title = "The Flow Channel",
                description = "Sustain high focus across a prolonged 40-minute focus session.",
                levelType = AdventureLevelType.FOCUS,
                difficulty = "Hard",
                targetRequirement = 40,
                requirementDescription = "Complete 40 mins Focus",
                xpReward = 110,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 9,
                zoneId = "crystal_spires",
                zoneName = "Crystal Spires",
                title = "Stalwart Foundation",
                description = "Solidify your habit roots with a persistent 4-day streak.",
                levelType = AdventureLevelType.CONSISTENCY,
                difficulty = "Hard",
                targetRequirement = 4,
                requirementDescription = "Reach a 4-Day Streak",
                xpReward = 125,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 10,
                zoneId = "crystal_spires",
                zoneName = "Crystal Spires",
                title = "Crystal Golem",
                description = "BOSS: Overcome the towering sentinel with 45 mins focus and 3 completed quests.",
                levelType = AdventureLevelType.BOSS,
                difficulty = "Boss",
                targetRequirement = 45,
                requirementDescription = "Complete 45 min Focus & 3 Quests",
                xpReward = 200,
                badgeReward = "Spire Ascendant",
                status = AdventureLevelStatus.LOCKED
            ),

            // Zone 3: Sunken Citadel (Levels 11-15)
            AdventureLevel(
                levelNumber = 11,
                zoneId = "sunken_citadel",
                zoneName = "Sunken Citadel",
                title = "Submerged Archive",
                description = "Break complex objectives down by finishing tasks with completed subtasks.",
                levelType = AdventureLevelType.QUEST,
                difficulty = "Hard",
                targetRequirement = 3,
                requirementDescription = "Complete 3 Quests with subtasks",
                xpReward = 120,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 12,
                zoneId = "sunken_citadel",
                zoneName = "Sunken Citadel",
                title = "Hour of Power",
                description = "Reach pinnacle focus velocity by logging 60 minutes of qualifying focus time.",
                levelType = AdventureLevelType.FOCUS,
                difficulty = "Hard",
                targetRequirement = 60,
                requirementDescription = "Complete 60 mins Focus",
                xpReward = 140,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 13,
                zoneId = "sunken_citadel",
                zoneName = "Sunken Citadel",
                title = "Unbroken Chain",
                description = "Enter the Growing Realm threshold by maintaining a 7-day streak.",
                levelType = AdventureLevelType.CONSISTENCY,
                difficulty = "Expert",
                targetRequirement = 7,
                requirementDescription = "Reach a 7-Day Streak",
                xpReward = 160,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 14,
                zoneId = "sunken_citadel",
                zoneName = "Sunken Citadel",
                title = "Relic Hunter",
                description = "Conquer an Epic or Legendary quest to extract the Citadel's core secret.",
                levelType = AdventureLevelType.SPECIAL,
                difficulty = "Expert",
                targetRequirement = 1,
                requirementDescription = "Complete 1 Hard or Epic Quest",
                xpReward = 180,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 15,
                zoneId = "sunken_citadel",
                zoneName = "Sunken Citadel",
                title = "Citadel Overlord",
                description = "BOSS: Subjugate the ancient guardian through 60 mins focus and 4 completed quests.",
                levelType = AdventureLevelType.BOSS,
                difficulty = "Boss",
                targetRequirement = 60,
                requirementDescription = "Complete 60 min Focus & 4 Quests",
                xpReward = 280,
                badgeReward = "Citadel Overlord",
                status = AdventureLevelStatus.LOCKED
            ),

            // Zone 4: Astral Peaks (Levels 16-20)
            AdventureLevel(
                levelNumber = 16,
                zoneId = "astral_peaks",
                zoneName = "Astral Peaks",
                title = "Summit Ascent",
                description = "Climb the highest crags with 60 minutes of deep uninterrupted focus.",
                levelType = AdventureLevelType.FOCUS,
                difficulty = "Expert",
                targetRequirement = 60,
                requirementDescription = "Complete 60 mins Focus",
                xpReward = 200,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 17,
                zoneId = "astral_peaks",
                zoneName = "Astral Peaks",
                title = "Master Artisan",
                description = "Complete 5 quests across diverse categories to showcase broad mastery.",
                levelType = AdventureLevelType.QUEST,
                difficulty = "Master",
                targetRequirement = 5,
                requirementDescription = "Complete 5 Quests",
                xpReward = 220,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 18,
                zoneId = "astral_peaks",
                zoneName = "Astral Peaks",
                title = "Aurora Borealis",
                description = "Ignite the Northern Lights with an extraordinary 14-day streak.",
                levelType = AdventureLevelType.CONSISTENCY,
                difficulty = "Master",
                targetRequirement = 14,
                requirementDescription = "Reach a 14-Day Streak",
                xpReward = 260,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 19,
                zoneId = "astral_peaks",
                zoneName = "Astral Peaks",
                title = "Transcendence",
                description = "Accomplish 90 total focus minutes today in your journey to the stars.",
                levelType = AdventureLevelType.SPECIAL,
                difficulty = "Master",
                targetRequirement = 90,
                requirementDescription = "Log 90 mins Total Focus",
                xpReward = 320,
                status = AdventureLevelStatus.LOCKED
            ),
            AdventureLevel(
                levelNumber = 20,
                zoneId = "astral_peaks",
                zoneName = "Astral Peaks",
                title = "Celestial Sovereign",
                description = "FINAL BOSS: Unify your realm with a 14+ day streak, 60 mins focus, and 5 quests.",
                levelType = AdventureLevelType.BOSS,
                difficulty = "Grandmaster",
                targetRequirement = 60,
                requirementDescription = "14-Day Streak + 60 min Focus",
                xpReward = 500,
                badgeReward = "Celestial Sovereign",
                status = AdventureLevelStatus.LOCKED
            )
        )
    }
}
