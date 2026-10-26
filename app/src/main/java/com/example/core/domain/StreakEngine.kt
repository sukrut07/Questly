package com.example.core.domain

import com.example.core.database.StreakRecordEntity
import java.time.LocalDate
import java.time.temporal.ChronoUnit

object StreakEngine {

    fun updateStreak(
        currentRecord: StreakRecordEntity?,
        today: LocalDate = LocalDate.now(),
        isQualifyingActivity: Boolean = true
    ): StreakRecordEntity {
        if (!isQualifyingActivity) {
            return currentRecord ?: StreakRecordEntity(1, 0, 0, today.toString(), 0)
        }

        if (currentRecord == null) {
            return StreakRecordEntity(
                id = 1,
                currentStreak = 1,
                longestStreak = 1,
                lastActiveDate = today.toString(),
                activeDaysCount = 1
            )
        }

        val lastDate = try {
            LocalDate.parse(currentRecord.lastActiveDate)
        } catch (_: Exception) {
            null
        }

        if (lastDate == null) {
            return currentRecord.copy(
                currentStreak = 1,
                longestStreak = maxOf(1, currentRecord.longestStreak),
                lastActiveDate = today.toString(),
                activeDaysCount = currentRecord.activeDaysCount + 1
            )
        }

        val daysDifference = ChronoUnit.DAYS.between(lastDate, today)

        return when {
            daysDifference == 0L -> {
                // Already counted today
                currentRecord
            }
            daysDifference == 1L -> {
                // Consecutive day
                val newStreak = currentRecord.currentStreak + 1
                val newLongest = maxOf(newStreak, currentRecord.longestStreak)
                currentRecord.copy(
                    currentStreak = newStreak,
                    longestStreak = newLongest,
                    lastActiveDate = today.toString(),
                    activeDaysCount = currentRecord.activeDaysCount + 1
                )
            }
            daysDifference == 2L -> {
                // Missed one day — humane grace period if within 2 days, maintains or resets gracefully
                val newStreak = 1
                currentRecord.copy(
                    currentStreak = newStreak,
                    lastActiveDate = today.toString(),
                    activeDaysCount = currentRecord.activeDaysCount + 1
                )
            }
            else -> {
                // Streak broken
                currentRecord.copy(
                    currentStreak = 1,
                    lastActiveDate = today.toString(),
                    activeDaysCount = currentRecord.activeDaysCount + 1
                )
            }
        }
    }
}
