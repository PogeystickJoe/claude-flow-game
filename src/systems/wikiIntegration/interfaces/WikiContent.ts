/**
 * Core interfaces for Wiki Knowledge Base system
 */

export interface WikiContent {
  id: string;
  title: string;
  category: WikiCategory;
  content: string;
  metadata: WikiMetadata;
  sections: WikiSection[];
  tags: string[];
  difficulty: DifficultyLevel;
  lastUpdated: Date;
}

export interface WikiSection {
  id: string;
  title: string;
  content: string;
  subsections?: WikiSection[];
  codeExamples?: CodeExample[];
  keyPoints: string[];
  relatedTopics: string[];
}

export interface CodeExample {
  id: string;
  language: string;
  code: string;
  description: string;
  difficulty: DifficultyLevel;
  tags: string[];
}

export interface WikiMetadata {
  author?: string;
  contributors: string[];
  readingTime: number; // in minutes
  prerequisites: string[];
  learningObjectives: string[];
  complexity: ComplexityLevel;
  practicalExamples: number;
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: TutorialStepType;
  interactive: boolean;
  codeExample?: CodeExample;
  validation?: ValidationRule;
  hints: string[];
  nextSteps: string[];
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: DifficultyLevel;
  category: WikiCategory;
  sourceWikiId: string;
  points: number;
  timeLimit: number; // seconds
}

export interface ChallengeScenario {
  id: string;
  title: string;
  description: string;
  scenario: string;
  objectives: ChallengeObjective[];
  constraints: string[];
  difficulty: DifficultyLevel;
  estimatedTime: number; // minutes
  rewards: GameReward[];
  sourceWikiIds: string[];
  realWorldContext: string;
}

export interface ChallengeObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: any;
  completed: boolean;
  points: number;
}

export interface WikiAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirements: AchievementRequirement[];
  rewards: GameReward[];
  hidden: boolean;
  rarity: AchievementRarity;
  unlockedBy: string[]; // wiki content IDs
}

export interface AchievementRequirement {
  type: RequirementType;
  target: string | number;
  current: string | number;
  description: string;
}

export interface GameReward {
  type: RewardType;
  value: number;
  description: string;
  icon?: string;
}

export interface ValidationRule {
  type: ValidationType;
  pattern?: string | RegExp;
  expectedOutput?: string;
  customValidator?: (input: string) => boolean;
  errorMessage: string;
}

// Enums
export enum WikiCategory {
  GETTING_STARTED = 'getting-started',
  SPARC_METHODOLOGY = 'sparc-methodology',
  SWARM_COORDINATION = 'swarm-coordination',
  NEURAL_FEATURES = 'neural-features',
  GITHUB_INTEGRATION = 'github-integration',
  PERFORMANCE = 'performance',
  BEST_PRACTICES = 'best-practices',
  ADVANCED_FEATURES = 'advanced-features',
  TROUBLESHOOTING = 'troubleshooting',
  EXAMPLES = 'examples'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ComplexityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very-high'
}

export enum TutorialStepType {
  INTRODUCTION = 'introduction',
  CONCEPT = 'concept',
  PRACTICAL = 'practical',
  EXERCISE = 'exercise',
  QUIZ = 'quiz',
  SUMMARY = 'summary'
}

export enum ObjectiveType {
  IMPLEMENT = 'implement',
  OPTIMIZE = 'optimize',
  DEBUG = 'debug',
  INTEGRATE = 'integrate',
  ANALYZE = 'analyze',
  TEST = 'test'
}

export enum AchievementCategory {
  KNOWLEDGE = 'knowledge',
  PRACTICE = 'practice',
  MASTERY = 'mastery',
  DISCOVERY = 'discovery',
  COMMUNITY = 'community'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum RequirementType {
  READ_WIKI = 'read-wiki',
  COMPLETE_TUTORIAL = 'complete-tutorial',
  ANSWER_TRIVIA = 'answer-trivia',
  SOLVE_CHALLENGE = 'solve-challenge',
  DISCOVER_SECRET = 'discover-secret',
  TIME_SPENT = 'time-spent'
}

export enum RewardType {
  EXPERIENCE = 'experience',
  COINS = 'coins',
  BADGE = 'badge',
  UNLOCK_CONTENT = 'unlock-content',
  COSMETIC = 'cosmetic'
}

export enum ValidationType {
  EXACT_MATCH = 'exact-match',
  REGEX = 'regex',
  CONTAINS = 'contains',
  CODE_EXECUTION = 'code-execution',
  CUSTOM = 'custom'
}

// Utility interfaces
export interface WikiSearchResult {
  content: WikiContent;
  relevanceScore: number;
  matchedTerms: string[];
  snippet: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  prerequisites: string[];
  wikiContentIds: string[];
  milestones: LearningMilestone[];
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  requiredContent: string[];
  unlocks: string[];
  reward?: GameReward;
}