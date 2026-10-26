package com.example

import com.example.core.database.StreakRecordEntity
import com.example.core.domain.ProductivityScoreEngine
import com.example.core.domain.StreakEngine
import com.example.core.domain.XpProgressionEngine
import com.example.core.model.ProgressionStage
import com.example.core.model.QuestDifficulty
import org.junit.Assert.assertEquals
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

        // Level 3 is reached at 250 + 350 = 600 XP -> BUILDER stage!
        val level3Info = XpProgressionEngine.calculateLevelInfo(650)
        assertEquals(3, level3Info.currentLevel)
        assertEquals(ProgressionStage.BUILDER, level3Info.stage)

        // Level 6 -> STRATEGIST stage
        val level6Info = XpProgressionEngine.calculateLevelInfo(2800)
        assertTrue(level6Info.currentLevel >= 6)
        assertEquals(ProgressionStage.STRATEGIST, level6Info.stage)
    }

    @Test
    fun testQuestXpCalculation() {
        val easyXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.EASY, 15)
        assertEquals(20, easyXp)

        val hardXp = XpProgressionEngine.calculateQuestXp(QuestDifficulty.HARD, 60)
        assertTrue(hardXp >= 70)
    }

    @Test
    fun testFocusXpCapped() {
        // Capped rewards: 1 XP per minute, max 40
        val normalXp = XpProgressionEngine.calculateFocusXp(25)
        assertEquals(25, normalXp)

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
    }

    @Test
    fun testWorldStageEvolutionFromStreak() {
        assertEquals(com.example.core.model.WorldStage.FORGOTTEN_OUTPOST, com.example.core.model.WorldStage.fromStreak(1))
        assertEquals(com.example.core.model.WorldStage.THE_AWAKENING, com.example.core.model.WorldStage.fromStreak(3))
        assertEquals(com.example.core.model.WorldStage.THE_GROWING_REALM, com.example.core.model.WorldStage.fromStreak(7))
        assertEquals(com.example.core.model.WorldStage.THE_RADIANT_CITADEL, com.example.core.model.WorldStage.fromStreak(14))
        assertEquals(com.example.core.model.WorldStage.THE_CELESTIAL_KINGDOM, com.example.core.model.WorldStage.fromStreak(35))
    }
}
