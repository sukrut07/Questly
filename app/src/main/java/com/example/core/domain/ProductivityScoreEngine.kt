package com.example.core.domain

import com.example.core.model.ProductivityScoreBreakdown
import kotlin.math.roundToInt

object ProductivityScoreEngine {

    /**
     * Explainable formula:
     * P = 0.35C + 0.30F + 0.20G + 0.15S
     *
     * C: Normalized task completion rate (0 - 100)
     * F: Progress toward daily focus target (0 - 100)
     * G: Goal/subtask progress (0 - 100)
     * S: Streak consistency score (0 - 100)
     */
    fun calculateScore(
        completedTasks: Int,
        totalTasks: Int,
        todayFocusMinutes: Int,
        targetFocusMinutes: Int,
        currentStreak: Int,
        targetStreak: Int = 7
    ): ProductivityScoreBreakdown {
        val c = if (totalTasks <= 0) {
            if (completedTasks > 0) 100f else 60f
        } else {
            (completedTasks.toFloat() / totalTasks.toFloat() * 100f).coerceIn(0f, 100f)
        }

        val f = if (targetFocusMinutes <= 0) 100f else {
            (todayFocusMinutes.toFloat() / targetFocusMinutes.toFloat() * 100f).coerceIn(0f, 100f)
        }

        val g = if (completedTasks > 0 || todayFocusMinutes > 0) {
            (((completedTasks * 20f) + (todayFocusMinutes * 1.5f)) / 2f).coerceIn(20f, 100f)
        } else 30f

        val s = ((currentStreak.toFloat() / targetStreak.toFloat()) * 100f).coerceIn(20f, 100f)

        val total = (0.35f * c + 0.30f * f + 0.20f * g + 0.15f * s).roundToInt().coerceIn(0, 100)

        return ProductivityScoreBreakdown(
            totalScore = total,
            completionScore = c,
            focusScore = f,
            goalScore = g,
            streakScore = s
        )
    }
}
