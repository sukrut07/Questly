package com.example.core.domain

import com.example.core.model.LevelInfo
import com.example.core.model.ProgressionStage
import com.example.core.model.QuestDifficulty

object XpProgressionEngine {

    // Threshold calculation for levels: baseline 250 + (level - 1) * 100
    fun getXpThresholdForLevel(level: Int): Int {
        if (level <= 1) return 0
        var total = 0
        for (i in 1 until level) {
            total += 250 + (i - 1) * 100
        }
        return total
    }

    fun getXpRequiredForNextLevel(level: Int): Int {
        return 250 + (level - 1) * 100
    }

    fun calculateLevelInfo(totalXp: Int): LevelInfo {
        var level = 1
        while (totalXp >= getXpThresholdForLevel(level + 1)) {
            level++
        }
        val currentLevelBase = getXpThresholdForLevel(level)
        val nextLevelBase = getXpThresholdForLevel(level + 1)
        val required = nextLevelBase - currentLevelBase
        val currentLevelXp = (totalXp - currentLevelBase).coerceIn(0, required)
        val progress = if (required > 0) currentLevelXp.toFloat() / required.toFloat() else 1f

        val stage = getStageForLevel(level)
        val nextUnlock = getNextUnlockPreview(level)

        return LevelInfo(
            currentLevel = level,
            currentLevelXp = currentLevelXp,
            requiredLevelXp = required,
            progressPercent = progress.coerceIn(0f, 1f),
            stage = stage,
            nextLevelUnlock = nextUnlock
        )
    }

    fun getStageForLevel(level: Int): ProgressionStage {
        return when {
            level >= 10 -> ProgressionStage.MASTER
            level >= 6 -> ProgressionStage.STRATEGIST
            level >= 3 -> ProgressionStage.BUILDER
            else -> ProgressionStage.EXPLORER
        }
    }

    fun getNextUnlockPreview(level: Int): String {
        return when (level) {
            1 -> "Level 2: Custom Quest Categories & Deep Work Badges"
            2 -> "Level 3: Builder Stage & Arcane Violet Theme Unlock"
            3 -> "Level 4: Advanced Streak Resiliency & Distraction Tracking"
            4 -> "Level 5: Quest Chains & Skill Tree Progression Nodes"
            5 -> "Level 6: Strategist Stage & Quest Emerald Visuals"
            6 -> "Level 7: Cognitive Skill Mastery & Sprint Multipliers"
            7 -> "Level 8: High Precision Productivity Analytics"
            8 -> "Level 9: Grand Campaign Multi-tier Objectives"
            9 -> "Level 10: Master Stage & Pinnacle Legend Gold Aura"
            else -> "Max Level: Prestige Legacy & Master Showcase"
        }
    }

    fun calculateQuestXp(difficulty: QuestDifficulty, estimatedMinutes: Int): Int {
        val base = difficulty.xpReward
        val bonus = (estimatedMinutes / 30).coerceAtMost(2) * 5
        return (base + bonus).coerceIn(10, 150)
    }

    fun calculateFocusXp(elapsedMinutes: Int): Int {
        // Capped rewards to avoid infinite farming: 1 XP per minute, max 40 XP per session
        return (elapsedMinutes).coerceIn(5, 40)
    }
}
