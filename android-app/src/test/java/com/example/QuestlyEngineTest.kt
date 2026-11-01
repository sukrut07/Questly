package com.example

import com.example.core.database.StreakRecordEntity
import com.example.core.domain.ProductivityScoreEngine
import com.example.core.domain.StreakEngine
import com.example.core.domain.XpProgressionEngine
import com.example.core.model.GameType
import com.example.core.model.ProgressionStage
import com.example.core.model.QuestDifficulty
import com.example.core.model.WorldStage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class QuestlyEngineTest {

    @Test
    fun testLevelProgressionCalculation() {
        val level1Info = XpProgressionEngine.calculateLevelInfo(0)
        assertEquals(1, level1Info.currentLevel)
        assertEquals(ProgressionStage.EXPLORER, level1Info.stage)
        assertEquals(0, level1Info.currentLevelXp)

        // Threshold for level 2 is 250 XP
        val level2Info = XpProgressionEngine.calculateLevelInfo(250)
        assertEquals(2, level2Info.currentLevel)
        assertEquals(ProgressionStage.EXPLORER, level2Info.stage)

        // Level 3 is reached at 250 + 350 = 600 XP -> BUILDER stage
        val level3Info = XpProgressionEngine.calculateLevelInfo(650)
        assertEquals(3, level3Info.currentLevel)
        assertEquals(ProgressionStage.BUILDER, level3Info.stage)

        // Level 6 -> STRATEGIST stage
        val level6Info = XpProgressionEngine.calculateLevelInfo(2800)
        assertTrue(level6Info.currentLevel >= 6)
        assertEquals(ProgressionStage.STRATEGIST, level6Info.stage)
    }

    @Test
    fun testQuestXpCalculationAllTiers() {
        val easyXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.EASY, 15)
        assertEquals(20, easyXp)

        val mediumXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.MEDIUM, 30)
        assertTrue(mediumXp in 35..55)

        val hardXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.HARD, 60)
        assertTrue(hardXp >= 70)

        val epicXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.EPIC, 90)
        assertTrue(epicXp >= 100)

        val legendaryXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.LEGENDARY, 120)
        assertTrue(legendaryXp >= 150)
    }

    @Test
    fun testFocusXpCapped() {
        // Capped rewards: 1 XP per minute, max 40 per session
        val zeroXp = XpProgressionEngine.calculateFocusXp(0)
        assertEquals(0, zeroXp)

        val normalXp = XpProgressionEngine.calculateFocusXp(25)
        assertEquals(25, normalXp)

        val maxAllowedXp = XpProgressionEngine.calculateFocusXp(40)
        assertEquals(40, maxAllowedXp)

        val excessiveXp = XpProgressionEngine.calculateFocusXp(120)
        assertEquals(40, excessiveXp)
    }

    @Test
    fun testStreakConsecutiveDays() {
        val baseDate = LocalDate.of(2026, 10, 20)
        val initial = StreakRecordEntity(1, 1, 1, baseDate.toString(), 1)

        val nextDay = LocalDate.of(2026, 10, 21)
        val updated = StreakEngine.updateStreak(initial, nextDay, true)
        assertEquals(2, updated.currentStreak)
        assertEquals(2, updated.longestStreak)
        assertEquals(nextDay.toString(), updated.lastActiveDate)

        // Same day event doesn't increment
        val sameDay = StreakEngine.updateStreak(updated, nextDay, true)
        assertEquals(2, sameDay.currentStreak)
    }

    @Test
    fun testStreakFreezeProtection() {
        val baseDate = LocalDate.of(2026, 10, 20)
        // User with streak 5 and 1 freeze shield
        val initial = StreakRecordEntity(1, 5, 5, baseDate.toString(), 1)

        // Missed a day: jumping to 2026-10-22 (2 days later)
        val twoDaysLater = LocalDate.of(2026, 10, 22)
        val protectedResult = StreakEngine.updateStreak(initial, twoDaysLater, true)

        // Freeze consumed, streak preserved
        assertEquals(5, protectedResult.currentStreak)
        assertEquals(0, protectedResult.freezesRemaining)

        // Another missed day with 0 freezes resets streak to 1
        val fourDaysLater = LocalDate.of(2026, 10, 25)
        val resetResult = StreakEngine.updateStreak(protectedResult, fourDaysLater, true)
        assertEquals(1, resetResult.currentStreak)
    }

    @Test
    fun testProductivityScoreFormula() {
        // Formula: P = 0.35C + 0.30F + 0.20G + 0.15S
        val breakdown = ProductivityScoreEngine.calculateScore(
            completedTasks = 5,
            totalTasks = 5, // 100% C
            todayFocusMinutes = 60,
            targetFocusMinutes = 60, // 100% F
            currentStreak = 7,
            targetStreak = 7 // 100% S
        )

        assertTrue(breakdown.totalScore in 90..100)
        assertEquals(100f, breakdown.completionScore)
        assertEquals(100f, breakdown.focusScore)
        assertEquals(100f, breakdown.streakScore)
    }

    @Test
    fun testProductivityScoreZeroTasks() {
        val breakdown = ProductivityScoreEngine.calculateScore(
            completedTasks = 0,
            totalTasks = 0,
            todayFocusMinutes = 0,
            targetFocusMinutes = 60,
            currentStreak = 0,
            targetStreak = 7
        )

        assertEquals(0, breakdown.totalScore)
    }

    @Test
    fun testWorldStageEvolutionFromStreak() {
        // Stage 1: Forgotten Outpost (0 - 1 days)
        assertEquals(WorldStage.FORGOTTEN_OUTPOST, WorldStage.fromStreak(0))
        assertEquals(WorldStage.FORGOTTEN_OUTPOST, WorldStage.fromStreak(1))

        // Stage 2: First Sparks (2 - 4 days)
        assertEquals(WorldStage.FIRST_SPARKS, WorldStage.fromStreak(2))
        assertEquals(WorldStage.FIRST_SPARKS, WorldStage.fromStreak(4))

        // Stage 3: Awakening (5 - 9 days)
        assertEquals(WorldStage.AWAKENING, WorldStage.fromStreak(5))
        assertEquals(WorldStage.AWAKENING, WorldStage.fromStreak(9))

        // Stage 4: Growing Realm (10 - 19 days)
        assertEquals(WorldStage.GROWING_REALM, WorldStage.fromStreak(10))
        assertEquals(WorldStage.GROWING_REALM, WorldStage.fromStreak(19))

        // Stage 5: Radiant Citadel (20 - 29 days)
        assertEquals(WorldStage.RADIANT_CITADEL, WorldStage.fromStreak(20))
        assertEquals(WorldStage.RADIANT_CITADEL, WorldStage.fromStreak(29))

        // Stage 6: Celestial Kingdom (30+ days)
        assertEquals(WorldStage.CELESTIAL_KINGDOM, WorldStage.fromStreak(30))
        assertEquals(WorldStage.CELESTIAL_KINGDOM, WorldStage.fromStreak(100))
    }

    @Test
    fun testPresentationModesHumaneRecovery() {
        val today = LocalDate.now().toString()
        val yesterday = LocalDate.now().minusDays(1).toString()
        val threeDaysAgo = LocalDate.now().minusDays(3).toString()

        val flourishingStreak = com.example.core.model.StreakInfo(currentStreak = 4, lastActiveDate = today)
        assertEquals(com.example.core.model.WorldPresentationMode.FLOURISHING, flourishingStreak.presentationMode)

        val stableStreak = com.example.core.model.StreakInfo(currentStreak = 4, lastActiveDate = yesterday)
        assertEquals(com.example.core.model.WorldPresentationMode.STABLE, stableStreak.presentationMode)

        val restingStreak = com.example.core.model.StreakInfo(currentStreak = 1, lastActiveDate = threeDaysAgo)
        assertEquals(com.example.core.model.WorldPresentationMode.RESTING, restingStreak.presentationMode)
        // Structures never deleted, stage still reflects streak:
        assertEquals(WorldStage.FORGOTTEN_OUTPOST, restingStreak.worldStage)
    }

    @Test
    fun testArcadeGameTypesExistAndDistinct() {
        val gameTypes = GameType.values()
        assertTrue(gameTypes.contains(GameType.QUEST_DEFENDER))
        assertTrue(gameTypes.contains(GameType.CRYSTAL_MAZE))
        assertTrue(gameTypes.contains(GameType.SNAKE))
        assertTrue(gameTypes.contains(GameType.MEMORY_MATCH))
        assertEquals(4, gameTypes.size)
    }

    @Test
    fun testAdventureLevelsStructureAndProgression() {
        val defaultLevels = com.example.core.model.DefaultAdventureLevels.getInitialLevels()
        assertEquals(20, defaultLevels.size)

        // Level 1 starts AVAILABLE, others are LOCKED
        assertEquals(1, defaultLevels.first().levelNumber)
        assertEquals(com.example.core.model.AdventureLevelStatus.AVAILABLE, defaultLevels.first().status)
        assertTrue(defaultLevels.drop(1).all { it.status == com.example.core.model.AdventureLevelStatus.LOCKED })

        // Check Zone distribution across all 4 zones
        val zones = defaultLevels.map { it.zone }.distinct()
        assertEquals(4, zones.size)
        assertTrue(zones.contains(com.example.core.model.AdventureZone.WHISPERING_GLADE))
        assertTrue(zones.contains(com.example.core.model.AdventureZone.CRYSTAL_SPIRES))
        assertTrue(zones.contains(com.example.core.model.AdventureZone.SUNKEN_CITADEL))
        assertTrue(zones.contains(com.example.core.model.AdventureZone.ASTRAL_PEAKS))

        // Level 5 is the first Boss node
        val level5 = defaultLevels.find { it.levelNumber == 5 }!!
        assertEquals(com.example.core.model.AdventureLevelType.BOSS, level5.type)
        assertEquals(150, level5.xpReward)
    }

    @Test
    fun testWidgetDataCalculationAndMapping() {
        val data = com.example.ui.widget.QuestlyWidgetData(
            level = 5,
            currentXp = 340,
            requiredXp = 500,
            currentStreak = 4,
            worldStage = "Awakening",
            todayFocusMins = 45,
            targetFocusMins = 90,
            todayCompletedQuests = 3,
            targetQuests = 5,
            recommendedQuestTitle = "Study System Architecture",
            recommendedQuestMins = 45
        )

        assertEquals(68, data.progressPercent)
        assertEquals("Awakening", data.worldStage)
        assertEquals(4, data.currentStreak)

        // Zero required XP gracefully handles divide-by-zero
        val zeroData = com.example.ui.widget.QuestlyWidgetData(currentXp = 0, requiredXp = 0)
        assertEquals(0, zeroData.progressPercent)
    }
}
