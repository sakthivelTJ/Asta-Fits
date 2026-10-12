// Pure Domain Logic: Phase 4 Dynamic Quest Generator & Deload Engine

import { calculateTaskXp, dailyTargetXp } from './xpCalculator';

export const pickSplitFocus = (trainingDaysCount = 4, dayIndex = 0) => {
  if (trainingDaysCount <= 3) {
    return 'full_body';
  }
  if (trainingDaysCount === 4) {
    return dayIndex % 2 === 0 ? 'upper' : 'lower';
  }
  const splits = ['push', 'pull', 'legs', 'cardio', 'core_mobility'];
  return splits[dayIndex % splits.length];
};

export const isDeloadWeek = (weekNumber = 1) => {
  return weekNumber % 4 === 0; // Deload every 4th week (-30% volume)
};

export const scoreExerciseForUser = (exercise, userStats = {}, recentExerciseIds = []) => {
  let score = 100;

  // Favor exercises matching user's lowest stat to balance development
  const primaryStat = exercise.statGain || 'str';
  const currentStatVal = userStats[primaryStat] || 10;
  score += Math.max(0, 50 - currentStatVal);

  // Penalty if exercise appeared in last 2 days
  if (recentExerciseIds.includes(exercise.id)) {
    score -= 40;
  }

  // Small random jitter
  score += Math.random() * 10;
  return score;
};

export const generatePhase4DailyQuest = (
  userProfile = {},
  userStats = {},
  history = {},
  weekNumber = 1,
  dayIndex = 0
) => {
  const { level = 1, trainingDays = [1, 2, 4, 5], equipment = ['bodyweight'], limitations = [] } = userProfile;

  const dateStr = new Date().toISOString().split('T')[0];
  const isTrainingDay = trainingDays.includes(dayIndex);
  const deload = isDeloadWeek(weekNumber);

  // Target XP
  const targetXpVal = dailyTargetXp(level);

  if (!isTrainingDay) {
    // Non-training day produces light recovery quest (mobility & walking)
    return {
      date: dateStr,
      status: 'active',
      isRecoveryQuest: true,
      tasks: [
        {
          id: `rec_1_${dateStr}`,
          exerciseId: 'shadow_boxing',
          title: 'Recovery Mobility & Light Walk',
          type: 'mobility',
          targetSets: 2,
          targetReps: 15,
          completed: false,
          xpReward: Math.round(targetXpVal * 0.4),
        },
      ],
    };
  }

  // Volume modifier (Deload week reduces volume by 30%)
  const volumeMult = deload ? 0.7 : 1.0;

  const pushupReps = Math.round((level > 5 ? 15 : 10) * volumeMult);
  const squatReps = Math.round((level > 5 ? 20 : 12) * volumeMult);

  const task1Xp = calculateTaskXp('compound', 3, level, pushupReps, pushupReps);
  const task2Xp = calculateTaskXp('compound', 3, level, squatReps, squatReps);

  return {
    date: dateStr,
    status: 'active',
    isDeloadWeek: deload,
    tasks: [
      {
        id: `task_1_${dateStr}`,
        exerciseId: 'pushup_std',
        title: 'Anti-Magic Compound Push',
        type: 'compound',
        targetSets: 3,
        targetReps: pushupReps,
        completed: false,
        xpReward: task1Xp,
      },
      {
        id: `task_2_${dateStr}`,
        exerciseId: 'squat_air',
        title: 'Black Bull Legs Drive',
        type: 'compound',
        targetSets: 3,
        targetReps: squatReps,
        completed: false,
        xpReward: task2Xp,
      },
    ],
  };
};
