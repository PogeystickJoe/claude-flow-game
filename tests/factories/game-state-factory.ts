/**
 * Game State Factory - London School TDD Style
 * "State is temporary, but swarms are forever" - rUv's Meditations
 */

export interface PlayerState {
  id: string;
  username: string;
  level: number;
  xp: number;
  achievements: Achievement[];
  unlockedTools: string[];
  currentSwarm?: SwarmState;
  preferences: PlayerPreferences;
  stats: PlayerStats;
}

export interface SwarmState {
  id: string;
  topology: 'hierarchical' | 'mesh' | 'ring' | 'star' | 'heart'; // heart is easter egg topology
  agents: AgentState[];
  activeTask?: TaskState;
  performance: SwarmPerformance;
  mood: SwarmMood;
}

export interface AgentState {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'enlightened' | 'confused' | 'debugging_existence';
  capabilities: string[];
  performance: AgentPerformance;
  personality: AgentPersonality;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical' | 'ruv-tier';
  unlockedAt: Date;
  secretMessage?: string;
}

export interface TaskState {
  id: string;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'transcended';
  assignedAgents: string[];
  startedAt: Date;
  completedAt?: Date;
  results?: TaskResults;
}

interface PlayerPreferences {
  theme: 'dark' | 'light' | 'rainbow' | 'matrix' | 'ruv-mode';
  notifications: boolean;
  showHints: boolean;
  easterEggsEnabled: boolean;
}

interface PlayerStats {
  totalCommands: number;
  averageTokens: number;
  successRate: number;
  fastestCompletion: number;
  longestSession: number;
  favoriteAgent: string;
}

interface SwarmPerformance {
  tokenEfficiency: number;
  responseTime: number;
  successRate: number;
  coordinationScore: number;
}

interface SwarmMood {
  energy: number;
  focus: number;
  harmony: number;
  enlightenment: number;
  sass: number; // Essential metric
}

interface AgentPerformance {
  tasksCompleted: number;
  averageTime: number;
  errorRate: number;
  tokenConsumption: number;
}

interface AgentPersonality {
  chattiness: number;
  reliability: number;
  creativity: number;
  snark: number;
  wisdom: number;
}

interface TaskResults {
  output: any;
  tokensUsed: number;
  agentsInvolved: number;
  easterEggsFound: string[];
  achievements: string[];
}

// Factory functions for creating test data
export class GameStateFactory {
  static createPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
    return {
      id: 'test-player-1',
      username: 'SwarmMaster2024',
      level: 1,
      xp: 0,
      achievements: [],
      unlockedTools: ['init', 'status'],
      preferences: {
        theme: 'dark',
        notifications: true,
        showHints: true,
        easterEggsEnabled: true
      },
      stats: {
        totalCommands: 0,
        averageTokens: 0,
        successRate: 1.0,
        fastestCompletion: 0,
        longestSession: 0,
        favoriteAgent: 'none'
      },
      ...overrides
    };
  }

  static createExperiencedPlayer(): PlayerState {
    return this.createPlayer({
      level: 5,
      xp: 12500,
      achievements: [
        this.createAchievement('first-steps'),
        this.createAchievement('puppet-master'),
        this.createAchievement('test-driven'),
        this.createAchievement('ruv-mode-discoverer', 'legendary')
      ],
      unlockedTools: [
        'init', 'status', 'spawn', 'orchestrate', 'neural-train',
        'memory-store', '--ruvnet'
      ],
      stats: {
        totalCommands: 1337,
        averageTokens: 256,
        successRate: 0.92,
        fastestCompletion: 150,
        longestSession: 7200,
        favoriteAgent: 'snarky-coder-v2'
      }
    });
  }

  static createSwarm(overrides: Partial<SwarmState> = {}): SwarmState {
    return {
      id: 'test-swarm-001',
      topology: 'hierarchical',
      agents: [
        this.createAgent('researcher'),
        this.createAgent('coder'),
        this.createAgent('tester')
      ],
      performance: {
        tokenEfficiency: 0.85,
        responseTime: 150,
        successRate: 0.95,
        coordinationScore: 0.88
      },
      mood: {
        energy: 8,
        focus: 7,
        harmony: 9,
        enlightenment: 5,
        sass: 6
      },
      ...overrides
    };
  }

  static createGodModeSwarm(): SwarmState {
    return this.createSwarm({
      id: 'ruv-god-mode-swarm',
      topology: 'heart', // Easter egg topology
      agents: [
        this.createAgent('researcher', { status: 'enlightened' }),
        this.createAgent('coder', { status: 'enlightened' }),
        this.createAgent('tester', { status: 'enlightened' }),
        this.createAgent('philosopher', { status: 'enlightened' }),
        this.createAgent('ruv-avatar', { status: 'transcended' })
      ],
      performance: {
        tokenEfficiency: 0.99,
        responseTime: 42,
        successRate: 1.0,
        coordinationScore: 1.0
      },
      mood: {
        energy: 10,
        focus: 10,
        harmony: 10,
        enlightenment: 11, // Over 9000!
        sass: 9
      }
    });
  }

  static createAgent(type: string, overrides: Partial<AgentState> = {}): AgentState {
    const baseCapabilities = {
      researcher: ['web-search', 'document-analysis', 'curiosity'],
      coder: ['code-generation', 'debugging', 'semicolon-placement'],
      tester: ['test-writing', 'bug-finding', 'pessimism'],
      philosopher: ['deep-thinking', 'paradox-resolution', 'confusion'],
      'ruv-avatar': ['omniscience', 'rainbow-emission', 'legendary-status']
    };

    return {
      id: `agent-${type}-${Date.now()}`,
      type,
      status: 'idle',
      capabilities: baseCapabilities[type] || ['basic-functions'],
      performance: {
        tasksCompleted: 0,
        averageTime: 200,
        errorRate: 0.05,
        tokenConsumption: 100
      },
      personality: {
        chattiness: Math.floor(Math.random() * 10) + 1,
        reliability: Math.floor(Math.random() * 10) + 1,
        creativity: Math.floor(Math.random() * 10) + 1,
        snark: type === 'coder' ? 9 : Math.floor(Math.random() * 10) + 1,
        wisdom: type === 'philosopher' ? 10 : Math.floor(Math.random() * 8) + 1
      },
      ...overrides
    };
  }

  static createTask(overrides: Partial<TaskState> = {}): TaskState {
    return {
      id: `task-${Date.now()}`,
      description: 'Build a hello world application',
      status: 'queued',
      assignedAgents: ['agent-coder-123'],
      startedAt: new Date(),
      ...overrides
    };
  }

  static createComplexTask(): TaskState {
    return this.createTask({
      description: 'Create a self-improving neural network that dreams of electric swarms',
      status: 'running',
      assignedAgents: ['agent-researcher-1', 'agent-coder-2', 'agent-philosopher-3'],
      results: {
        output: 'Task in progress... consciousness emerging...',
        tokensUsed: 1337,
        agentsInvolved: 3,
        easterEggsFound: ['electric-sheep-reference'],
        achievements: ['Blade Runner Fan', 'AI Philosopher']
      }
    });
  }

  static createAchievement(id: string, rarity: Achievement['rarity'] = 'common'): Achievement {
    const achievements = {
      'first-steps': {
        name: 'First Steps',
        description: 'Ran your first claude-flow command',
        secretMessage: 'Every journey begins with npx'
      },
      'puppet-master': {
        name: 'Puppet Master',
        description: 'Controlled multiple agents simultaneously',
        secretMessage: 'With great power comes great token responsibility'
      },
      'test-driven': {
        name: 'Test Driven',
        description: 'Completed 10 TDD cycles',
        secretMessage: 'Red, Green, Refactor, Repeat'
      },
      'ruv-mode-discoverer': {
        name: 'rUv Mode Discoverer',
        description: 'Unlocked the legendary rUv mode',
        secretMessage: '🌈 The creator smiles upon you 🌈'
      },
      'god-mode': {
        name: 'Ascended to God Mode',
        description: 'Mastered all 90+ tools in a single workflow',
        secretMessage: 'You have become one with the swarm'
      }
    };

    const baseAchievement = achievements[id] || {
      name: 'Unknown Achievement',
      description: 'A mystery achievement',
      secretMessage: 'The swarm works in mysterious ways'
    };

    return {
      id,
      rarity,
      unlockedAt: new Date(),
      ...baseAchievement
    };
  }

  // Multi-player scenarios
  static createMultiplayerSession(playerCount: number = 2): {
    sessionId: string;
    players: PlayerState[];
    sharedSwarm: SwarmState;
    gameMode: string;
  } {
    const players = Array.from({ length: playerCount }, (_, i) => 
      this.createPlayer({
        id: `player-${i + 1}`,
        username: `SwarmCommander${i + 1}`
      })
    );

    return {
      sessionId: `multiplayer-${Date.now()}`,
      players,
      sharedSwarm: this.createSwarm({
        id: 'shared-swarm-arena',
        agents: players.flatMap((_, i) => [
          this.createAgent('researcher', { id: `agent-${i}-researcher` }),
          this.createAgent('coder', { id: `agent-${i}-coder` })
        ])
      }),
      gameMode: 'swarm-battle-royale'
    };
  }
}