// Achievement system for gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'time' | 'commands' | 'level' | 'streak' | 'special';
    value?: number;
    condition?: string;
  };
  rewards: {
    xp: number;
    title?: string;
    unlocks?: string[];
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete any investigation in under 3 minutes',
    icon: 'SPEED',
    rarity: 'epic',
    requirements: { type: 'time', value: 180 },
    rewards: { xp: 1000, title: 'Lightning Hacker' }
  },
  {
    id: 'perfect-run',
    title: 'Flawless',
    description: 'Complete an investigation without any wrong commands',
    icon: 'PERFECT',
    rarity: 'rare',
    requirements: { type: 'commands', value: 0 },
    rewards: { xp: 500, unlocks: ['precision-mode'] }
  },
  {
    id: 'night-owl',
    title: '🦉 Night Owl',
    description: 'Complete 5 investigations between 10PM and 6AM',
    icon: '🦉',
    rarity: 'common',
    requirements: { type: 'special', condition: 'night_time_completions' },
    rewards: { xp: 300, title: 'Night Hacker' }
  },
  {
    id: 'social-savior',
    title: '💖 Social Savior',
    description: 'Complete all social media investigations',
    icon: '💖',
    rarity: 'legendary',
    requirements: { type: 'special', condition: 'social_media_master' },
    rewards: { xp: 2000, title: 'Guardian of Truth', unlocks: ['elite-tools'] }
  },
  {
    id: 'first-blood',
    title: '🩸 First Blood',
    description: 'Complete your very first investigation',
    icon: '🩸',
    rarity: 'common',
    requirements: { type: 'level', value: 1 },
    rewards: { xp: 100, title: 'Rookie Investigator' }
  },
  {
    id: 'streak-master',
    title: 'On Fire',
    description: 'Complete 7 investigations in 7 days',
    icon: 'FIRE',
    rarity: 'epic',
    requirements: { type: 'streak', value: 7 },
    rewards: { xp: 1500, title: 'Streak Master', unlocks: ['fire-mode'] }
  }
];

export interface UserProgress {
  level: number;
  xp: number;
  xpToNext: number;
  achievements: string[];
  badges: string[];
  titles: string[];
  activeTitle: string | null;
  streak: number;
  lastPlayDate: string;
  totalPlayTime: number;
  favoriteCategory: string;
  investigationsCompleted: number;
  averageTime: number;
  fastestTime: number;
  perfectRuns: number;
  unlockedTools: string[];
}

export const calculateLevel = (xp: number): { level: number; xpToNext: number } => {
  // Level progression: 100, 250, 500, 1000, 2000, 4000, etc.
  let level = 1;
  let totalXpNeeded = 0;
  let nextLevelXp = 100;
  
  while (xp >= totalXpNeeded + nextLevelXp) {
    totalXpNeeded += nextLevelXp;
    level++;
    nextLevelXp = Math.floor(nextLevelXp * 1.5);
  }
  
  const xpToNext = (totalXpNeeded + nextLevelXp) - xp;
  return { level, xpToNext };
};

export const LEVEL_TITLES = {
  1: 'Script Kiddie',
  5: 'Code Breaker', 
  10: 'Digital Detective',
  15: 'Cyber Sleuth',
  20: 'Network Ninja',
  25: 'Security Sage',
  30: 'Hack Master',
  40: 'Elite Operative',
  50: 'Cyber Legend'
};
