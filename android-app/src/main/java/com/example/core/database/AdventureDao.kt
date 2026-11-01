package com.example.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.core.model.AdventureLevelStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface AdventureDao {

    @Query("SELECT * FROM adventure_levels ORDER BY levelNumber ASC")
    fun getAllLevels(): Flow<List<AdventureLevelEntity>>

    @Query("SELECT * FROM adventure_levels WHERE levelNumber = :levelNumber LIMIT 1")
    suspend fun getLevel(levelNumber: Int): AdventureLevelEntity?

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(levels: List<AdventureLevelEntity>)

    @Query("""
        UPDATE adventure_levels 
        SET status = :status, starsEarned = :stars, completedAt = :completedAt 
        WHERE levelNumber = :levelNumber
    """)
    suspend fun updateCompletion(levelNumber: Int, status: AdventureLevelStatus, stars: Int, completedAt: Long)

    @Query("UPDATE adventure_levels SET status = 'AVAILABLE' WHERE levelNumber = :levelNumber AND status = 'LOCKED'")
    suspend fun unlockLevel(levelNumber: Int)

    @Query("SELECT COUNT(*) FROM adventure_levels")
    suspend fun countLevels(): Int
}
