import test from 'node:test';
import assert from 'node:assert/strict';

function calculateAcademicRank(level) {
  if (level >= 76) return 'Academic Master';
  if (level >= 51) return 'Expert';
  if (level >= 36) return 'Strategist';
  if (level >= 21) return 'Specialist';
  if (level >= 11) return 'Practitioner';
  if (level >= 6) return 'Scholar';
  return 'Initiate';
}

function calculateWorkloadBalance(tasks, dailyCapacityMinutes = 180) {
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const totalPlannedMinutes = activeTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const remainingMinutes = Math.max(0, dailyCapacityMinutes - totalPlannedMinutes);
  const loadPercentage = Math.round((totalPlannedMinutes / Math.max(1, dailyCapacityMinutes)) * 100);

  let status = 'balanced';
  let overloadWarning = false;

  if (loadPercentage > 115) {
    status = 'overloaded';
    overloadWarning = true;
  } else if (loadPercentage > 85) {
    status = 'demanding';
  } else if (loadPercentage < 40) {
    status = 'light';
  }

  return { totalPlannedMinutes, dailyCapacityMinutes, remainingMinutes, loadPercentage, status, overloadWarning };
}

function getXpForDifficulty(difficulty) {
  switch (difficulty) {
    case 'EASY': return 25;
    case 'MEDIUM': return 35;
    case 'HARD': return 50;
    case 'EPIC': return 75;
    default: return 35;
  }
}

test('Academic Ranks and Level Progression', () => {
  assert.equal(calculateAcademicRank(1), 'Initiate');
  assert.equal(calculateAcademicRank(5), 'Initiate');
  assert.equal(calculateAcademicRank(6), 'Scholar');
  assert.equal(calculateAcademicRank(10), 'Scholar');
  assert.equal(calculateAcademicRank(11), 'Practitioner');
  assert.equal(calculateAcademicRank(21), 'Specialist');
  assert.equal(calculateAcademicRank(36), 'Strategist');
  assert.equal(calculateAcademicRank(51), 'Expert');
  assert.equal(calculateAcademicRank(76), 'Academic Master');
});

test('Workload Balancer estimates capacity and warns on overload', () => {
  const balancedTasks = [
    { id: '1', title: 'Task 1', estimatedMinutes: 45, status: 'IN_PROGRESS' },
    { id: '2', title: 'Task 2', estimatedMinutes: 60, status: 'IN_PROGRESS' },
    { id: '3', title: 'Task 3', estimatedMinutes: 30, status: 'IN_PROGRESS' },
  ];

  const balanced = calculateWorkloadBalance(balancedTasks, 180);
  assert.equal(balanced.totalPlannedMinutes, 135);
  assert.equal(balanced.loadPercentage, 75);
  assert.equal(balanced.status, 'balanced');
  assert.equal(balanced.overloadWarning, false);

  const overloadedTasks = [
    ...balancedTasks,
    { id: '4', title: 'Task 4', estimatedMinutes: 115, status: 'IN_PROGRESS' },
  ];

  const overloaded = calculateWorkloadBalance(overloadedTasks, 180);
  assert.equal(overloaded.totalPlannedMinutes, 250);
  assert.equal(overloaded.loadPercentage > 115, true);
  assert.equal(overloaded.status, 'overloaded');
  assert.equal(overloaded.overloadWarning, true);
});

test('XP rewards scale with academic task difficulty', () => {
  assert.equal(getXpForDifficulty('EASY'), 25);
  assert.equal(getXpForDifficulty('MEDIUM'), 35);
  assert.equal(getXpForDifficulty('HARD'), 50);
  assert.equal(getXpForDifficulty('EPIC'), 75);
});

test('Syllabus completion percentage recalculation on checklist toggle', () => {
  const subject = {
    id: 'sub_dsa',
    code: 'CS-204',
    modules: [
      {
        id: 'mod_1',
        topics: [
          { id: 't1', isCompleted: true },
          { id: 't2', isCompleted: false },
          { id: 't3', isCompleted: false },
          { id: 't4', isCompleted: false },
        ],
      },
    ],
  };

  const totalTopics = subject.modules[0].topics.length;
  const initialCompleted = subject.modules[0].topics.filter((t) => t.isCompleted).length;
  const initialProgress = Math.round((initialCompleted / totalTopics) * 100);
  assert.equal(initialProgress, 25);

  subject.modules[0].topics[1].isCompleted = true;
  const newCompleted = subject.modules[0].topics.filter((t) => t.isCompleted).length;
  const newProgress = Math.round((newCompleted / totalTopics) * 100);
  assert.equal(newProgress, 50);
});

test('Data backup JSON schema validation', () => {
  const validBackup = JSON.stringify({
    version: '2.0.0',
    user: { id: 'u1', displayName: 'Sukrut Dusane' },
    quests: [{ id: 'q1', title: 'Problem Set 4' }],
    subjects: [{ id: 's1', code: 'CS-204' }],
  });

  const parsed = JSON.parse(validBackup);
  assert.equal(Boolean(parsed.user && parsed.quests && Array.isArray(parsed.quests)), true);

  const invalidBackup = JSON.stringify({ corrupted: true });
  const parsedInvalid = JSON.parse(invalidBackup);
  assert.equal(Boolean(parsedInvalid.user && parsedInvalid.quests && Array.isArray(parsedInvalid.quests)), false);
});
