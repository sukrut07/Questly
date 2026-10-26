package com.example.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.core.model.SkillBranch
import kotlinx.coroutines.flow.Flow

@Dao
interface SkillDao {
    @Query("SELECT * FROM skill_nodes ORDER BY requiredLevel ASC")
    fun getAllSkills(): Flow<List<SkillNodeEntity>>

    @Query("SELECT * FROM skill_nodes WHERE branch = :branch ORDER BY requiredLevel ASC")
    fun getSkillsByBranch(branch: SkillBranch): Flow<List<SkillNodeEntity>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertSkills(skills: List<SkillNodeEntity>)

    @Update
    suspend fun updateSkill(skill: SkillNodeEntity)

    @Query("UPDATE skill_nodes SET currentProgress = :progress, isUnlocked = CASE WHEN :progress >= maxProgress THEN 1 ELSE isUnlocked END WHERE id = :id")
    suspend fun updateSkillProgress(id: String, progress: Int)
}
