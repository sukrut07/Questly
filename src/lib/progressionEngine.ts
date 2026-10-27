import {
  WorldStageNumber,
  WorldStageInfo,
  PresentationMode,
  ProgressionStage,
  QuestDifficulty,
  DailyActivity,
  UserProfile,
  StreakInfo,
} from './types';

export const WORLD_STAGES: Record<WorldStageNumber, WorldStageInfo> = {
  1: {
    stageNumber: 1,
    title: 'Forgotten Outpost',
    subtitle: 'A quiet starter camp under twilight skies',
    minStreakDays: 0,
    description:
      'Dim ancient crystals rest among quiet embers. The stones remember greatness, waiting for your first consistent sparks.',
    nextMilestoneDesc: 'Achieve a 3-day active streak to awaken the realm.',
  },
  2: {
    stageNumber: 2,
    title: 'First Sparks',
    subtitle: 'Glowing crystals and rekindled hearths',
    minStreakDays: 3,
    description:
      'The central crystal pulses with gentle violet light. Warm lanterns ignite along the pathways and friendly travelers take notice.',
    nextMilestoneDesc: 'Reach a 7-day streak to cultivate the Awakening valley.',
  },
  3: {
    stageNumber: 3,
    title: 'The Awakening',
    subtitle: 'Verdant flora, waterwheels & rising watchtowers',
    minStreakDays: 7,
    description:
      'Lush vegetation springs from arcane soil. A clear river flows beneath fresh stone arches and an observatory ascends toward the sky.',
    nextMilestoneDesc: 'Reach a 14-day streak to construct the Growing Realm.',
  },
  4: {
    stageNumber: 4,
    title: 'Growing Realm',
    subtitle: 'Majestic castle spires & bustling trade bridges',
    minStreakDays: 14,
    description:
      'Fortified ramparts and grand stone towers rise into the morning mist. Your habits have carved a permanent sanctuary of discipline.',
    nextMilestoneDesc: 'Reach a 30-day streak to raise the Radiant Citadel.',
  },
  5: {
    stageNumber: 5,
    title: 'Radiant Citadel',
    subtitle: 'Gilded obelisks & floating arcane monoliths',
    minStreakDays: 30,
    description:
      'Gilded spires harness deep work focus into beam-lines of pure light. Floating obelisks orbit the grand keep as a testament to mastery.',
    nextMilestoneDesc: 'Reach a 60-day streak to ascend to the Celestial Kingdom.',
  },
  6: {
    stageNumber: 6,
    title: 'Celestial Kingdom',
    subtitle: 'Pinnacle cosmos realm bathed in aurora starlight',
    minStreakDays: 60,
    description:
      'Cosmic auroras illuminate floating crystal islands and golden causeways. You have ascended to pinnacle legendary productivity.',
    nextMilestoneDesc: 'Maximum pinnacle stage achieved! Your realm shines eternally.',
  },
};

/**
 * Calculates world stage strictly from current streak
 */
export function calculateWorldStage(streakDays: number): WorldStageNumber {
  if (streakDays >= 60) return 6;
  if (streakDays >= 30) return 5;
  if (streakDays >= 14) return 4;
  if (streakDays >= 7) return 3;
  if (streakDays >= 3) return 2;
  return 1;
}

/**
 * Determines emotional presentation mode without punitive degradation
 */
export function calculatePresentationMode(
  lastActiveDate: string,
  todayMetGoal: boolean,
  currentStreak: number
): PresentationMode {
  const todayStr = getTodayDateString();

  if (lastActiveDate === todayStr || todayMetGoal) {
    return 'flourishing';
  }

  // Check if last active was yesterday
  const yesterdayStr = getRelativeDateString(-1);
  if (lastActiveDate === yesterdayStr) {
    return 'stable';
  }

  // If 2+ days inactive, enter calming resting mode
  return 'resting';
}

/**
 * Level progression formula
 * Level 1 starts at 0 XP, requires 250 XP for Level 2
 * Level 2 requires 550 total XP, Level 3 requires 950, etc.
 */
export function getRequiredXpForLevel(level: number): number {
  return Math.floor(250 * Math.pow(level, 1.2));
}

export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  stage: ProgressionStage;
} {
  let level = 1;
  let remainingXp = totalXp;

  while (true) {
    const needed = getRequiredXpForLevel(level);
    if (remainingXp < needed) {
      const progressPercent = Math.min(100, Math.round((remainingXp / needed) * 100));
      let stage: ProgressionStage = 'EXPLORER';
      if (level >= 10) stage = 'MASTER';
      else if (level >= 6) stage = 'STRATEGIST';
      else if (level >= 3) stage = 'BUILDER';

      return {
        level,
        currentXp: remainingXp,
        nextLevelXp: needed,
        progressPercent,
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
      return 50;
    case 'HARD':
      return 90;
    case 'EPIC':
      return 150;
    default:
      return 50;
  }
}

/**
 * Strava-inspired Productivity Score formula:
 * Score = 0.35 * C + 0.30 * F + 0.20 * G + 0.15 * S
 */
export function calculateProductivityScore(params: {
  completionRatePercent: number; // C (0 - 100)
  weeklyFocusMinutes: number; // F target: 150 mins
  focusTargetMinutes: number;
  dailyGoalConsistencyPercent: number; // G (0 - 100)
  streakDays: number; // S benchmark: 14 days
}): {
  totalScore: number;
  completionScore: number;
  focusScore: number;
  goalScore: number;
  streakScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
} {
  const C = Math.min(100, Math.max(0, params.completionRatePercent));

  const focusTarget = Math.max(60, params.focusTargetMinutes * 5); // 5 days target
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

/**
 * Date helper utilities
 */
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
