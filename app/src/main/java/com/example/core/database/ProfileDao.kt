package com.example.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.core.model.ProgressionStage
import kotlinx.coroutines.flow.Flow

@Dao
interface ProfileDao {
    @Query("SELECT * FROM user_profiles WHERE id = 1")
    fun getProfile(): Flow<UserProfileEntity?>

    @Query("SELECT * FROM user_profiles WHERE id = 1")
    suspend fun getProfileSync(): UserProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: UserProfileEntity)

    @Update
    suspend fun updateProfile(profile: UserProfileEntity)

    @Query("UPDATE user_profiles SET totalXp = totalXp + :xpGain, level = :newLevel, currentStage = :newStage WHERE id = 1")
    suspend fun addXpAndLevel(xpGain: Int, newLevel: Int, newStage: ProgressionStage)

    @Query("UPDATE user_profiles SET visualTheme = :theme WHERE id = 1")
    suspend fun updateTheme(theme: String)

    @Query("UPDATE user_profiles SET avatarId = :avatarId WHERE id = 1")
    suspend fun updateAvatar(avatarId: String)

    @Query("SELECT * FROM streak_records WHERE id = 1")
    fun getStreak(): Flow<StreakRecordEntity?>

    @Query("SELECT * FROM streak_records WHERE id = 1")
    suspend fun getStreakSync(): StreakRecordEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStreak(streak: StreakRecordEntity)

    @Update
    suspend fun updateStreak(streak: StreakRecordEntity)

    @Query("SELECT * FROM cosmetic_items")
    fun getAllCosmetics(): Flow<List<CosmeticItemEntity>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertCosmetics(items: List<CosmeticItemEntity>)

    @Query("UPDATE cosmetic_items SET isUnlocked = 1 WHERE id = :id")
    suspend fun unlockCosmetic(id: String)
}
