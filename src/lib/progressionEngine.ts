import {
  QuestDifficulty,
  DailyActivity,
  UserProfile,
  StreakInfo,
  AcademicRank,
  Quest,
} from './types';

export const LEVEL_CONFIG: {
  level: number;
  title: AcademicRank;
  minXp: number;
  requiredXp: number;
  color: string;
  unlockTitle: string;
  unlockDescription: string;
}[] = [
  {
    level: 1,
    title: 'Initiate',
    minXp: 0,
    requiredXp: 200,
    color: '#A0A4AE',
    unlockTitle: 'Core Neon Lime',
    unlockDescription: 'Standard high-contrast dark neon interface',
  },
  {
    level: 2,
    title: 'Explorer',
    minXp: 200,
    requiredXp: 300,
    color: '#42DFFF',
    unlockTitle: 'Electric Cyan Accent',
    unlockDescription: 'Unlocked Electric Cyan and Violet workspace highlights',
  },
  {
    level: 3,
    title: 'Builder',
    minXp: 500,
    requiredXp: 400,
    color: '#B5FF55',
    unlockTitle: 'Graph Dot & Blueprint Grid',
    unlockDescription: 'Alternate coordinate grid patterns for dashboard and focus modes',
  },
  {
    level: 4,
    title: 'Strategist',
    minXp: 900,
    requiredXp: 500,
    color: '#FF9C45',
    unlockTitle: 'Electric Halo Cursor',
    unlockDescription: 'Interactive glowing cursor trails and proximity cell bursts',
  },
  {
    level: 5,
    title: 'Specialist',
    minXp: 1400,
    requiredXp: 600,
    color: '#A879FF',
    unlockTitle: 'Deep Study Audio Chimes',
    unlockDescription: 'High-fidelity audio feedback on focus completion & leveling',
  },
  {
    level: 6,
    title: 'Architect',
    minXp: 2000,
    requiredXp: 800,
    color: '#FF5EBB',
    unlockTitle: 'Neon Obsidian Theme',
    unlockDescription: 'Ultra-deep pure black OLED dashboard theme with neon magenta borders',
  },
  {
    level: 7,
    title: 'Master',
    minXp: 2800,
    requiredXp: 1200,
    color: '#538CFF',
    unlockTitle: 'Academic Master Emblem',
    unlockDescription: 'Permanent animated golden voltage crest and custom profile flair',
  },
];

export const XP_RULES = {
  TASK_SMALL: 25,
  TASK_NORMAL: 75,
  TASK_MAJOR: 100,
  FOCUS_SESSION: 50,
  CHECKLIST_COMPLETED: 25,
  WEEKLY_REVIEW: 50,
  ARCADE_MIN: 5,
  ARCADE_MAX: 10,
  DAILY_ARCADE_CAP: 20,
};

/**
 * Calculates Academic Rank based on level
 */
export function calculateAcademicRank(level: number): AcademicRank {
  if (level >= 7) return 'Master';
  if (level >= 6) return 'Architect';
  if (level >= 5) return 'Specialist';
  if (level >= 4) return 'Strategist';
  if (level >= 3) return 'Builder';
  if (level >= 2) return 'Explorer';
  return 'Initiate';
}

/**
 * Level progression formula mapping total XP to level, progress, rank, and unlocks
 */
export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  academicRank: AcademicRank;
  stage: string;
  unlockedFeatures: string[];
} {
  const safeXp = Math.max(0, totalXp);

  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    const config = LEVEL_CONFIG[i];
    if (safeXp >= config.minXp) {
      const xpIntoLevel = safeXp - config.minXp;
      const progressPercent = Math.min(
        100,
        Math.round((xpIntoLevel / config.requiredXp) * 100)
      );

      // Collect all unlocked features up to current level
      const unlockedFeatures = LEVEL_CONFIG.slice(0, i + 1).map((c) => c.unlockTitle);

      return {
        level: config.level,
        currentXp: xpIntoLevel,
        nextLevelXp: config.requiredXp,
        progressPercent,
        academicRank: config.title,
        stage: config.title.toUpperCase(),
        unlockedFeatures,
      };
    }
  }

  // Fallback to level 1
  return {
    level: 1,
    currentXp: safeXp,
    nextLevelXp: 200,
    progressPercent: Math.min(100, Math.round((safeXp / 200) * 100)),
    academicRank: 'Initiate',
    stage: 'INITIATE',
    unlockedFeatures: [LEVEL_CONFIG[0].unlockTitle],
  };
}

/**
 * Base XP rewards per difficulty
 */
export function getXpForDifficulty(difficulty: QuestDifficulty): number {
  switch (difficulty) {
    case 'EASY':
      return XP_RULES.TASK_SMALL; // 25
    case 'MEDIUM':
      return XP_RULES.TASK_NORMAL; // 75
    case 'HARD':
    case 'EPIC':
      return XP_RULES.TASK_MAJOR; // 100
    default:
      return XP_RULES.TASK_NORMAL; // 75
  }
}

/**
 * Workload Balancer Calculation
 */
export interface WorkloadBalance {
  totalPlannedMinutes: number;
  dailyCapacityMinutes: number;
  remainingMinutes: number;
  loadPercentage: number;
  status: 'light' | 'balanced' | 'demanding' | 'overloaded';
  statusMessage: string;
  overloadWarning: boolean;
}

export function calculateWorkloadBalance(
  tasks: Quest[],
  dailyCapacityMinutes: number = 180
): WorkloadBalance {
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const totalPlannedMinutes = activeTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const remainingMinutes = Math.max(0, dailyCapacityMinutes - totalPlannedMinutes);
  const loadPercentage = Math.round((totalPlannedMinutes / Math.max(1, dailyCapacityMinutes)) * 100);

  let status: 'light' | 'balanced' | 'demanding' | 'overloaded' = 'balanced';
  let statusMessage = 'Workload is well balanced for deep learning.';
  let overloadWarning = false;

  if (loadPercentage > 115) {
    status = 'overloaded';
    statusMessage = 'Over capacity! Schedule overflow may risk cognitive fatigue.';
    overloadWarning = true;
  } else if (loadPercentage > 85) {
    status = 'demanding';
    statusMessage = 'Challenging workload today. Stay focused on high-priority items.';
  } else if (loadPercentage < 40) {
    status = 'light';
    statusMessage = 'Light schedule today. Good opportunity for spaced revision.';
  }

  return {
    totalPlannedMinutes,
    dailyCapacityMinutes,
    remainingMinutes,
    loadPercentage,
    status,
    statusMessage,
    overloadWarning,
  };
}

/**
 * Date Utilities
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(daysOffset: number): string {
  const target = new Date();
  target.setDate(target.getDate() + daysOffset);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
