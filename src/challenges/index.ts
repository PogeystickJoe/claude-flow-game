/**
 * Challenge System Exports
 * Central export file for all wiki-based challenges
 */

// Main challenge definitions
export { default as wikiChallenges } from './wikiChallenges';
export type {
  WikiChallenge,
  WikiChallengeType,
  SocialShareTemplate,
  WikiQuestion,
  CommandChallenge,
  BugScenario,
  SpeedRunTask,
  SpeedRunStep,
  EasterEgg,
  MemeTemplate
} from './wikiChallenges';

export {
  WikiChallengeManager,
  SocialShareManager,
  wikiWarriorQuestions,
  commandMasterChallenges,
  bugHunterScenarios,
  speedRunTasks,
  easterEggs,
  memeTemplates
} from './wikiChallenges';

// Challenge validation and progress tracking
export type {
  ChallengeResult,
  ChallengeValidation
} from './challengeTypes';

export {
  WikiWarriorValidator,
  CommandMasterValidator,
  BugHunterValidator,
  SpeedRunValidator,
  EasterEggValidator,
  MemeLordValidator,
  ChallengeProgressTracker
} from './challengeTypes';

// UI Components
export { ChallengeUI } from './challengeUI';

// Challenge categories for easy filtering
export const CHALLENGE_CATEGORIES = {
  KNOWLEDGE: 'knowledge',
  PRACTICAL: 'practical',
  CREATIVE: 'creative',
  SPEED: 'speed',
  DISCOVERY: 'discovery'
} as const;

export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,
  EASY: 2,
  MEDIUM: 3,
  HARD: 4,
  EXPERT: 5
} as const;

// Social sharing platforms
export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  GITHUB: 'github',
  DISCORD: 'discord',
  REDDIT: 'reddit'
} as const;

// Achievement thresholds
export const ACHIEVEMENT_THRESHOLDS = {
  PERFECT_SCORE: 100,
  EXCELLENT: 90,
  GOOD: 70,
  PASSING: 60,
  STREAK_MASTER: 5,
  SPEED_DEMON: 30, // seconds for gold in speed run
  EGG_HUNTER: 10, // number of easter eggs found
  MEME_VIRAL: 80 // viral potential score
} as const;

// XP and reward multipliers
export const REWARD_MULTIPLIERS = {
  PERFECT_SCORE: 2.0,
  FIRST_ATTEMPT: 1.5,
  STREAK_BONUS: 1.2,
  SPEED_BONUS: 1.3,
  NO_HINTS_USED: 1.25,
  SOCIAL_SHARE: 1.1
} as const;

// Challenge unlock requirements
export const UNLOCK_REQUIREMENTS = {
  WIKI_WARRIOR: {
    level: 1,
    prerequisites: ['complete_tutorial']
  },
  COMMAND_MASTER: {
    level: 2,
    prerequisites: ['wiki_warrior_basic']
  },
  BUG_HUNTER: {
    level: 3,
    prerequisites: ['command_master_basic']
  },
  SPEED_RUN: {
    level: 4,
    prerequisites: ['master_all_basic_commands']
  },
  EASTER_EGG_HUNT: {
    level: 2,
    prerequisites: ['explore_all_wiki_sections']
  },
  MEME_LORD: {
    level: 1,
    prerequisites: ['unlock_meme_templates']
  }
} as const;

// Time limits by difficulty (in seconds)
export const TIME_LIMITS = {
  [DIFFICULTY_LEVELS.BEGINNER]: 600, // 10 minutes
  [DIFFICULTY_LEVELS.EASY]: 450,     // 7.5 minutes  
  [DIFFICULTY_LEVELS.MEDIUM]: 300,   // 5 minutes
  [DIFFICULTY_LEVELS.HARD]: 180,     // 3 minutes
  [DIFFICULTY_LEVELS.EXPERT]: 120    // 2 minutes
} as const;

// Social sharing templates
export const SOCIAL_TEMPLATES = {
  ACHIEVEMENT_UNLOCKED: '🏆 Achievement Unlocked: {ACHIEVEMENT_NAME}\n\nJust mastered {CHALLENGE_TYPE} in Claude Flow! Score: {SCORE}%\n\n#ClaudeFlow #Achievement #AI',
  PERFECT_SCORE: '💯 PERFECT SCORE!\n\nAced {CHALLENGE_NAME} with 100% accuracy! 🎯\n\nTime: {TIME}s\nStreak: {STREAK}\n\n#ClaudeFlow #PerfectScore #Master',
  WORLD_RECORD: '🌟 NEW WORLD RECORD! 🌟\n\nJust set a new record in {CHALLENGE_NAME}!\n\nTime: {TIME}s\nPrevious: {OLD_RECORD}s\n\n#ClaudeFlow #WorldRecord #SpeedRun',
  STREAK_MILESTONE: '🔥 ON FIRE! {STREAK} Challenge Streak! 🔥\n\nConsecutive perfect scores in Claude Flow challenges!\n\n#ClaudeFlow #Streak #Unstoppable',
  EASTER_EGG_FOUND: '🥚 EASTER EGG DISCOVERED! 🥚\n\nFound: {EGG_NAME}\nRarity: {RARITY}\nReward: {REWARD}\n\n#ClaudeFlow #EasterEgg #SecretFind',
  MEME_VIRAL: '😂 MEME GOING VIRAL! 😂\n\nMy Claude Flow meme just hit {LIKES} likes!\n\n{MEME_CONTENT}\n\n#ClaudeFlow #MemeLord #Viral'
} as const;

// Utility functions
export const getChallengesByDifficulty = (difficulty: number) => {
  return wikiChallenges.filter(challenge => challenge.difficulty === difficulty);
};

export const getChallengesByCategory = (category: string) => {
  return wikiChallenges.filter(challenge => challenge.category === category);
};

export const getChallengesByType = (type: WikiChallengeType) => {
  return wikiChallenges.filter(challenge => challenge.type === type);
};

export const calculateTotalXP = (challenges: WikiChallenge[]) => {
  return challenges.reduce((total, challenge) => total + challenge.xpReward, 0);
};

export const calculateSocialPoints = (challenges: WikiChallenge[]) => {
  return challenges.reduce((total, challenge) => total + challenge.socialPoints, 0);
};

export const generateShareUrl = (challengeId: string, score: number, time: number) => {
  const baseUrl = 'https://claude-flow-game.com/challenge';
  return `${baseUrl}/${challengeId}?score=${score}&time=${time}`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateScore = (
  baseScore: number,
  timeBonus: number = 0,
  streakMultiplier: number = 1,
  perfectScoreBonus: number = 0,
  noHintsBonus: number = 0
): number => {
  let finalScore = baseScore;
  
  // Apply time bonus
  finalScore += timeBonus;
  
  // Apply streak multiplier
  finalScore *= streakMultiplier;
  
  // Apply perfect score bonus
  if (perfectScoreBonus > 0) {
    finalScore += perfectScoreBonus;
  }
  
  // Apply no hints bonus
  if (noHintsBonus > 0) {
    finalScore *= (1 + noHintsBonus / 100);
  }
  
  return Math.min(Math.round(finalScore), 100);
};

// Challenge statistics for leaderboards
export interface ChallengeStats {
  challengeId: string;
  totalAttempts: number;
  successRate: number;
  averageScore: number;
  averageTime: number;
  bestScore: number;
  fastestTime: number;
  popularityRank: number;
}

// Global leaderboard entry
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  challengesCompleted: number;
  perfectScores: number;
  currentStreak: number;
  longestStreak: number;
  totalTime: number;
  rank: number;
  achievements: string[];
}

export default {
  wikiChallenges,
  WikiChallengeManager,
  SocialShareManager,
  CHALLENGE_CATEGORIES,
  DIFFICULTY_LEVELS,
  SOCIAL_PLATFORMS,
  ACHIEVEMENT_THRESHOLDS,
  REWARD_MULTIPLIERS,
  UNLOCK_REQUIREMENTS,
  TIME_LIMITS,
  SOCIAL_TEMPLATES
};