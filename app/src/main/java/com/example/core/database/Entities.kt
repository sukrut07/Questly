package com.example.core.database

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.core.model.FocusMode
import com.example.core.model.GameType
import com.example.core.model.ProgressionStage
import com.example.core.model.QuestCategory
import com.example.core.model.QuestDifficulty
import com.example.core.model.QuestPriority
import com.example.core.model.QuestStatus
import com.example.core.model.SkillBranch

@Entity(tableName = "user_profiles")
data class UserProfileEntity(
    @PrimaryKey val id: Long = 1,
    val displayName: String,
    val avatarId: String,
    val level: Int,
    val totalXp: Int,
    val currentStage: ProgressionStage,
    val visualTheme: String,
    val title: String,
    val createdAt: Long
)

@Entity(
    tableName = "quests",
    indices = [Index("status"), Index("category"), Index("dueDate")]
)
data class QuestEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val description: String,
    val category: QuestCategory,
    val difficulty: QuestDifficulty,
    val priority: QuestPriority,
    val estimatedMinutes: Int,
    val actualMinutes: Int,
    val dueDate: Long?,
    val status: QuestStatus,
    val xpReward: Int,
    val isRecurring: Boolean,
    val recurrenceRule: String?,
    val questChainId: String?,
    val createdAt: Long,
    val completedAt: Long?
)

@Entity(
    tableName = "quest_subtasks",
    foreignKeys = [
        ForeignKey(
            entity = QuestEntity::class,
            parentColumns = ["id"],
            childColumns = ["questId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("questId")]
)
data class QuestSubtaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val questId: Long,
    val title: String,
    val isCompleted: Boolean
)

@Entity(
    tableName = "focus_sessions",
    indices = [Index("questId"), Index("startedAt")]
)
data class FocusSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val questId: Long?,
    val questTitle: String?,
    val mode: FocusMode,
    val plannedSeconds: Int,
    val elapsedSeconds: Int,
    val isCompleted: Boolean,
    val xpEarned: Int,
    val startedAt: Long,
    val endedAt: Long?,
    val notes: String
)

@Entity(tableName = "streak_records")
data class StreakRecordEntity(
    @PrimaryKey val id: Long = 1,
    val currentStreak: Int,
    val longestStreak: Int,
    val lastActiveDate: String,
    val activeDaysCount: Int
)

@Entity(
    tableName = "xp_ledger",
    indices = [Index("createdAt")]
)
data class XpLedgerEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val amount: Int,
    val source: String,
    val reason: String,
    val createdAt: Long
)

@Entity(tableName = "achievements")
data class AchievementEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val iconName: String,
    val category: String,
    val targetValue: Int,
    val currentValue: Int,
    val isUnlocked: Boolean,
    val unlockedAt: Long?,
    val xpReward: Int,
    val cosmeticReward: String?
)

@Entity(tableName = "skill_nodes")
data class SkillNodeEntity(
    @PrimaryKey val id: String,
    val branch: SkillBranch,
    val name: String,
    val description: String,
    val requiredLevel: Int,
    val currentProgress: Int,
    val maxProgress: Int,
    val isUnlocked: Boolean,
    val cosmeticReward: String?
)

@Entity(
    tableName = "game_records",
    indices = [Index("gameType"), Index("playedAt")]
)
data class GameRecordEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val gameType: GameType,
    val score: Int,
    val moves: Int,
    val durationSeconds: Int,
    val playedAt: Long
)

@Entity(tableName = "cosmetic_items")
data class CosmeticItemEntity(
    @PrimaryKey val id: String,
    val type: String, // "theme", "frame", "badge"
    val name: String,
    val description: String,
    val isUnlocked: Boolean,
    val isEquipped: Boolean,
    val previewColor: Long
)
