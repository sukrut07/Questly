export type SubjectColor = '#A3E635' | '#C084FC' | '#38BDF8' | '#F59E0B' | '#FB7185' | '#34D399';

export interface TopicChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: number;
}

export interface AcademicTopic {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: number;
  revisionCount: number;
  checklists: TopicChecklistItem[];
}

export interface AcademicModule {
  id: string;
  title: string;
  orderIndex: number;
  topics: AcademicTopic[];
}

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  instructorName?: string;
  colorHex: SubjectColor;
  iconName: string;
  credits: number;
  targetGrade?: string;
  syllabusProgress: number; // 0 to 100
  attendancePercentage?: number;
  modules: AcademicModule[];
}

export type TaskType =
  | 'reading'
  | 'problem_solving'
  | 'coding'
  | 'revision'
  | 'writing'
  | 'lecture_prep'
  | 'lab_work';

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
  subjectId?: string;
  subjectCode?: string;
  subjectColorHex?: string;
  taskType: TaskType;
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
  resourceUrls?: string[];
}

export interface AcademicDeadline {
  id: string;
  title: string;
  type: 'assignment' | 'examination' | 'project';
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectColorHex: string;
  deadlineIso: string;
  weightagePercentage: number;
  isCompleted: boolean;
  targetScore?: number;
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectColorHex: string;
  dayOfWeek: number; // 1 = Monday, 5 = Friday
  startTime: string; // "10:30"
  endTime: string;   // "12:00"
  locationRoom: string;
  slotType: 'lecture' | 'lab' | 'tutorial';
}

export interface AcademicInboxItem {
  id: string;
  title: string;
  notes?: string;
  sourceUrl?: string;
  type: 'task' | 'note' | 'deadline' | 'reference';
  suggestedSubjectId?: string;
  createdAt: number;
}

export interface AcademicTemplate {
  id: string;
  title: string;
  category: 'dsa' | 'exam_prep' | 'research' | 'math' | 'project';
  description: string;
  estimatedWeeks: number;
  totalTasks: number;
  subjectCode: string;
  tasks: Array<{
    title: string;
    taskType: TaskType;
    estimatedMinutes: number;
    priority: QuestPriority;
    subtasks: string[];
  }>;
}

export type AcademicRank =
  | 'Initiate'
  | 'Scholar'
  | 'Practitioner'
  | 'Specialist'
  | 'Strategist'
  | 'Expert'
  | 'Academic Master';

export interface UserProfile {
  id: string;
  displayName: string;
  academicRole: string; // e.g. "Computer Science • Semester 3"
  avatarId: string;
  academicRank: AcademicRank;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  freezeTokens: number;
  timezone: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDaysCount: number;
  todayGoalMet: boolean;
  freezeTokens: number;
}

export interface FocusSession {
  id: string;
  questId: string | null;
  questTitle: string | null;
  subjectId?: string | null;
  subjectCode?: string | null;
  plannedSeconds: number;
  elapsedSeconds: number;
  isCompleted: boolean;
  startedAt: number;
  endedAt: number;
  xpEarned: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'academic' | 'focus' | 'streak' | 'mastery';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt: number | null;
  xpReward: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  tasksCompleted: number;
  xpEarned: number;
  goalMet: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  dailyFocusTargetMinutes: number; // e.g. 180 (3 hrs)
  dailyTaskTargetCount: number;    // e.g. 5
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  reducedMotion: boolean;
  compactDensity: boolean;
  weekStartDay: 'monday' | 'sunday';
}
