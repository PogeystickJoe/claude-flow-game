// Game Types and Interfaces
export interface Player {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  avatar: string;
  joinDate: Date;
  lastActive: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'ruv-tribute';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  hidden?: boolean;
}

export type AchievementCategory = 
  | 'swarm-mastery' 
  | 'tool-proficiency' 
  | 'neural-networks'
  | 'memory-management'
  | 'github-integration'
  | 'performance'
  | 'easter-eggs'
  | 'progression'
  | 'social'
  | 'ruv-tribute';

export interface Level {
  id: number;
  name: string;
  description: string;
  xpRequired: number;
  rewards: LevelReward[];
  challenges: Challenge[];
  unlockedTools: string[];
}

export interface LevelReward {
  type: 'achievement' | 'tool' | 'customization' | 'xp-multiplier';
  value: string | number;
  description: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: 'tutorial' | 'practice' | 'mastery' | 'easter-egg';
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  requirements: string[];
  completed: boolean;
  commands: CommandExecution[];
}

export interface CommandExecution {
  id: string;
  command: string;
  expectedOutput?: string;
  sandbox: boolean;
  timeout: number;
  hints: string[];
}

export interface SwarmState {
  id: string;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  agents: Agent[];
  tasks: Task[];
  performance: PerformanceMetrics;
  visualization: SwarmVisualization;
}

export interface Agent {
  id: string;
  type: string;
  name: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'error' | 'offline';
  position: { x: number; y: number; z: number };
  connections: string[];
  performance: AgentPerformance;
  neural: NeuralState;
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  efficiency: number;
}

export interface NeuralState {
  trainingLevel: number;
  patterns: string[];
  adaptability: number;
  learning: boolean;
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgents: string[];
  startTime?: Date;
  endTime?: Date;
  result?: any;
}

export interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  averageTaskTime: number;
  systemLoad: number;
  networkLatency: number;
  throughput: number;
}

export interface SwarmVisualization {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  particles: Particle[];
  effects: VisualEffect[];
}

export interface VisualizationNode {
  id: string;
  position: { x: number; y: number; z: number };
  size: number;
  color: string;
  opacity: number;
  pulsing: boolean;
  label: string;
}

export interface VisualizationEdge {
  from: string;
  to: string;
  strength: number;
  animated: boolean;
  color: string;
  particles: boolean;
}

export interface Particle {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'success' | 'data' | 'energy' | 'celebration';
}

export interface VisualEffect {
  id: string;
  type: 'ripple' | 'explosion' | 'pulse' | 'trail';
  position: { x: number; y: number; z: number };
  duration: number;
  elapsed: number;
  intensity: number;
}

export interface GameState {
  player: Player;
  achievements: Achievement[];
  levels: Level[];
  currentLevel: number;
  swarm: SwarmState | null;
  tutorial: TutorialState;
  sandbox: SandboxState;
  ui: UIState;
  settings: GameSettings;
  claudeFlowVersion?: string;
  discoveredFeatures?: string[];
}

export interface TutorialState {
  active: boolean;
  currentStep: number;
  totalSteps: number;
  stepData: TutorialStep[];
  completed: boolean;
  skipped: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  expectedResult?: string;
  hints: string[];
  validation: (result: any) => boolean;
  celebration?: boolean;
}

export interface SandboxState {
  active: boolean;
  mode: 'practice' | 'experiment' | 'challenge';
  history: CommandHistory[];
  currentCommand: string;
  output: string;
  errors: string[];
}

export interface CommandHistory {
  command: string;
  timestamp: Date;
  output: string;
  success: boolean;
  xpEarned: number;
}

export interface UIState {
  activePanel: 'game' | 'swarm' | 'achievements' | 'tutorial' | 'sandbox' | 'settings';
  notifications: Notification[];
  modals: Modal[];
  theme: 'dark' | 'light' | 'neon' | 'ruv';
  animations: boolean;
  particles: boolean;
  sound: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'achievement' | 'level-up';
  title: string;
  message: string;
  timestamp: Date;
  duration: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

export interface Modal {
  id: string;
  type: 'achievement' | 'level-up' | 'tutorial' | 'settings' | 'confirmation';
  title: string;
  content: any;
  onClose: () => void;
}

export interface GameSettings {
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'ruv-mode';
  autoSave: boolean;
  tutorialEnabled: boolean;
  particleIntensity: number;
  soundVolume: number;
  musicVolume: number;
  visualEffects: boolean;
  realTimeExecution: boolean;
  easterEggsEnabled: boolean;
}

// Easter Egg System
export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  trigger: string | RegExp;
  category: 'ruv-tribute' | 'hidden-feature' | 'developer' | 'community';
  rarity: 'common' | 'rare' | 'legendary';
  reward: Achievement;
  activated: boolean;
  activatedAt?: Date;
}

// Events
export interface GameEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

export type GameEventType = 
  | 'COMMAND_EXECUTED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP'
  | 'XP_GAINED'
  | 'SWARM_CREATED'
  | 'AGENT_SPAWNED'
  | 'TASK_COMPLETED'
  | 'EASTER_EGG_FOUND'
  | 'TUTORIAL_STARTED'
  | 'TUTORIAL_COMPLETED'
  | 'CHALLENGE_COMPLETED';