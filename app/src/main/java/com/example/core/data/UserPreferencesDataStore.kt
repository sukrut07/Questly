package com.example.core.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "questly_settings")

class UserPreferencesDataStore(private val context: Context) {

    private val KEY_ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
    private val KEY_DAILY_FOCUS_TARGET = intPreferencesKey("daily_focus_target_minutes")
    private val KEY_POMODORO_WORK = intPreferencesKey("pomodoro_work_minutes")
    private val KEY_POMODORO_BREAK = intPreferencesKey("pomodoro_break_minutes")
    private val KEY_SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
    private val KEY_HAPTIC_ENABLED = booleanPreferencesKey("haptic_enabled")
    private val KEY_SELECTED_THEME = stringPreferencesKey("selected_theme")

    val isOnboardingCompleted: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_ONBOARDING_COMPLETED] ?: false
    }

    val dailyFocusTargetMinutes: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[KEY_DAILY_FOCUS_TARGET] ?: 60
    }

    val pomodoroWorkMinutes: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[KEY_POMODORO_WORK] ?: 25
    }

    val pomodoroBreakMinutes: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[KEY_POMODORO_BREAK] ?: 5
    }

    val soundEnabled: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_SOUND_ENABLED] ?: true
    }

    val hapticEnabled: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_HAPTIC_ENABLED] ?: true
    }

    val selectedTheme: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_SELECTED_THEME] ?: "midnight"
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun setDailyFocusTarget(minutes: Int) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DAILY_FOCUS_TARGET] = minutes
        }
    }

    suspend fun setPomodoroDurations(workMinutes: Int, breakMinutes: Int) {
        context.dataStore.edit { prefs ->
            prefs[KEY_POMODORO_WORK] = workMinutes
            prefs[KEY_POMODORO_BREAK] = breakMinutes
        }
    }

    suspend fun setSoundEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SOUND_ENABLED] = enabled
        }
    }

    suspend fun setHapticEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_HAPTIC_ENABLED] = enabled
        }
    }

    suspend fun setSelectedTheme(theme: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SELECTED_THEME] = theme
        }
    }
}
