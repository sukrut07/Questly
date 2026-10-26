package com.example.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface XpDao {
    @Query("SELECT * FROM xp_ledger ORDER BY createdAt DESC LIMIT 50")
    fun getRecentLedger(): Flow<List<XpLedgerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun recordXpEvent(event: XpLedgerEntity): Long

    @Query("SELECT SUM(amount) FROM xp_ledger")
    fun getTotalCalculatedXp(): Flow<Int?>
}
