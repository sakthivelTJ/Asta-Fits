// Pure Domain Logic: 6-Stat System & Diminishing Returns Formula

export const SIX_STATS = ['strength', 'endurance', 'agility', 'vitality', 'mobility', 'discipline'];

export const calculateStatGain = (taskXp, weight = 0.5, currentStat = 10) => {
  if (taskXp <= 0 || weight <= 0) return 0;
  const gain = (taskXp / 10) * weight / (1 + currentStat / 150);
  return parseFloat(gain.toFixed(2));
};

export const calculateDisciplineBonus = (fullQuestCompleted = false, streakDays = 0) => {
  let bonus = 0;
  if (fullQuestCompleted) bonus += 1;
  if (streakDays > 0 && streakDays % 7 === 0) bonus += 3;
  return bonus;
};

export const EXERCISE_STAT_WEIGHTS = {
  pushup_std: { strength: 0.7, endurance: 0.2, discipline: 0.1 },
  squat_air: { strength: 0.5, endurance: 0.3, agility: 0.2 },
  pullup_std: { strength: 0.8, endurance: 0.1, discipline: 0.1 },
  plank_std: { endurance: 0.5, mobility: 0.2, discipline: 0.3 },
  burpees_std: { agility: 0.6, endurance: 0.3, strength: 0.1 },
};
