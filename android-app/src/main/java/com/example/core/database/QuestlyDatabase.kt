package com.example.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.core.model.ProgressionStage
import com.example.core.model.QuestCategory
import com.example.core.model.QuestDifficulty
import com.example.core.model.QuestPriority
import com.example.core.model.QuestStatus
import com.example.core.model.SkillBranch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        UserProfileEntity::class,
        QuestEntity::class,
        QuestSubtaskEntity::class,
        FocusSessionEntity::class,
        StreakRecordEntity::class,
        XpLedgerEntity::class,
        AchievementEntity::class,
        SkillNodeEntity::class,
        GameRecordEntity::class,
        CosmeticItemEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class QuestlyDatabase : RoomDatabase() {

    abstract fun questDao(): QuestDao
    abstract fun focusSessionDao(): FocusSessionDao
    abstract fun profileDao(): ProfileDao
    abstract fun achievementDao(): AchievementDao
    abstract fun skillDao(): SkillDao
    abstract fun gameDao(): GameDao
    abstract fun xpDao(): XpDao

    companion object {
        @Volatile
        private var INSTANCE: QuestlyDatabase? = null

        fun getDatabase(context: Context): QuestlyDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    QuestlyDatabase::class.java,
                    "questly_database"
                )
                    .addCallback(DatabaseCallback())
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        seedInitialData(database)
                    }
                }
            }
        }

        suspend fun seedInitialData(database: QuestlyDatabase) {
            val now = System.currentTimeMillis()

            // 1. Initial User Profile
            database.profileDao().insertProfile(
                UserProfileEntity(
                    id = 1,
                    displayName = "Quest Explorer",
                    avatarId = "mage",
                    level = 1,
                    totalXp = 0,
                    currentStage = ProgressionStage.EXPLORER,
                    visualTheme = "midnight",
                    title = "Apprentice Explorer",
                    createdAt = now
                )
            )

            // 2. Initial Streak Record
            database.profileDao().insertStreak(
                StreakRecordEntity(
                    id = 1,
                    currentStreak = 1,
                    longestStreak = 1,
                    lastActiveDate = java.time.LocalDate.now().toString(),
                    activeDaysCount = 1
                )
            )

            // 3. Starter Quests
            val q1Id = database.questDao().insertQuest(
                QuestEntity(
                    id = 0,
                    title = "Welcome to Questly: Explore the Realm",
                    description = "Take your first step: inspect your dashboard, explore your starter skills, and conquer your first mission.",
                    category = QuestCategory.PERSONAL,
                    difficulty = QuestDifficulty.EASY,
                    priority = QuestPriority.HIGH,
                    estimatedMinutes = 15,
                    actualMinutes = 0,
                    dueDate = now + 86400000L,
                    status = QuestStatus.NOT_STARTED,
                    xpReward = 25,
                    isRecurring = false,
                    recurrenceRule = null,
                    questChainId = null,
                    createdAt = now,
                    completedAt = null
                )
            )
            database.questDao().insertSubtasks(
                listOf(
                    QuestSubtaskEntity(0, q1Id, "Inspect dashboard metrics", false),
                    QuestSubtaskEntity(0, q1Id, "Review the skill tree", false),
                    QuestSubtaskEntity(0, q1Id, "Mark this quest complete", false)
                )
            )

            val q2Id = database.questDao().insertQuest(
                QuestEntity(
                    id = 0,
                    title = "Complete 25-Min Deep Focus Session",
                    description = "Start your first Pomodoro focus block on the Focus screen. Eliminate distractions and gain focus momentum.",
                    category = QuestCategory.WORK,
                    difficulty = QuestDifficulty.MEDIUM,
                    priority = QuestPriority.MEDIUM,
                    estimatedMinutes = 25,
                    actualMinutes = 0,
                    dueDate = now + 86400000L,
                    status = QuestStatus.NOT_STARTED,
                    xpReward = 45,
                    isRecurring = false,
                    recurrenceRule = null,
                    questChainId = null,
                    createdAt = now + 1000L,
                    completedAt = null
                )
            )
            database.questDao().insertSubtasks(
                listOf(
                    QuestSubtaskEntity(0, q2Id, "Set phone to silence/DND", false),
                    QuestSubtaskEntity(0, q2Id, "Execute 25 minutes of deep work", false)
                )
            )

            database.questDao().insertQuest(
                QuestEntity(
                    id = 0,
                    title = "Code Architecture Challenge",
                    description = "Build a robust clean architecture module with comprehensive error handling and test cases.",
                    category = QuestCategory.CODING,
                    difficulty = QuestDifficulty.HARD,
                    priority = QuestPriority.URGENT,
                    estimatedMinutes = 60,
                    actualMinutes = 0,
                    dueDate = now + (2 * 86400000L),
                    status = QuestStatus.NOT_STARTED,
                    xpReward = 75,
                    isRecurring = false,
                    recurrenceRule = null,
                    questChainId = "coding_mastery",
                    createdAt = now + 2000L,
                    completedAt = null
                )
            )

            // 4. Initial Achievements
            val starterAchievements = listOf(
                AchievementEntity(
                    id = "first_quest",
                    title = "First Quest",
                    description = "Complete your first productivity quest",
                    iconName = "flag",
                    category = "QUESTS",
                    targetValue = 1,
                    currentValue = 0,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 30,
                    cosmeticReward = "Explorer Badge"
                ),
                AchievementEntity(
                    id = "first_focus",
                    title = "First Focus Session",
                    description = "Log your first verified focus session",
                    iconName = "timer",
                    category = "FOCUS",
                    targetValue = 1,
                    currentValue = 0,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 30,
                    cosmeticReward = "Focus Aura"
                ),
                AchievementEntity(
                    id = "streak_3",
                    title = "Three-Day Streak",
                    description = "Maintain a 3-day active consistency streak",
                    iconName = "local_fire_department",
                    category = "STREAKS",
                    targetValue = 3,
                    currentValue = 1,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 50,
                    cosmeticReward = "Flame Emblem"
                ),
                AchievementEntity(
                    id = "streak_7",
                    title = "Seven-Day Streak",
                    description = "Achieve a full week of consistent productive activity",
                    iconName = "military_tech",
                    category = "STREAKS",
                    targetValue = 7,
                    currentValue = 1,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 100,
                    cosmeticReward = "Crown Frame"
                ),
                AchievementEntity(
                    id = "focus_5h",
                    title = "Five Hours Focused",
                    description = "Accumulate 300 minutes of verified focus time",
                    iconName = "hourglass_full",
                    category = "FOCUS",
                    targetValue = 300,
                    currentValue = 0,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 120,
                    cosmeticReward = "Chronos Theme"
                ),
                AchievementEntity(
                    id = "arcade_snake",
                    title = "Snake Master",
                    description = "Score 50+ points in Cyber Snake during a break",
                    iconName = "sports_esports",
                    category = "ARCADE",
                    targetValue = 50,
                    currentValue = 0,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 40,
                    cosmeticReward = "Neon Ribbon"
                ),
                AchievementEntity(
                    id = "arcade_memory",
                    title = "Rune Scholar",
                    description = "Complete Rune Memory Match with high precision",
                    iconName = "psychology",
                    category = "ARCADE",
                    targetValue = 1,
                    currentValue = 0,
                    isUnlocked = false,
                    unlockedAt = null,
                    xpReward = 40,
                    cosmeticReward = "Arcane Sigil"
                )
            )
            database.achievementDao().insertAchievements(starterAchievements)

            // 5. Initial Skill Nodes (6 branches)
            val starterSkills = listOf(
                SkillNodeEntity("focus_1", SkillBranch.FOCUS, "Iron Will", "Increases session completion stamina", 1, 30, 100, false, "Will Frame"),
                SkillNodeEntity("focus_2", SkillBranch.FOCUS, "Deep Flow State", "Enhances distraction immunity during Pomodoros", 3, 0, 100, false, "Flow Particle"),
                SkillNodeEntity("consistency_1", SkillBranch.CONSISTENCY, "Daily Habit Core", "Solidifies habit formation mechanics", 1, 40, 100, false, "Streak Flame"),
                SkillNodeEntity("consistency_2", SkillBranch.CONSISTENCY, "Resilience Surge", "Mitigates missed days with rest recovery", 4, 0, 100, false, "Shield Trim"),
                SkillNodeEntity("planning_1", SkillBranch.PLANNING, "Quest Decomposition", "Improves subtask estimation accuracy", 1, 20, 100, false, "Compass Icon"),
                SkillNodeEntity("planning_2", SkillBranch.PLANNING, "Grand Campaign", "Unlocks multi-tier quest chains", 5, 0, 100, false, "Campaign Banner"),
                SkillNodeEntity("learning_1", SkillBranch.LEARNING, "Curiosity Spark", "Boosts XP earned from study quests", 1, 10, 100, false, "Book Glow"),
                SkillNodeEntity("creativity_1", SkillBranch.CREATIVITY, "Divergent Thinking", "Sparks innovative approaches to complex tasks", 2, 0, 100, false, "Prism Glow"),
                SkillNodeEntity("execution_1", SkillBranch.EXECUTION, "Quick Strike", "Increases XP for speedy morning completions", 1, 25, 100, false, "Bolt Sigil")
            )
            database.skillDao().insertSkills(starterSkills)

            // 6. Cosmetic Items
            val starterCosmetics = listOf(
                CosmeticItemEntity("theme_midnight", "theme", "Midnight Navy", "Default deep obsidian-indigo dark theme", true, true, 0xFF0D0F17),
                CosmeticItemEntity("theme_arcane", "theme", "Arcane Violet", "Mystic violet accents unlocked at Stage Builder", false, false, 0xFF8B7CFF),
                CosmeticItemEntity("theme_emerald", "theme", "Quest Emerald", "Verdant green triumph theme unlocked at Stage Strategist", false, false, 0xFF69D8A5),
                CosmeticItemEntity("theme_gold", "theme", "Legend Gold", "Prestige gilded aura unlocked at Stage Master", false, false, 0xFFF5C96A)
            )
            database.profileDao().insertCosmetics(starterCosmetics)
        }
    }
}
