package com.example.core.data

import android.content.Context
import com.example.core.database.AchievementEntity
import com.example.core.database.CosmeticItemEntity
import com.example.core.database.FocusSessionEntity
import com.example.core.database.GameRecordEntity
import com.example.core.database.QuestEntity
import com.example.core.database.QuestSubtaskEntity
import com.example.core.database.QuestlyDatabase
import com.example.core.database.UserProfileEntity
import com.example.core.database.XpLedgerEntity
import com.example.core.domain.ProductivityScoreEngine
import com.example.core.domain.StreakEngine
import com.example.core.domain.XpProgressionEngine
import com.example.core.model.Achievement
import com.example.core.model.AchievementCategory
import com.example.core.model.AnalyticsSummary
import com.example.core.model.FocusMode
import com.example.core.model.FocusSession
import com.example.core.model.GameRecord
import com.example.core.model.GameType
import com.example.core.model.LevelInfo
import com.example.core.model.ProgressionStage
import com.example.core.model.Quest
import com.example.core.model.QuestCategory
import com.example.core.model.QuestDifficulty
import com.example.core.model.QuestPriority
import com.example.core.model.QuestStatus
import com.example.core.model.QuestSubtask
import com.example.core.model.SkillBranch
import com.example.core.model.SkillNode
import com.example.core.model.StreakInfo
import com.example.core.model.UserProfile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDate

class QuestlyRepository(
    private val database: QuestlyDatabase,
    private val preferences: UserPreferencesDataStore
) {
    val prefs: UserPreferencesDataStore get() = preferences

    init {
        CoroutineScope(Dispatchers.IO).launch {
            if (database.profileDao().getProfileSync() == null) {
                QuestlyDatabase.seedInitialData(database)
            }
        }
    }

    // --- Quests ---
    val allQuests: Flow<List<Quest>> = database.questDao().getAllQuests().map { entities ->
        entities.map { it.toModel() }
    }

    val activeQuests: Flow<List<Quest>> = database.questDao().getActiveQuests().map { entities ->
        entities.map { it.toModel() }
    }

    val completedQuests: Flow<List<Quest>> = database.questDao().getCompletedQuests().map { entities ->
        entities.map { it.toModel() }
    }

    fun getSubtasks(questId: Long): Flow<List<QuestSubtask>> = database.questDao().getSubtasks(questId).map { entities ->
        entities.map { QuestSubtask(it.id, it.questId, it.title, it.isCompleted) }
    }

    suspend fun createQuest(
        title: String,
        description: String,
        category: QuestCategory,
        difficulty: QuestDifficulty,
        priority: QuestPriority,
        estimatedMinutes: Int,
        dueDate: Long?,
        subtaskTitles: List<String> = emptyList(),
        questChainId: String? = null
    ): Long = withContext(Dispatchers.IO) {
        val xp = XpProgressionEngine.calculateQuestXp(difficulty, estimatedMinutes)
        val entity = QuestEntity(
            id = 0,
            title = title,
            description = description,
            category = category,
            difficulty = difficulty,
            priority = priority,
            estimatedMinutes = estimatedMinutes,
            actualMinutes = 0,
            dueDate = dueDate,
            status = QuestStatus.NOT_STARTED,
            xpReward = xp,
            isRecurring = false,
            recurrenceRule = null,
            questChainId = questChainId,
            createdAt = System.currentTimeMillis(),
            completedAt = null
        )
        val newId = database.questDao().insertQuest(entity)
        if (subtaskTitles.isNotEmpty()) {
            val subtasks = subtaskTitles.map { QuestSubtaskEntity(0, newId, it, false) }
            database.questDao().insertSubtasks(subtasks)
        }
        newId
    }

    suspend fun updateQuest(quest: Quest) = withContext(Dispatchers.IO) {
        val current = database.questDao().getQuestById(quest.id) ?: return@withContext
        database.questDao().updateQuest(
            current.copy(
                title = quest.title,
                description = quest.description,
                category = quest.category,
                difficulty = quest.difficulty,
                priority = quest.priority,
                estimatedMinutes = quest.estimatedMinutes,
                dueDate = quest.dueDate
            )
        )
    }

    suspend fun deleteQuest(questId: Long) = withContext(Dispatchers.IO) {
        val current = database.questDao().getQuestById(questId) ?: return@withContext
        database.questDao().deleteQuest(current)
    }

    suspend fun completeQuest(questId: Long): Int = withContext(Dispatchers.IO) {
        val quest = database.questDao().getQuestById(questId) ?: return@withContext 0
        if (quest.status == QuestStatus.COMPLETED) {
            return@withContext 0
        }

        val completedAt = System.currentTimeMillis()
        database.questDao().updateQuestStatus(questId, QuestStatus.COMPLETED, completedAt)

        val xpGain = quest.xpReward
        awardXp(xpGain, "QUEST_COMPLETION", "Completed quest: ${quest.title}")

        updateStreakForActivity()

        val totalCompleted = database.questDao().getCompletedQuestCount().first()
        database.achievementDao().updateProgress("first_quest", totalCompleted)
        if (totalCompleted >= 1) {
            unlockAchievement("first_quest")
        }

        database.skillDao().updateSkillProgress("execution_1", minOf(100, 25 + totalCompleted * 15))

        xpGain
    }

    suspend fun reopenQuest(questId: Long) = withContext(Dispatchers.IO) {
        database.questDao().updateQuestStatus(questId, QuestStatus.IN_PROGRESS, null)
    }

    suspend fun toggleSubtask(subtaskId: Long, questId: Long, isCompleted: Boolean, title: String) = withContext(Dispatchers.IO) {
        database.questDao().updateSubtask(QuestSubtaskEntity(subtaskId, questId, title, isCompleted))
    }

    // --- Profile & Progression ---
    val profile: Flow<UserProfile> = database.profileDao().getProfile().map { entity ->
        entity?.toModel() ?: UserProfile()
    }

    val levelInfo: Flow<LevelInfo> = profile.map {
        XpProgressionEngine.calculateLevelInfo(it.totalXp)
    }

    val streak: Flow<StreakInfo> = database.profileDao().getStreak().map { entity ->
        if (entity != null) {
            StreakInfo(
                currentStreak = entity.currentStreak,
                longestStreak = entity.longestStreak,
                lastActiveDate = entity.lastActiveDate,
                activeDaysCount = entity.activeDaysCount,
                isProtectedToday = false
            )
        } else {
            StreakInfo()
        }
    }

    val cosmetics: Flow<List<CosmeticItemEntity>> = database.profileDao().getAllCosmetics()

    suspend fun awardXp(amount: Int, source: String, reason: String) = withContext(Dispatchers.IO) {
        if (amount <= 0) return@withContext
        val now = System.currentTimeMillis()
        database.xpDao().recordXpEvent(XpLedgerEntity(0, amount, source, reason, now))

        val currentProfile = database.profileDao().getProfileSync() ?: return@withContext
        val newTotalXp = currentProfile.totalXp + amount
        val newLevelInfo = XpProgressionEngine.calculateLevelInfo(newTotalXp)

        database.profileDao().addXpAndLevel(
            xpGain = amount,
            newLevel = newLevelInfo.currentLevel,
            newStage = newLevelInfo.stage
        )

        if (newLevelInfo.stage >= ProgressionStage.BUILDER) {
            database.profileDao().unlockCosmetic("theme_arcane")
        }
        if (newLevelInfo.stage >= ProgressionStage.STRATEGIST) {
            database.profileDao().unlockCosmetic("theme_emerald")
        }
        if (newLevelInfo.stage >= ProgressionStage.MASTER) {
            database.profileDao().unlockCosmetic("theme_gold")
        }
    }

    private suspend fun updateStreakForActivity() {
        val current = database.profileDao().getStreakSync()
        val updated = StreakEngine.updateStreak(current, LocalDate.now(), true)
        database.profileDao().insertStreak(updated)

        if (updated.currentStreak >= 3) {
            unlockAchievement("streak_3")
        }
        if (updated.currentStreak >= 7) {
            unlockAchievement("streak_7")
        }
    }

    suspend fun updateDisplayName(name: String) = withContext(Dispatchers.IO) {
        val prof = database.profileDao().getProfileSync() ?: return@withContext
        database.profileDao().updateProfile(prof.copy(displayName = name))
    }

    suspend fun updateAvatar(avatarId: String) = withContext(Dispatchers.IO) {
        database.profileDao().updateAvatar(avatarId)
    }

    suspend fun updateVisualTheme(theme: String) = withContext(Dispatchers.IO) {
        database.profileDao().updateTheme(theme)
        preferences.setSelectedTheme(theme)
    }

    // --- Focus Sessions ---
    val focusSessions: Flow<List<FocusSession>> = database.focusSessionDao().getAllSessions().map { list ->
        list.map {
            FocusSession(
                id = it.id,
                questId = it.questId,
                questTitle = it.questTitle,
                mode = it.mode,
                plannedSeconds = it.plannedSeconds,
                elapsedSeconds = it.elapsedSeconds,
                isCompleted = it.isCompleted,
                xpEarned = it.xpEarned,
                startedAt = it.startedAt,
                endedAt = it.endedAt,
                notes = it.notes
            )
        }
    }

    suspend fun recordFocusSession(
        questId: Long?,
        questTitle: String?,
        mode: FocusMode,
        plannedSeconds: Int,
        elapsedSeconds: Int,
        isCompleted: Boolean,
        notes: String = ""
    ): Int = withContext(Dispatchers.IO) {
        val elapsedMinutes = elapsedSeconds / 60
        val xpGain = if (isCompleted && elapsedMinutes >= 1) {
            XpProgressionEngine.calculateFocusXp(elapsedMinutes)
        } else 0

        val sessionEntity = FocusSessionEntity(
            id = 0,
            questId = questId,
            questTitle = questTitle,
            mode = mode,
            plannedSeconds = plannedSeconds,
            elapsedSeconds = elapsedSeconds,
            isCompleted = isCompleted,
            xpEarned = xpGain,
            startedAt = System.currentTimeMillis() - (elapsedSeconds * 1000L),
            endedAt = System.currentTimeMillis(),
            notes = notes
        )
        database.focusSessionDao().insertSession(sessionEntity)

        if (xpGain > 0) {
            awardXp(xpGain, "FOCUS_SESSION", "Completed focus session: $elapsedMinutes mins")
            updateStreakForActivity()

            unlockAchievement("first_focus")
            val totalSeconds = database.focusSessionDao().getTotalElapsedSeconds().first() ?: 0L
            val totalMinutes = (totalSeconds / 60).toInt()
            database.achievementDao().updateProgress("focus_5h", totalMinutes)
            if (totalMinutes >= 300) {
                unlockAchievement("focus_5h")
            }

            database.skillDao().updateSkillProgress("focus_1", minOf(100, 30 + (totalMinutes / 10)))
        }

        xpGain
    }

    // --- Achievements ---
    val achievements: Flow<List<Achievement>> = database.achievementDao().getAllAchievements().map { list ->
        list.map {
            val cat = try {
                AchievementCategory.valueOf(it.category)
            } catch (_: Exception) {
                AchievementCategory.MASTERY
            }
            Achievement(
                id = it.id,
                title = it.title,
                description = it.description,
                iconName = it.iconName,
                category = cat,
                targetValue = it.targetValue,
                currentValue = it.currentValue,
                isUnlocked = it.isUnlocked,
                unlockedAt = it.unlockedAt,
                xpReward = it.xpReward,
                cosmeticReward = it.cosmeticReward
            )
        }
    }

    private suspend fun unlockAchievement(id: String) {
        val ach = database.achievementDao().getAchievement(id) ?: return
        if (!ach.isUnlocked) {
            database.achievementDao().unlock(id, System.currentTimeMillis())
            awardXp(ach.xpReward, "ACHIEVEMENT_UNLOCKED", "Unlocked achievement: ${ach.title}")
        }
    }

    // --- Skills ---
    val skills: Flow<List<SkillNode>> = database.skillDao().getAllSkills().map { list ->
        list.map {
            SkillNode(
                id = it.id,
                branch = it.branch,
                name = it.name,
                description = it.description,
                requiredLevel = it.requiredLevel,
                currentProgress = it.currentProgress,
                maxProgress = it.maxProgress,
                isUnlocked = it.isUnlocked,
                cosmeticReward = it.cosmeticReward
            )
        }
    }

    // --- Arcade ---
    val gameRecords: Flow<List<GameRecord>> = database.gameDao().getAllGameRecords().map { list ->
        list.map {
            GameRecord(
                id = it.id,
                gameType = it.gameType,
                score = it.score,
                moves = it.moves,
                durationSeconds = it.durationSeconds,
                playedAt = it.playedAt
            )
        }
    }

    fun getHighScore(type: GameType): Flow<Int> = database.gameDao().getHighScore(type).map { it ?: 0 }

    suspend fun recordGameScore(type: GameType, score: Int, moves: Int, durationSeconds: Int) = withContext(Dispatchers.IO) {
        database.gameDao().insertRecord(
            GameRecordEntity(
                id = 0,
                gameType = type,
                score = score,
                moves = moves,
                durationSeconds = durationSeconds,
                playedAt = System.currentTimeMillis()
            )
        )

        if (type == GameType.SNAKE && score >= 50) {
            unlockAchievement("arcade_snake")
        }
        if (type == GameType.MEMORY_MATCH && score > 0) {
            unlockAchievement("arcade_memory")
        }
    }

    // --- Analytics ---
    val analyticsSummary: Flow<AnalyticsSummary> = combine(
        database.questDao().getAllQuests(),
        database.focusSessionDao().getTotalElapsedSeconds(),
        streak,
        preferences.dailyFocusTargetMinutes
    ) { allQuestsEntities, totalSeconds, streakInfo, targetMins ->
        val totalCount = allQuestsEntities.count { it.status != QuestStatus.ARCHIVED }
        val completedCount = allQuestsEntities.count { it.status == QuestStatus.COMPLETED }
        val totalSecs = totalSeconds ?: 0L
        val totalHours = totalSecs / 3600f
        val dailyFocusMins = ((totalSecs % 86400) / 60).toInt()
        val completionRate = if (totalCount > 0) (completedCount.toFloat() / totalCount.toFloat()) * 100f else 0f

        val breakdown = ProductivityScoreEngine.calculateScore(
            completedTasks = completedCount,
            totalTasks = totalCount,
            todayFocusMinutes = dailyFocusMins,
            targetFocusMinutes = targetMins,
            currentStreak = streakInfo.currentStreak
        )

        val catMap = mutableMapOf<QuestCategory, Int>()
        allQuestsEntities.forEach { q ->
            catMap[q.category] = (catMap[q.category] ?: 0) + 1
        }

        AnalyticsSummary(
            totalFocusHours = totalHours,
            weeklyFocusMinutes = (totalSecs / 60).toInt(),
            dailyFocusMinutes = dailyFocusMins,
            completedQuestsCount = completedCount,
            pendingQuestsCount = (totalCount - completedCount).coerceAtLeast(0),
            completionRatePercent = completionRate,
            longestStreakDays = streakInfo.longestStreak,
            currentStreakDays = streakInfo.currentStreak,
            productivityScore = breakdown,
            categoryDistribution = catMap
        )
    }

    suspend fun resetAllData() = withContext(Dispatchers.IO) {
        database.clearAllTables()
        QuestlyDatabase.seedInitialData(database)
        preferences.setOnboardingCompleted(false)
    }

    private fun QuestEntity.toModel(): Quest {
        return Quest(
            id = id,
            title = title,
            description = description,
            category = category,
            difficulty = difficulty,
            priority = priority,
            estimatedMinutes = estimatedMinutes,
            actualMinutes = actualMinutes,
            dueDate = dueDate,
            status = status,
            xpReward = xpReward,
            isRecurring = isRecurring,
            recurrenceRule = recurrenceRule,
            questChainId = questChainId,
            createdAt = createdAt,
            completedAt = completedAt
        )
    }

    private fun UserProfileEntity.toModel(): UserProfile {
        return UserProfile(
            id = id,
            displayName = displayName,
            avatarId = avatarId,
            level = level,
            totalXp = totalXp,
            currentStage = currentStage,
            visualTheme = visualTheme,
            title = title,
            createdAt = createdAt
        )
    }

    companion object {
        @Volatile
        private var INSTANCE: QuestlyRepository? = null

        fun getInstance(context: Context): QuestlyRepository {
            return INSTANCE ?: synchronized(this) {
                val db = QuestlyDatabase.getDatabase(context)
                val prefs = UserPreferencesDataStore(context)
                val instance = QuestlyRepository(db, prefs)
                INSTANCE = instance
                instance
            }
        }
    }
}
