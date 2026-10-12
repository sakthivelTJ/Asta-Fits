// Hunter & Magic Knight Rank System inspired by Asta (Black Clover)

export const RANKS = [
  {
    rank: 'E',
    title: 'E-Rank Magicless Novice',
    minLevel: 1,
    maxLevel: 5,
    color: '#8A94B8',
    glowColor: 'rgba(138, 148, 184, 0.4)',
    multiplier: 1.0,
    quote: '"My magic is never giving up!"',
    perks: ['Basic Physical Quests Unlocked', 'Warm-up Reminders Enabled'],
  },
  {
    rank: 'D',
    title: 'D-Rank Black Bull Recruit',
    minLevel: 6,
    maxLevel: 15,
    color: '#22D3A6',
    glowColor: 'rgba(34, 211, 166, 0.4)',
    multiplier: 1.15,
    quote: '"I will surpass my limits right here, right now!"',
    perks: ['Streak Shield (+1)', 'Anti-Magic Rep Counter'],
  },
  {
    rank: 'C',
    title: 'C-Rank Junior Magic Knight',
    minLevel: 16,
    maxLevel: 30,
    color: '#3D8BFF',
    glowColor: 'rgba(61, 139, 255, 0.4)',
    multiplier: 1.3,
    quote: '"Not yet! I\'m not done yet!"',
    perks: ['Demon-Slayer Sword Sets', 'Stat Bonus Points (+2/lvl)'],
  },
  {
    rank: 'B',
    title: 'B-Rank Senior Magic Knight',
    minLevel: 31,
    maxLevel: 50,
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    multiplier: 1.5,
    quote: '"Even without magic, I will become the Wizard King!"',
    perks: ['Demon-Dweller Hypertrophy Quests', 'Titan Macro Meal Unlocks'],
  },
  {
    rank: 'A',
    title: 'A-Rank Black Bull Vice Captain',
    minLevel: 51,
    maxLevel: 75,
    color: '#F5B94A',
    glowColor: 'rgba(245, 185, 74, 0.5)',
    multiplier: 1.75,
    quote: '"Black Divider Physical Overload!"',
    perks: ['Anti-Magic Black Form Theme', 'Max Stat Allocation'],
  },
  {
    rank: 'S',
    title: 'S-Rank Devil Union Monarch',
    minLevel: 76,
    maxLevel: 100,
    color: '#FF4D6D',
    glowColor: 'rgba(255, 77, 109, 0.8)',
    multiplier: 2.0,
    quote: '"Devil Union: Unstoppable Limit Breaker!"',
    perks: ['Devil Union Title Unlocked', 'Unstoppable Streak Multiplier'],
  },
];

export const STAT_DESCRIPTIONS = {
  str: {
    name: 'Strength (STR)',
    short: 'STR',
    icon: 'barbell',
    color: '#FF4D6D',
    description: 'Demon-Slayer sword wielding power & heavy resistance XP.',
  },
  agi: {
    name: 'Agility (AGI)',
    short: 'AGI',
    icon: 'flash',
    color: '#3D8BFF',
    description: 'Black Hurricane speed, rep velocity, and cardio burning.',
  },
  end: {
    name: 'Endurance (END)',
    short: 'END',
    icon: 'heart',
    color: '#22D3A6',
    description: 'Relentless stamina to train without fatigue.',
  },
  wil: {
    name: 'Willpower (WIL)',
    short: 'WIL',
    icon: 'shield',
    color: '#8B5CF6',
    description: '"Never Giving Up!" streak protection & discipline.',
  },
  per: {
    name: 'Perception (PER)',
    short: 'PER',
    icon: 'eye',
    color: '#F5B94A',
    description: 'Ki sensing, form execution, and rest timer precision.',
  },
};

export const getXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(level, 1.4));
};

export const getRankForLevel = (level) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};
