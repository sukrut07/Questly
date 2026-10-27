package com.example.core.model

enum class SkillBranch(val displayName: String, val description: String, val iconName: String) {
    FOCUS("Focus Mastery", "Deep work capacity and distraction resistance", "self_improvement"),
    CONSISTENCY("Consistency", "Daily habits, streak resilience, and schedule discipline", "trending_up"),
    PLANNING("Strategic Planning", "Quest estimation, backlog hygiene, and objective chains", "architecture"),
    LEARNING("Learning & Knowledge", "Study quests, retention, and exploratory skills", "psychology"),
    CREATIVITY("Creative Spark", "Ideation, creative flow, and novel problem solving", "auto_awesome"),
    EXECUTION("Swift Execution", "Rapid completion, task momentum, and sprint stamina", "bolt")
}

data class SkillNode(
    val id: String,
    val branch: SkillBranch,
    val name: String,
    val description: String,
    val requiredLevel: Int,
    val currentProgress: Int = 0,
    val maxProgress: Int = 100,
    val isUnlocked: Boolean = false,
    val cosmeticReward: String? = null
) {
    val progressPercent: Float
        get() = if (maxProgress <= 0) 1f else (currentProgress.toFloat() / maxProgress.toFloat()).coerceIn(0f, 1f)
}
