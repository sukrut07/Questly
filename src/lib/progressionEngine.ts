import {
  QuestDifficulty,
  DailyActivity,
  UserProfile,
  StreakInfo,
  AcademicRank,
  Quest,
} from './types';

export const ACADEMIC_RANKS: Record<AcademicRank, { minLevel: number; title: string; color: string }> = {
  Initiate: { minLevel: 1, title: 'Initiate Scholar', color: '#71717A' },
  Scholar: { minLevel: 6, title: 'Semester Scholar', color: '#C084FC' },
  Practitioner: { minLevel: 11, title: 'Academic Practitioner', color: '#38BDF8' },
  Specialist: { minLevel: 21, title: 'Coursework Specialist', color: '#A3E635' },
  Strategist: { minLevel: 36, title: 'Honors Strategist', color: '#F59E0B' },
  Expert: { minLevel: 51, title: 'Department Fellow', color: '#FB7185' },
  'Academic Master': { minLevel: 76, title: 'Academic Master', color: '#E4E4E7' },
};

/**
 * Calculates Academic Rank based on level
 */
export function calculateAcademicRank(level: number): AcademicRank {
  if (level >= 76) return 'Academic Master';
  if (level >= 51) return 'Expert';
  if (level >= 36) return 'Strategist';
  if (level >= 21) return 'Specialist';
  if (level >= 11) return 'Practitioner';
  if (level >= 6) return 'Scholar';
  return 'Initiate';
}

/**
 * Level progression formula
 * Level 1 starts at 0 XP, requires 250 XP for Level 2
 */
export function getRequiredXpForLevel(level: number): number {
  return Math.floor(250 * Math.pow(level, 1.2));
}

export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  academicRank: AcademicRank;
  stage: string;
} {
  let level = 1;
  let remainingXp = totalXp;

  while (true) {
    const needed = getRequiredXpForLevel(level);
    if (remainingXp < needed) {
      const progressPercent = Math.min(100, Math.round((remainingXp / needed) * 100));
      const rank = calculateAcademicRank(level);
      let stage = 'EXPLORER';
      if (level >= 10) stage = 'MASTER';
      else if (level >= 6) stage = 'STRATEGIST';
      else if (level >= 3) stage = 'BUILDER';

      return {
        level,
        currentXp: remainingXp,
        nextLevelXp: needed,
        progressPercent,
        academicRank: rank,
        stage,
      };
    }
    remainingXp -= needed;
    level++;
  }
}

/**
 * Base XP rewards per difficulty
 */
export function getXpForDifficulty(difficulty: QuestDifficulty): number {
  switch (difficulty) {
    case 'EASY':
      return 25;
    case 'MEDIUM':
      return 35;
    case 'HARD':
      return 50;
    case 'EPIC':
      return 75;
    default:
      return 35;
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
  overloadWarning: boolean;
  statusMessage: string;
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
  let overloadWarning = false;
  let statusMessage = 'Planned workload is within healthy capacity.';

  if (loadPercentage > 115) {
    status = 'overloaded';
    overloadWarning = true;
    statusMessage = `Overloaded by ${totalPlannedMinutes - dailyCapacityMinutes} minutes. Consider deferring lowest priority tasks.`;
  } else if (loadPercentage > 85) {
    status = 'demanding';
    statusMessage = 'Intense study day planned. Ensure scheduled breaks.';
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
    overloadWarning,
    statusMessage,
  };
}

/**
 * Retained for backward compatibility with existing tests
 */
export function calculateWorldStage(streakDays: number): number {
  if (streakDays >= 60) return 6;
  if (streakDays >= 30) return 5;
  if (streakDays >= 14) return 4;
  if (streakDays >= 7) return 3;
  if (streakDays >= 3) return 2;
  return 1;
}

export function calculateProductivityScore(params: {
  completionRatePercent: number;
  weeklyFocusMinutes: number;
  focusTargetMinutes: number;
  dailyGoalConsistencyPercent: number;
  streakDays: number;
}): {
  totalScore: number;
  completionScore: number;
  focusScore: number;
  goalScore: number;
  streakScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
} {
  const C = Math.min(100, Math.max(0, params.completionRatePercent));
  const focusTarget = Math.max(60, params.focusTargetMinutes * 5);
  const F = Math.min(100, Math.max(0, (params.weeklyFocusMinutes / focusTarget) * 100));
  const G = Math.min(100, Math.max(0, params.dailyGoalConsistencyPercent));
  const S = Math.min(100, Math.max(0, (params.streakDays / 14) * 100));

  const rawScore = 0.35 * C + 0.3 * F + 0.2 * G + 0.15 * S;
  const totalScore = Math.round(rawScore);

  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 75) grade = 'A';
  else if (totalScore >= 60) grade = 'B';
  else if (totalScore >= 40) grade = 'C';
  else grade = 'D';

  return {
    totalScore,
    completionScore: Math.round(0.35 * C),
    focusScore: Math.round(0.3 * F),
    goalScore: Math.round(0.2 * G),
    streakScore: Math.round(0.15 * S),
    grade,
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}
