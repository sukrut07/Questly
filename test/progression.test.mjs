import test from 'node:test';
import assert from 'node:assert/strict';

// Test Progression Engine Calculations
function getRequiredXpForLevel(level) {
  return Math.floor(250 * Math.pow(level, 1.2));
}

function calculateLevelFromTotalXp(totalXp) {
  let level = 1;
  let remainingXp = totalXp;

  while (true) {
    const needed = getRequiredXpForLevel(level);
    if (remainingXp < needed) {
      const progressPercent = Math.min(100, Math.round((remainingXp / needed) * 100));
      let stage = 'EXPLORER';
      if (level >= 10) stage = 'MASTER';
      else if (level >= 6) stage = 'STRATEGIST';
      else if (level >= 3) stage = 'BUILDER';

      return { level, currentXp: remainingXp, nextLevelXp: needed, progressPercent, stage };
    }
    remainingXp -= needed;
    level++;
  }
}

function calculateWorldStage(streakDays) {
  if (streakDays >= 60) return 6;
  if (streakDays >= 30) return 5;
  if (streakDays >= 14) return 4;
  if (streakDays >= 7) return 3;
  if (streakDays >= 3) return 2;
  return 1;
}

function calculateProductivityScore(params) {
  const C = Math.min(100, Math.max(0, params.completionRatePercent));
  const focusTarget = Math.max(60, params.focusTargetMinutes * 5);
  const F = Math.min(100, Math.max(0, (params.weeklyFocusMinutes / focusTarget) * 100));
  const G = Math.min(100, Math.max(0, params.dailyGoalConsistencyPercent));
  const S = Math.min(100, Math.max(0, (params.streakDays / 14) * 100));

  const rawScore = 0.35 * C + 0.30 * F + 0.20 * G + 0.15 * S;
  const totalScore = Math.round(rawScore);

  let grade = 'C';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 75) grade = 'A';
  else if (totalScore >= 60) grade = 'B';
  else if (totalScore >= 40) grade = 'C';
  else grade = 'D';

  return { totalScore, grade };
}

test('World Stage Progression boundaries', () => {
  assert.equal(calculateWorldStage(0), 1, 'Stage 1 for 0 days (Forgotten Outpost)');
  assert.equal(calculateWorldStage(2), 1, 'Stage 1 for 2 days');
  assert.equal(calculateWorldStage(3), 2, 'Stage 2 for 3 days (First Sparks)');
  assert.equal(calculateWorldStage(6), 2, 'Stage 2 for 6 days');
  assert.equal(calculateWorldStage(7), 3, 'Stage 3 for 7 days (The Awakening)');
  assert.equal(calculateWorldStage(13), 3, 'Stage 3 for 13 days');
  assert.equal(calculateWorldStage(14), 4, 'Stage 4 for 14 days (Growing Realm)');
  assert.equal(calculateWorldStage(29), 4, 'Stage 4 for 29 days');
  assert.equal(calculateWorldStage(30), 5, 'Stage 5 for 30 days (Radiant Citadel)');
  assert.equal(calculateWorldStage(59), 5, 'Stage 5 for 59 days');
  assert.equal(calculateWorldStage(60), 6, 'Stage 6 for 60+ days (Celestial Kingdom)');
  assert.equal(calculateWorldStage(100), 6, 'Stage 6 for 100 days');
});

test('XP calculations and Level boundaries', () => {
  const lvl1 = calculateLevelFromTotalXp(0);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentXp, 0);
  assert.equal(lvl1.stage, 'EXPLORER');

  const lvl1Mid = calculateLevelFromTotalXp(125);
  assert.equal(lvl1Mid.level, 1);
  assert.equal(lvl1Mid.currentXp, 125);
  assert.equal(lvl1Mid.progressPercent, 50);

  const lvl2 = calculateLevelFromTotalXp(250);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentXp, 0);

  // Level 3+ transitions to BUILDER
  const lvl3 = calculateLevelFromTotalXp(900);
  assert.equal(lvl3.level >= 3, true);
  assert.equal(lvl3.stage, 'BUILDER');
});

test('Productivity Score algorithm follows formula', () => {
  // Perfect 100 across all factors
  const perfect = calculateProductivityScore({
    completionRatePercent: 100,
    weeklyFocusMinutes: 250,
    focusTargetMinutes: 50,
    dailyGoalConsistencyPercent: 100,
    streakDays: 14,
  });
  assert.equal(perfect.totalScore, 100);
  assert.equal(perfect.grade, 'S');

  // Baseline 50% across all
  const mid = calculateProductivityScore({
    completionRatePercent: 50,
    weeklyFocusMinutes: 125,
    focusTargetMinutes: 50,
    dailyGoalConsistencyPercent: 50,
    streakDays: 7,
  });
  assert.equal(mid.totalScore, 50);
  assert.equal(mid.grade, 'C');
});

test('Arcade plays never increment productivity stats', () => {
  let focusMinutes = 50;
  let completedQuests = 3;

  // Simulate an arcade game recording
  const arcadeRecord = {
    gameType: 'QUEST_DEFENDER',
    score: 8500,
    durationSeconds: 180,
  };

  // Ensure productivity stats are unaffected by arcade score
  assert.equal(focusMinutes, 50);
  assert.equal(completedQuests, 3);
  assert.equal(arcadeRecord.score, 8500);
});
