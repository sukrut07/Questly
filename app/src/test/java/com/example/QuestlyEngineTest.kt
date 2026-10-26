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
        // Stage 1: Forgotten Outpost (0 - 2 days)
        assertEquals(WorldStage.FORGOTTEN_OUTPOST, WorldStage.fromStreak(0))
        assertEquals(WorldStage.FORGOTTEN_OUTPOST, WorldStage.fromStreak(1))
        assertEquals(WorldStage.FORGOTTEN_OUTPOST, WorldStage.fromStreak(2))

        // Stage 2: Awakening (3 - 6 days)
        assertEquals(WorldStage.THE_AWAKENING, WorldStage.fromStreak(3))
        assertEquals(WorldStage.THE_AWAKENING, WorldStage.fromStreak(6))

        // Stage 3: Growing Realm (7 - 13 days)
        assertEquals(WorldStage.THE_GROWING_REALM, WorldStage.fromStreak(7))
        assertEquals(WorldStage.THE_GROWING_REALM, WorldStage.fromStreak(13))

        // Stage 4: Radiant Citadel (14 - 29 days)
        assertEquals(WorldStage.THE_RADIANT_CITADEL, WorldStage.fromStreak(14))
        assertEquals(WorldStage.THE_RADIANT_CITADEL, WorldStage.fromStreak(29))

        // Stage 5: Celestial Kingdom (30+ days)
        assertEquals(WorldStage.THE_CELESTIAL_KINGDOM, WorldStage.fromStreak(30))
        assertEquals(WorldStage.THE_CELESTIAL_KINGDOM, WorldStage.fromStreak(100))
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
}
