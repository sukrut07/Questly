package com.example.core.model

enum class FocusMode(val displayName: String, val defaultMinutes: Int) {
    POMODORO("Pomodoro", 25),
    SHORT_BREAK("Short Break", 5),
    LONG_BREAK("Long Break", 15),
    STOPWATCH("Stopwatch", 0),
    CUSTOM("Custom Timer", 45)
}

enum class TimerState {
    IDLE,
    RUNNING,
    PAUSED,
    COMPLETED
}

data class FocusSession(
    val id: Long = 0,
    val questId: Long? = null,
    val questTitle: String? = null,
    val mode: FocusMode = FocusMode.POMODORO,
    val plannedSeconds: Int = 25 * 60,
    val elapsedSeconds: Int = 0,
    val isCompleted: Boolean = false,
    val xpEarned: Int = 0,
    val startedAt: Long = System.currentTimeMillis(),
    val endedAt: Long? = null,
    val notes: String = ""
)
