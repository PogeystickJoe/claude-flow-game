// Game Core Types
export interface GameState {
  id: string;
  playerId: string;
  currentLevel: GameLevel;
  score: number;
  lives: number;
  powerUps: PowerUp[];
  achievements: Achievement[];
  stats: GameStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameLevel {
  id: string;
  name: string;
  difficulty: Difficulty;
  objectives: Objective[];
  swarmConfig: SwarmConfiguration;
  timeLimit?: number;
  requiredScore: number;
  unlockConditions: UnlockCondition[];
}

export interface SwarmConfiguration {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents: number;
  agentTypes: AgentType[];
  coordination: CoordinationStrategy;
  neuralPatterns: string[];
}

export interface AgentType {
  type: 'researcher' | 'coder' | 'analyst' | 'optimizer' | 'coordinator';
  capabilities: string[];
  specializations: string[];
  powerLevel: number;
}

export interface CoordinationStrategy {
  strategy: 'parallel' | 'sequential' | 'adaptive' | 'competitive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'constant';
  baseDelay: number;
}

// Player & User Types
export interface Player {
  id: string;
  username: string;
  email: string;
  profile: PlayerProfile;
  gameStats: PlayerStats;
  achievements: Achievement[];
  inventory: Inventory;
  friends: string[];
  guilds: string[];
  preferences: PlayerPreferences;
  createdAt: Date;
  lastActive: Date;
}

export interface PlayerProfile {
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  rank: PlayerRank;
  title: string;
  badges: Badge[];
  socialLinks: SocialLink[];
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  favoriteLevels: string[];
  preferredSwarmTypes: SwarmType[];
  winRate: number;
  ranking: number;
  seasonStats: SeasonStats[];
}

export interface PlayerRank {
  current: RankTier;
  points: number;
  nextRankPoints: number;
  season: string;
  history: RankHistory[];
}

// Battle & Multiplayer Types
export interface Battle {
  id: string;
  type: BattleType;
  mode: BattleMode;
  players: BattlePlayer[];
  state: BattleState;
  configuration: BattleConfiguration;
  startTime: Date;
  endTime?: Date;
  winner?: string;
  spectators: string[];
  replay: BattleReplay;
}

export interface BattlePlayer {
  playerId: string;
  team?: string;
  swarmConfig: SwarmConfiguration;
  currentScore: number;
  status: 'ready' | 'playing' | 'disconnected' | 'finished';
  performance: BattlePerformance;
}

export interface BattleConfiguration {
  maxPlayers: number;
  timeLimit: number;
  level: string;
  ruleset: BattleRuleset;
  rewards: BattleReward[];
  entryFee?: number;
  spectatorAllowed: boolean;
}

// Neural & AI Types
export interface NeuralPattern {
  id: string;
  name: string;
  type: PatternType;
  version: string;
  embedding: number[];
  performance: PatternPerformance;
  metadata: PatternMetadata;
  trainingData: TrainingData;
  evolution: PatternEvolution;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatternPerformance {
  accuracy: number;
  efficiency: number;
  adaptability: number;
  stability: number;
  successRate: number;
  avgExecutionTime: number;
  memoryUsage: number;
  scoreImprovement: number;
}

export interface PatternEvolution {
  generation: number;
  parentPatterns: string[];
  mutations: Mutation[];
  fitnessScore: number;
  survivalRate: number;
  adaptationHistory: AdaptationRecord[];
}

// WebSocket & Real-time Types
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  sender?: string;
  recipient?: string;
  channel?: string;
}

export interface GameEvent {
  id: string;
  type: GameEventType;
  playerId: string;
  battleId?: string;
  data: any;
  timestamp: Date;
  processed: boolean;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Enums
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master'
}

export enum BattleType {
  RANKED = 'ranked',
  CASUAL = 'casual',
  TOURNAMENT = 'tournament',
  TRAINING = 'training',
  CUSTOM = 'custom'
}

export enum BattleMode {
  SOLO = 'solo',
  TEAM = 'team',
  FREE_FOR_ALL = 'ffa',
  ELIMINATION = 'elimination',
  SURVIVAL = 'survival'
}

export enum MessageType {
  GAME_STATE_UPDATE = 'game_state_update',
  BATTLE_UPDATE = 'battle_update',
  PLAYER_ACTION = 'player_action',
  CHAT_MESSAGE = 'chat_message',
  SYSTEM_NOTIFICATION = 'system_notification',
  SWARM_UPDATE = 'swarm_update',
  NEURAL_PATTERN_UPDATE = 'neural_pattern_update'
}

export enum GameEventType {
  GAME_START = 'game_start',
  GAME_END = 'game_end',
  LEVEL_COMPLETE = 'level_complete',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  SWARM_DEPLOYED = 'swarm_deployed',
  PATTERN_EVOLVED = 'pattern_evolved',
  BATTLE_JOIN = 'battle_join',
  BATTLE_LEAVE = 'battle_leave'
}

export enum PatternType {
  COORDINATION = 'coordination',
  OPTIMIZATION = 'optimization',
  ADAPTATION = 'adaptation',
  LEARNING = 'learning',
  EMERGENCE = 'emergence'
}

export enum RankTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
  MASTER = 'master',
  GRANDMASTER = 'grandmaster'
}

// Utility Types
export type SwarmType = SwarmConfiguration['topology'];
export type AgentCapability = string;
export type PatternId = string;
export type PlayerId = string;
export type BattleId = string;
export type GameId = string;

// Additional supporting interfaces
export interface PowerUp {
  id: string;
  name: string;
  type: string;
  effect: any;
  duration: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  requirements: any;
  reward: any;
  unlockedAt?: Date;
}

export interface GameStats {
  totalMoves: number;
  totalTime: number;
  efficiency: number;
  accuracy: number;
  swarmPerformance: SwarmPerformanceMetrics;
}

export interface SwarmPerformanceMetrics {
  coordination: number;
  taskCompletion: number;
  adaptability: number;
  emergentBehaviors: number;
}

export interface Objective {
  id: string;
  description: string;
  type: string;
  target: any;
  completed: boolean;
  reward: any;
}

export interface UnlockCondition {
  type: string;
  requirement: any;
  met: boolean;
}

export interface Inventory {
  powerUps: PowerUp[];
  cosmetics: any[];
  currency: { [key: string]: number };
}

export interface PlayerPreferences {
  theme: string;
  notifications: boolean;
  sound: boolean;
  graphics: string;
  privacy: any;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SeasonStats {
  season: string;
  rank: RankTier;
  wins: number;
  losses: number;
  points: number;
}

export interface RankHistory {
  rank: RankTier;
  points: number;
  date: Date;
}

export interface BattleState {
  phase: 'waiting' | 'starting' | 'active' | 'paused' | 'finished';
  turnOrder: string[];
  currentTurn: string;
  timeRemaining: number;
}

export interface BattlePerformance {
  score: number;
  moves: number;
  efficiency: number;
  swarmCoordination: number;
}

export interface BattleRuleset {
  name: string;
  rules: any[];
  restrictions: any[];
  powerUpsEnabled: boolean;
  spectatorChat: boolean;
}

export interface BattleReward {
  type: string;
  amount: number;
  condition: string;
}

export interface BattleReplay {
  events: GameEvent[];
  metadata: any;
  version: string;
}

export interface PatternMetadata {
  creator: string;
  tags: string[];
  description: string;
  usageCount: number;
  rating: number;
  complexity: number;
}

export interface TrainingData {
  samples: any[];
  validationSplit: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
}

export interface Mutation {
  type: string;
  parameters: any;
  impact: number;
  timestamp: Date;
}

export interface AdaptationRecord {
  trigger: string;
  response: any;
  outcome: number;
  timestamp: Date;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: Date;
  processingTime: number;
  version: string;
}