package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.core.data.QuestlyRepository
import com.example.core.database.CosmeticItemEntity
import com.example.core.model.Achievement
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
import com.example.core.model.SkillNode
import com.example.core.model.StreakInfo
import com.example.core.model.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    val repository = QuestlyRepository.getInstance(application)

    val isOnboardingCompleted: StateFlow<Boolean> = repository.prefs.isOnboardingCompleted
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val profile: StateFlow<UserProfile> = repository.profile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UserProfile())

    val levelInfo: StateFlow<LevelInfo> = repository.levelInfo
        .stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            LevelInfo(1, 0, 250, 0f, ProgressionStage.EXPLORER, "Level 2: Custom Quest Categories")
        )

    val streak: StateFlow<StreakInfo> = repository.streak
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), StreakInfo())

    val allQuests: StateFlow<List<Quest>> = repository.allQuests
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val activeQuests: StateFlow<List<Quest>> = repository.activeQuests
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val completedQuests: StateFlow<List<Quest>> = repository.completedQuests
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val achievements: StateFlow<List<Achievement>> = repository.achievements
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val skills: StateFlow<List<SkillNode>> = repository.skills
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val focusSessions: StateFlow<List<FocusSession>> = repository.focusSessions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val analytics: StateFlow<AnalyticsSummary?> = repository.analyticsSummary
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val defenderHighScore: StateFlow<Int> = repository.getHighScore(GameType.QUEST_DEFENDER)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val mazeHighScore: StateFlow<Int> = repository.getHighScore(GameType.CRYSTAL_MAZE)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val snakeHighScore: StateFlow<Int> = repository.getHighScore(GameType.SNAKE)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val memoryHighScore: StateFlow<Int> = repository.getHighScore(GameType.MEMORY_MATCH)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val cosmetics: StateFlow<List<CosmeticItemEntity>> = repository.cosmetics
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Feedback message state
    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    fun showToast(message: String) {
        _toastMessage.value = message
    }

    fun clearToast() {
        _toastMessage.value = null
    }

    fun completeQuest(questId: Long) {
        viewModelScope.launch {
            val xpGain = repository.completeQuest(questId)
            if (xpGain > 0) {
                showToast("Quest Complete! +$xpGain XP earned")
            }
        }
    }

    fun createQuest(
        title: String,
        description: String,
        category: QuestCategory,
        difficulty: QuestDifficulty,
        priority: QuestPriority,
        estimatedMinutes: Int,
        dueDate: Long?,
        subtasks: List<String> = emptyList(),
        questChainId: String? = null
    ) {
        viewModelScope.launch {
            repository.createQuest(
                title = title,
                description = description,
                category = category,
                difficulty = difficulty,
                priority = priority,
                estimatedMinutes = estimatedMinutes,
                dueDate = dueDate,
                subtaskTitles = subtasks,
                questChainId = questChainId
            )
            showToast("Quest created: $title")
        }
    }

    fun updateQuest(quest: Quest) {
        viewModelScope.launch {
            repository.updateQuest(quest)
        }
    }

    fun deleteQuest(questId: Long) {
        viewModelScope.launch {
            repository.deleteQuest(questId)
            showToast("Quest archived")
        }
    }

    fun reopenQuest(questId: Long) {
        viewModelScope.launch {
            repository.reopenQuest(questId)
        }
    }

    fun recordFocusSession(
        questId: Long?,
        questTitle: String?,
        mode: FocusMode,
        plannedSeconds: Int,
        elapsedSeconds: Int,
        isCompleted: Boolean,
        notes: String = ""
    ) {
        viewModelScope.launch {
            val xp = repository.recordFocusSession(
                questId = questId,
                questTitle = questTitle,
                mode = mode,
                plannedSeconds = plannedSeconds,
                elapsedSeconds = elapsedSeconds,
                isCompleted = isCompleted,
                notes = notes
            )
            if (xp > 0) {
                showToast("Focus session complete! +$xp XP earned")
            }
        }
    }

    fun recordGameScore(type: GameType, score: Int, moves: Int, durationSeconds: Int) {
        viewModelScope.launch {
            repository.recordGameScore(type, score, moves, durationSeconds)
        }
    }

    fun setOnboardingCompleted(completed: Boolean) {
        viewModelScope.launch {
            repository.prefs.setOnboardingCompleted(completed)
        }
    }

    fun updateDisplayName(name: String) {
        viewModelScope.launch {
            repository.updateDisplayName(name)
        }
    }

    fun updateAvatar(avatarId: String) {
        viewModelScope.launch {
            repository.updateAvatar(avatarId)
        }
    }

    fun updateTheme(theme: String) {
        viewModelScope.launch {
            repository.updateVisualTheme(theme)
        }
    }

    fun resetAllData() {
        viewModelScope.launch {
            repository.resetAllData()
            showToast("Questly data reset to defaults")
        }
    }
}
