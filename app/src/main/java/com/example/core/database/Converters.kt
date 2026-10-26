package com.example.core.database

import androidx.room.TypeConverter
import com.example.core.model.FocusMode
import com.example.core.model.GameType
import com.example.core.model.ProgressionStage
import com.example.core.model.QuestCategory
import com.example.core.model.QuestDifficulty
import com.example.core.model.QuestPriority
import com.example.core.model.QuestStatus
import com.example.core.model.SkillBranch

class Converters {
    @TypeConverter
    fun fromQuestCategory(value: QuestCategory): String = value.name

    @TypeConverter
    fun toQuestCategory(value: String): QuestCategory = try {
        QuestCategory.valueOf(value)
    } catch (_: Exception) {
        QuestCategory.CUSTOM
    }

    @TypeConverter
    fun fromQuestDifficulty(value: QuestDifficulty): String = value.name

    @TypeConverter
    fun toQuestDifficulty(value: String): QuestDifficulty = try {
        QuestDifficulty.valueOf(value)
    } catch (_: Exception) {
        QuestDifficulty.MEDIUM
    }

    @TypeConverter
    fun fromQuestPriority(value: QuestPriority): String = value.name

    @TypeConverter
    fun toQuestPriority(value: String): QuestPriority = try {
        QuestPriority.valueOf(value)
    } catch (_: Exception) {
        QuestPriority.MEDIUM
    }

    @TypeConverter
    fun fromQuestStatus(value: QuestStatus): String = value.name

    @TypeConverter
    fun toQuestStatus(value: String): QuestStatus = try {
        QuestStatus.valueOf(value)
    } catch (_: Exception) {
        QuestStatus.NOT_STARTED
    }

    @TypeConverter
    fun fromFocusMode(value: FocusMode): String = value.name

    @TypeConverter
    fun toFocusMode(value: String): FocusMode = try {
        FocusMode.valueOf(value)
    } catch (_: Exception) {
        FocusMode.POMODORO
    }

    @TypeConverter
    fun fromProgressionStage(value: ProgressionStage): String = value.name

    @TypeConverter
    fun toProgressionStage(value: String): ProgressionStage = try {
        ProgressionStage.valueOf(value)
    } catch (_: Exception) {
        ProgressionStage.EXPLORER
    }

    @TypeConverter
    fun fromSkillBranch(value: SkillBranch): String = value.name

    @TypeConverter
    fun toSkillBranch(value: String): SkillBranch = try {
        SkillBranch.valueOf(value)
    } catch (_: Exception) {
        SkillBranch.FOCUS
    }

    @TypeConverter
    fun fromGameType(value: GameType): String = value.name

    @TypeConverter
    fun toGameType(value: String): GameType = try {
        GameType.valueOf(value)
    } catch (_: Exception) {
        GameType.SNAKE
    }
}
