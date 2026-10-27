export type QuestCategory =
  | 'CODING'
  | 'STUDY'
  | 'WORK'
  | 'FITNESS'
  | 'READING'
  | 'CREATIVITY'
  | 'PERSONAL'
  | 'CUSTOM';

export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
export type QuestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type QuestStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface QuestSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  priority: QuestPriority;
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate: string | null; // ISO Date string (YYYY-MM-DD)
  status: QuestStatus;
  xpReward: number;
  isRecurring: boolean;
  recurrenceRule?: 'DAILY' | 'WEEKLY' | null;
  createdAt: number;
  completedAt: number | null;
  subtasks: QuestSubtask[];
}

export type WorldStageNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface WorldStageInfo {
  stageNumber: WorldStageNumber;
  title: string;
  subtitle: string;
  minStreakDays: number;
  description: string;
  nextMilestoneDesc: string;
}

export type PresentationMode = 'flourishing' | 'stable' | 'resting';

export type ProgressionStage = 'EXPLORER' | 'BUILDER' | 'STRATEGIST' | 'MASTER';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarId: string;
  title: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  currentStage: ProgressionStage;
  activeCosmetics: {
    avatarFrame: string;
    worldTheme: 'celestial' | 'arcane' | 'verdant' | 'volcanic';
    ambientAura: 'sparkles' | 'fireflies' | 'aurora' | 'embers' | 'none';
  };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDaysCount: number;
  todayGoalMet: boolean;
  worldStage: WorldStageNumber;
  presentationMode: PresentationMode;
}

export interface FocusSession {
  id: string;
  questId: string | null;
  questTitle: string | null;
  plannedSeconds: number;
  elapsedSeconds: number; // actual qualifying focus time
  isCompleted: boolean;
  startedAt: number;
  endedAt: number;
  xpEarned: number;
  notes?: string;
}

export type LevelCategory = 'focus' | 'quest' | 'consistency' | 'boss' | 'special';

export interface AdventureLevel {
  id: number;
  zone: number;
  zoneName: string;
  title: string;
  description: string;
  category: LevelCategory;
  requiredStars: number;
  starsEarned: number; // 0 to 3
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  xpReward: number;
  condition: {
    type: 'focus_minutes' | 'complete_quests' | 'streak_days' | 'boss_challenge';
    target: number;
    current: number;
  };
  unlockMessage?: string;
}

export type GameType = 'QUEST_DEFENDER' | 'CRYSTAL_MAZE';

export interface GameRecord {
  id: string;
  gameType: GameType;
  score: number;
  levelReached: number;
  durationSeconds: number;
  playedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'quests' | 'focus' | 'streak' | 'world' | 'arcade';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt: number | null;
  xpReward: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  questsCompleted: number;
  xpEarned: number;
  goalMet: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  dailyFocusTargetMinutes: number;
  dailyQuestTargetCount: number;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  reducedMotion: boolean;
  ambientSound: 'none' | 'rain' | 'ethereal' | 'forest';
}
