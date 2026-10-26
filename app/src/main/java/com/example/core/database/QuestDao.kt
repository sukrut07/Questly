package com.example.core.database

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.example.core.model.QuestStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface QuestDao {
    @Query("SELECT * FROM quests ORDER BY createdAt DESC")
    fun getAllQuests(): Flow<List<QuestEntity>>

    @Query("SELECT * FROM quests WHERE status = :status ORDER BY priority DESC, dueDate ASC")
    fun getQuestsByStatus(status: QuestStatus): Flow<List<QuestEntity>>

    @Query("SELECT * FROM quests WHERE status != 'ARCHIVED' ORDER BY priority DESC, createdAt DESC")
    fun getActiveQuests(): Flow<List<QuestEntity>>

    @Query("SELECT * FROM quests WHERE status = 'COMPLETED' ORDER BY completedAt DESC")
    fun getCompletedQuests(): Flow<List<QuestEntity>>

    @Query("SELECT * FROM quests WHERE id = :id")
    suspend fun getQuestById(id: Long): QuestEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuest(quest: QuestEntity): Long

    @Update
    suspend fun updateQuest(quest: QuestEntity)

    @Delete
    suspend fun deleteQuest(quest: QuestEntity)

    @Query("UPDATE quests SET status = :newStatus, completedAt = :completedAt WHERE id = :id")
    suspend fun updateQuestStatus(id: Long, newStatus: QuestStatus, completedAt: Long?)

    @Query("SELECT * FROM quest_subtasks WHERE questId = :questId")
    fun getSubtasks(questId: Long): Flow<List<QuestSubtaskEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubtasks(subtasks: List<QuestSubtaskEntity>)

    @Update
    suspend fun updateSubtask(subtask: QuestSubtaskEntity)

    @Query("DELETE FROM quest_subtasks WHERE questId = :questId")
    suspend fun deleteSubtasksByQuest(questId: Long)

    @Query("SELECT COUNT(*) FROM quests WHERE status = 'COMPLETED'")
    fun getCompletedQuestCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM quests WHERE status != 'ARCHIVED'")
    fun getTotalActiveQuestCount(): Flow<Int>
}
