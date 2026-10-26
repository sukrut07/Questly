package com.example.core.model

enum class QuestCategory(val displayName: String, val iconName: String) {
    CODING("Coding & Dev", "code"),
    STUDY("Study & Learning", "school"),
    WORK("Career & Work", "work"),
    FITNESS("Health & Fitness", "fitness_center"),
    READING("Reading", "menu_book"),
    CREATIVITY("Creativity", "palette"),
    PERSONAL("Personal Growth", "person"),
    CUSTOM("Custom Quest", "stars")
}

enum class QuestDifficulty(val displayName: String, val baseMultiplier: Float, val xpReward: Int) {
    EASY("Easy", 1.0f, 20),
    MEDIUM("Medium", 1.5f, 40),
    HARD("Hard", 2.2f, 70),
    EPIC("Epic", 3.0f, 100)
}

enum class QuestPriority(val displayName: String, val level: Int) {
    LOW("Low", 1),
    MEDIUM("Medium", 2),
    HIGH("High", 3),
    URGENT("Urgent", 4)
}

enum class QuestStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    ARCHIVED
}

data class Quest(
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val category: QuestCategory = QuestCategory.CODING,
    val difficulty: QuestDifficulty = QuestDifficulty.MEDIUM,
    val priority: QuestPriority = QuestPriority.MEDIUM,
    val estimatedMinutes: Int = 30,
    val actualMinutes: Int = 0,
    val dueDate: Long? = null,
    val status: QuestStatus = QuestStatus.NOT_STARTED,
    val xpReward: Int = difficulty.xpReward,
    val isRecurring: Boolean = false,
    val recurrenceRule: String? = null,
    val questChainId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null,
    val subtasks: List<QuestSubtask> = emptyList()
)

data class QuestSubtask(
    val id: Long = 0,
    val questId: Long,
    val title: String,
    val isCompleted: Boolean = false
)
