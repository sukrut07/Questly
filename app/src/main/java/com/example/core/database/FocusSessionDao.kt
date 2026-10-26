package com.example.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface FocusSessionDao {
    @Query("SELECT * FROM focus_sessions ORDER BY startedAt DESC")
    fun getAllSessions(): Flow<List<FocusSessionEntity>>

    @Query("SELECT * FROM focus_sessions WHERE isCompleted = 1 ORDER BY startedAt DESC")
    fun getCompletedSessions(): Flow<List<FocusSessionEntity>>

    @Query("SELECT * FROM focus_sessions WHERE startedAt >= :sinceTimestamp ORDER BY startedAt DESC")
    fun getSessionsSince(sinceTimestamp: Long): Flow<List<FocusSessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: FocusSessionEntity): Long

    @Query("SELECT SUM(elapsedSeconds) FROM focus_sessions WHERE isCompleted = 1")
    fun getTotalElapsedSeconds(): Flow<Long?>

    @Query("SELECT SUM(elapsedSeconds) FROM focus_sessions WHERE isCompleted = 1 AND startedAt >= :sinceTimestamp")
    fun getElapsedSecondsSince(sinceTimestamp: Long): Flow<Long?>
}
