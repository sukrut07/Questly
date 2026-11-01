package com.example.ui.widget

import android.content.Context
import android.content.SharedPreferences

data class QuestlyWidgetData(
    val level: Int = 1,
    val currentXp: Int = 0,
    val requiredXp: Int = 100,
    val currentStreak: Int = 1,
    val worldStage: String = "Forgotten Outpost",
    val todayFocusMins: Int = 0,
    val targetFocusMins: Int = 60,
    val todayCompletedQuests: Int = 0,
    val targetQuests: Int = 3,
    val recommendedQuestTitle: String = "Begin Daily Focus Session",
    val recommendedQuestMins: Int = 25
) {
    val progressPercent: Int
        get() = if (requiredXp > 0) {
            ((currentXp.toFloat() / requiredXp.toFloat()) * 100).toInt().coerceIn(0, 100)
        } else 0

    fun save(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt(KEY_LEVEL, level)
            putInt(KEY_CURRENT_XP, currentXp)
            putInt(KEY_REQUIRED_XP, requiredXp)
            putInt(KEY_STREAK, currentStreak)
            putString(KEY_STAGE, worldStage)
            putInt(KEY_FOCUS_MINS, todayFocusMins)
            putInt(KEY_TARGET_FOCUS, targetFocusMins)
            putInt(KEY_COMPLETED_QUESTS, todayCompletedQuests)
            putInt(KEY_TARGET_QUESTS, targetQuests)
            putString(KEY_QUEST_TITLE, recommendedQuestTitle)
            putInt(KEY_QUEST_MINS, recommendedQuestMins)
            apply()
        }
    }

    companion object {
        private const val PREFS_NAME = "questly_widget_prefs"
        private const val KEY_LEVEL = "key_level"
        private const val KEY_CURRENT_XP = "key_current_xp"
        private const val KEY_REQUIRED_XP = "key_required_xp"
        private const val KEY_STREAK = "key_streak"
        private const val KEY_STAGE = "key_stage"
        private const val KEY_FOCUS_MINS = "key_focus_mins"
        private const val KEY_TARGET_FOCUS = "key_target_focus"
        private const val KEY_COMPLETED_QUESTS = "key_completed_quests"
        private const val KEY_TARGET_QUESTS = "key_target_quests"
        private const val KEY_QUEST_TITLE = "key_quest_title"
        private const val KEY_QUEST_MINS = "key_quest_mins"

        fun load(context: Context): QuestlyWidgetData {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return QuestlyWidgetData(
                level = prefs.getInt(KEY_LEVEL, 1),
                currentXp = prefs.getInt(KEY_CURRENT_XP, 45),
                requiredXp = prefs.getInt(KEY_REQUIRED_XP, 100),
                currentStreak = prefs.getInt(KEY_STREAK, 1),
                worldStage = prefs.getString(KEY_STAGE, "First Sparks") ?: "First Sparks",
                todayFocusMins = prefs.getInt(KEY_FOCUS_MINS, 0),
                targetFocusMins = prefs.getInt(KEY_TARGET_FOCUS, 60),
                todayCompletedQuests = prefs.getInt(KEY_COMPLETED_QUESTS, 0),
                targetQuests = prefs.getInt(KEY_TARGET_QUESTS, 3),
                recommendedQuestTitle = prefs.getString(KEY_QUEST_TITLE, "Explore Adventure Map") ?: "Explore Adventure Map",
                recommendedQuestMins = prefs.getInt(KEY_QUEST_MINS, 25)
            )
        }
    }
}
