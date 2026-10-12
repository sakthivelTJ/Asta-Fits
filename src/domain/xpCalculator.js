// Pure Domain Logic: Phase 4 XP & Progression Mathematics

export const xpToNextLevel = (level) => {
  return 80 + 25 * level + 2 * level * level;
};

export const dailyTargetXp = (level) => {
  return 100 + 6 * level;
};

export const dailyXpCap = (level) => {
  return Math.floor(1.5 * dailyTargetXp(level));
};

export const levelScaleFactor = (level) => {
  return 1 + 0.06 * (level - 1);
};

// Rank Thresholds & Gate Levels (XP freezes at rank gate levels until trial passed)
export const RANK_GATES = {
  9: { currentRank: 'E', targetRank: 'D', trialName: 'Black Bull Recruit Trial' },
  24: { currentRank: 'D', targetRank: 'C', trialName: 'Junior Magic Knight Trial' },
  44: { currentRank: 'C', targetRank: 'B', trialName: 'Senior Magic Knight Trial' },
  69: { currentRank: 'B', targetRank: 'A', trialName: 'Black Bull Vice Captain Trial' },
  99: { currentRank: 'A', targetRank: 'S', trialName: 'Devil Union Monarch Trial' },
};

export const isAtRankGate = (level, trialPassed = false) => {
  if (RANK_GATES[level] && !trialPassed) {
    return true;
  }
  return false;
};

export const calculateTaskXp = (
  baseType = 'compound',
  difficulty = 3,
  level = 1,
  completedReps = 10,
  targetReps = 10
) => {
  const typeMults = {
    compound: 1.2,
    accessory: 1.0,
    cardio: 1.0,
    core: 0.9,
    mobility: 0.6,
  };

  const diffMults = {
    1: 0.8,
    2: 0.9,
    3: 1.0,
    4: 1.3,
    5: 1.6,
  };

  const typeMult = typeMults[baseType] || 1.0;
  const difficultyMult = diffMults[difficulty] || 1.0;
  const scale = levelScaleFactor(level);
  const ratio = Math.min(1.2, Math.max(0.0, completedReps / (targetReps || 1)));

  return Math.round(20 * typeMult * difficultyMult * scale * ratio);
};

export const calculateDailyQuestTotalXp = (
  taskXpArray = [],
  isFullQuestComplete = false,
  streakDays = 0,
  personalRecordsCount = 0,
  level = 1
) => {
  let rawXp = taskXpArray.reduce((acc, curr) => acc + curr, 0);

  // Apply Bonuses
  if (isFullQuestComplete) {
    rawXp = Math.round(rawXp * 1.25); // +25% full daily quest clear
  }

  const streakBonusPct = Math.min(0.30, streakDays * 0.01); // +1% per day up to +30%
  rawXp = Math.round(rawXp * (1 + streakBonusPct));

  rawXp += personalRecordsCount * 15; // +15 XP flat per PR

  // Enforce Anti-Overtraining Daily Cap
  const maxCap = dailyXpCap(level);
  return Math.min(maxCap, rawXp);
};
