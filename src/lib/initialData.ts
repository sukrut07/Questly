import {
  Quest,
  UserProfile,
  StreakInfo,
  AppSettings,
  DailyActivity,
  FocusSession,
  AcademicSubject,
  AcademicDeadline,
  TimetableSlot,
  AcademicInboxItem,
  Achievement,
  DashboardWidgetConfig,
} from './types';
import { getTodayDateString } from './progressionEngine';

export const INITIAL_USER: UserProfile = {
  id: 'user_local',
  displayName: 'Scholar',
  academicRole: 'My Academic Workspace',
  avatarId: 'avatar_default',
  academicRank: 'Initiate',
  level: 1,
  currentXp: 0,
  nextLevelXp: 250,
  totalXp: 0,
  freezeTokens: 2,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

export const INITIAL_STREAK: StreakInfo = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  activeDaysCount: 0,
  todayGoalMet: false,
  freezeTokens: 2,
};

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  dailyFocusTargetMinutes: 180, // 3 hours
  dailyTaskTargetCount: 5,
  soundEnabled: true,
  soundVolume: 0.6,
  reducedMotion: false,
  compactDensity: false,
  weekStartDay: 'monday',
  showGraphBackground: true,
};

export const INITIAL_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'workload',
    title: 'Workload Balancer',
    description: 'Compares scheduled tasks with daily focus capacity',
    isEnabled: true,
    orderIndex: 0,
  },
  {
    id: 'tasks_list',
    title: "Today's Tasks & Checklists",
    description: 'Active tasks and subtasks planned for today',
    isEnabled: true,
    orderIndex: 1,
  },
  {
    id: 'subjects_tree',
    title: 'Subjects & Modules',
    description: 'Enrolled courses and syllabus completion progress',
    isEnabled: true,
    orderIndex: 2,
  },
  {
    id: 'deadlines_radar',
    title: 'Deadlines Radar',
    description: 'Upcoming assignments, quizzes, and examinations',
    isEnabled: true,
    orderIndex: 3,
  },
  {
    id: 'focus_chamber',
    title: 'Focus Chamber Quick Launch',
    description: 'Pomodoro timer linked to your tasks',
    isEnabled: true,
    orderIndex: 4,
  },
];

// Clean empty collections ready for real user-created content
export const INITIAL_SUBJECTS: AcademicSubject[] = [];
export const INITIAL_QUESTS: Quest[] = [];
export const INITIAL_DEADLINES: AcademicDeadline[] = [];
export const INITIAL_TIMETABLE: TimetableSlot[] = [];
export const INITIAL_INBOX: AcademicInboxItem[] = [];
export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [];
export const INITIAL_ACTIVITY_HISTORY: DailyActivity[] = [];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_task',
    title: 'First Step',
    description: 'Create and complete your first task',
    iconName: 'CheckCircle2',
    category: 'academic',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    unlockedAt: null,
    xpReward: 25,
  },
  {
    id: 'ach_first_subject',
    title: 'Course Architect',
    description: 'Add your first subject and syllabus module',
    iconName: 'BookOpen',
    category: 'academic',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    unlockedAt: null,
    xpReward: 35,
  },
  {
    id: 'ach_first_focus',
    title: 'Deep Flow',
    description: 'Complete a verified 25-minute focus session',
    iconName: 'Clock',
    category: 'focus',
    progress: 0,
    maxProgress: 25,
    isUnlocked: false,
    unlockedAt: null,
    xpReward: 50,
  },
  {
    id: 'ach_streak_3',
    title: 'Habit Builder',
    description: 'Maintain a 3-day consecutive study streak',
    iconName: 'Flame',
    category: 'streak',
    progress: 0,
    maxProgress: 3,
    isUnlocked: false,
    unlockedAt: null,
    xpReward: 50,
  },
];
