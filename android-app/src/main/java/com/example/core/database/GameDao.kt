package com.example.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.core.model.GameType
import kotlinx.coroutines.flow.Flow

@Dao
interface GameDao {
    @Query("SELECT * FROM game_records ORDER BY playedAt DESC")
    fun getAllGameRecords(): Flow<List<GameRecordEntity>>

    @Query("SELECT * FROM game_records WHERE gameType = :type ORDER BY score DESC, playedAt DESC")
    fun getRecordsByType(type: GameType): Flow<List<GameRecordEntity>>

    @Query("SELECT MAX(score) FROM game_records WHERE gameType = :type")
    fun getHighScore(type: GameType): Flow<Int?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: GameRecordEntity): Long
}
