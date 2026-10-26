package com.example.core.model

data class ProductivityScoreBreakdown(
    val totalScore: Int,
    val completionScore: Float, // C (35%)
    val focusScore: Float,      // F (30%)
    val goalScore: Float,       // G (20%)
    val streakScore: Float,     // S (15%)
    val formulaExplanation: String = "Score = 0.35×C + 0.30×F + 0.20×G + 0.15×S"
)

data class AnalyticsSummary(
    val totalFocusHours: Float,
    val weeklyFocusMinutes: Int,
    val dailyFocusMinutes: Int,
    val completedQuestsCount: Int,
    val pendingQuestsCount: Int,
    val completionRatePercent: Float,
    val longestStreakDays: Int,
    val currentStreakDays: Int,
    val productivityScore: ProductivityScoreBreakdown,
    val categoryDistribution: Map<QuestCategory, Int>
)
