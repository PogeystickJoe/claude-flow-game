import { Level, LevelReward, Challenge } from '../types/game';

// Progressive level system with meaningful rewards and challenges
export const levelsData: Level[] = [
  {
    id: 1,
    name: 'Novice Explorer',
    description: 'Welcome to Claude Flow! Begin your journey of discovery.',
    xpRequired: 100,
    rewards: [
      {
        type: 'tool',
        value: 'swarm_init',
        description: 'Unlock swarm initialization'
      }
    ],
    challenges: [
      {
        id: 'first-swarm',
        name: 'Create Your First Swarm',
        description: 'Initialize your first swarm using the swarm_init command',
        category: 'tutorial',
        difficulty: 1,
        xpReward: 25,
        requirements: ['Complete tutorial step 3'],
        completed: false,
        commands: [{
          id: 'init-cmd',
          command: 'swarm_init({ topology: "mesh", maxAgents: 3 })',
          sandbox: true,
          timeout: 5000,
          hints: ['Try different topologies: mesh, hierarchical, ring, star']
        }]
      }
    ],
    unlockedTools: ['swarm_init', 'swarm_status']
  },
  {
    id: 2,
    name: 'Agent Apprentice',
    description: 'Learn to work with AI agents and basic coordination.',
    xpRequired: 200,
    rewards: [
      {
        type: 'tool',
        value: 'agent_spawn',
        description: 'Spawn and manage agents'
      },
      {
        type: 'xp-multiplier',
        value: 1.1,
        description: '10% XP bonus'
      }
    ],
    challenges: [
      {
        id: 'agent-master',
        name: 'Agent Master',
        description: 'Spawn 5 different types of agents',
        category: 'practice',
        difficulty: 2,
        xpReward: 40,
        requirements: ['Unlock agent_spawn tool'],
        completed: false,
        commands: [{
          id: 'spawn-cmd',
          command: 'agent_spawn({ type: "researcher", capabilities: ["analysis"] })',
          sandbox: true,
          timeout: 3000,
          hints: ['Agent types: researcher, coder, analyst, optimizer, coordinator']
        }]
      }
    ],
    unlockedTools: ['agent_spawn', 'agent_list', 'agent_metrics']
  },
  {
    id: 3,
    name: 'Task Coordinator',
    description: 'Master task orchestration and workflow management.',
    xpRequired: 350,
    rewards: [
      {
        type: 'tool',
        value: 'task_orchestrate',
        description: 'Orchestrate complex tasks'
      },
      {
        type: 'achievement',
        value: 'coordination-specialist',
        description: 'Special coordination badge'
      }
    ],
    challenges: [
      {
        id: 'parallel-tasks',
        name: 'Parallel Task Master',
        description: 'Run 3 tasks simultaneously with different strategies',
        category: 'mastery',
        difficulty: 3,
        xpReward: 60,
        requirements: ['Complete Agent Master challenge'],
        completed: false,
        commands: [{
          id: 'orchestrate-cmd',
          command: 'task_orchestrate({ task: "analyze codebase", strategy: "parallel" })',
          sandbox: true,
          timeout: 8000,
          hints: ['Strategies: parallel, sequential, adaptive, balanced']
        }]
      }
    ],
    unlockedTools: ['task_orchestrate', 'task_status', 'task_results']
  },
  {
    id: 4,
    name: 'Memory Keeper',
    description: 'Unlock the power of persistent memory and data management.',
    xpRequired: 550,
    rewards: [
      {
        type: 'tool',
        value: 'memory_usage',
        description: 'Memory management capabilities'
      },
      {
        type: 'customization',
        value: 'memory-theme',
        description: 'Unlock memory-themed UI elements'
      }
    ],
    challenges: [
      {
        id: 'memory-architect',
        name: 'Memory Architect',
        description: 'Create a complex memory structure with namespaces',
        category: 'mastery',
        difficulty: 3,
        xpReward: 80,
        requirements: ['Store 10 different memory entries'],
        completed: false,
        commands: [{
          id: 'memory-cmd',
          command: 'memory_usage({ action: "store", key: "swarm-config", value: "mesh-topology", namespace: "production" })',
          sandbox: true,
          timeout: 3000,
          hints: ['Use different namespaces to organize your data']
        }]
      }
    ],
    unlockedTools: ['memory_usage', 'memory_search', 'memory_persist', 'memory_namespace']
  },
  {
    id: 5,
    name: 'Neural Pioneer',
    description: 'Enter the realm of neural networks and AI enhancement.',
    xpRequired: 800,
    rewards: [
      {
        type: 'tool',
        value: 'neural_train',
        description: 'Neural network training'
      },
      {
        type: 'xp-multiplier',
        value: 1.25,
        description: '25% XP bonus'
      }
    ],
    challenges: [
      {
        id: 'neural-trainer',
        name: 'Neural Network Trainer',
        description: 'Successfully train a neural pattern to 90% accuracy',
        category: 'mastery',
        difficulty: 4,
        xpReward: 120,
        requirements: ['Complete Memory Architect challenge'],
        completed: false,
        commands: [{
          id: 'neural-cmd',
          command: 'neural_train({ pattern_type: "coordination", training_data: "swarm-patterns", epochs: 50 })',
          sandbox: true,
          timeout: 10000,
          hints: ['Pattern types: coordination, optimization, prediction']
        }]
      }
    ],
    unlockedTools: ['neural_status', 'neural_train', 'neural_patterns', 'neural_predict']
  },
  {
    id: 6,
    name: 'Performance Analyst',
    description: 'Master system optimization and performance monitoring.',
    xpRequired: 1100,
    rewards: [
      {
        type: 'tool',
        value: 'performance_report',
        description: 'Advanced performance analytics'
      },
      {
        type: 'achievement',
        value: 'optimization-expert',
        description: 'Performance optimization specialist'
      }
    ],
    challenges: [
      {
        id: 'bottleneck-hunter',
        name: 'Bottleneck Hunter',
        description: 'Identify and resolve 3 performance bottlenecks',
        category: 'mastery',
        difficulty: 4,
        xpReward: 150,
        requirements: ['Achieve 95% swarm efficiency'],
        completed: false,
        commands: [{
          id: 'performance-cmd',
          command: 'bottleneck_analyze({ component: "swarm", metrics: ["latency", "throughput"] })',
          sandbox: true,
          timeout: 5000,
          hints: ['Focus on latency, throughput, and resource utilization']
        }]
      }
    ],
    unlockedTools: ['performance_report', 'bottleneck_analyze', 'benchmark_run', 'metrics_collect']
  },
  {
    id: 7,
    name: 'GitHub Integrator',
    description: 'Connect Claude Flow with GitHub for enhanced collaboration.',
    xpRequired: 1450,
    rewards: [
      {
        type: 'tool',
        value: 'github_repo_analyze',
        description: 'GitHub repository integration'
      },
      {
        type: 'customization',
        value: 'github-theme',
        description: 'Unlock GitHub-themed visuals'
      }
    ],
    challenges: [
      {
        id: 'repo-master',
        name: 'Repository Master',
        description: 'Analyze 5 repositories and create automated workflows',
        category: 'mastery',
        difficulty: 3,
        xpReward: 100,
        requirements: ['Connect GitHub account'],
        completed: false,
        commands: [{
          id: 'github-cmd',
          command: 'github_repo_analyze({ repo: "user/repository", analysis_type: "code_quality" })',
          sandbox: false,
          timeout: 15000,
          hints: ['Analysis types: code_quality, performance, security']
        }]
      }
    ],
    unlockedTools: ['github_repo_analyze', 'github_pr_manage', 'github_issue_track']
  },
  {
    id: 8,
    name: 'Workflow Wizard',
    description: 'Create powerful automation workflows and custom processes.',
    xpRequired: 1850,
    rewards: [
      {
        type: 'tool',
        value: 'workflow_create',
        description: 'Custom workflow creation'
      },
      {
        type: 'xp-multiplier',
        value: 1.5,
        description: '50% XP bonus'
      }
    ],
    challenges: [
      {
        id: 'automation-master',
        name: 'Automation Master',
        description: 'Create a fully automated CI/CD pipeline',
        category: 'mastery',
        difficulty: 5,
        xpReward: 200,
        requirements: ['Create 3 custom workflows'],
        completed: false,
        commands: [{
          id: 'workflow-cmd',
          command: 'workflow_create({ name: "auto-deploy", steps: ["test", "build", "deploy"], triggers: ["push"] })',
          sandbox: true,
          timeout: 8000,
          hints: ['Consider error handling and rollback strategies']
        }]
      }
    ],
    unlockedTools: ['workflow_create', 'workflow_execute', 'automation_setup', 'pipeline_create']
  },
  {
    id: 9,
    name: 'Swarm Architect',
    description: 'Design and optimize complex swarm topologies.',
    xpRequired: 2300,
    rewards: [
      {
        type: 'tool',
        value: 'topology_optimize',
        description: 'Advanced topology optimization'
      },
      {
        type: 'achievement',
        value: 'swarm-grandmaster',
        description: 'Swarm architecture expertise'
      }
    ],
    challenges: [
      {
        id: 'topology-master',
        name: 'Topology Master',
        description: 'Optimize all 4 topology types for different use cases',
        category: 'mastery',
        difficulty: 5,
        xpReward: 250,
        requirements: ['Master all topology types'],
        completed: false,
        commands: [{
          id: 'topology-cmd',
          command: 'topology_optimize({ swarmId: "main-swarm" })',
          sandbox: true,
          timeout: 10000,
          hints: ['Each topology has optimal use cases - match them wisely']
        }]
      }
    ],
    unlockedTools: ['topology_optimize', 'load_balance', 'coordination_sync', 'swarm_scale']
  },
  {
    id: 10,
    name: 'Flow Master',
    description: 'Achieve mastery over all aspects of Claude Flow.',
    xpRequired: 2800,
    rewards: [
      {
        type: 'achievement',
        value: 'flow-master',
        description: 'Ultimate Flow mastery'
      },
      {
        type: 'xp-multiplier',
        value: 2.0,
        description: '100% XP bonus'
      },
      {
        type: 'customization',
        value: 'master-theme',
        description: 'Exclusive master theme'
      }
    ],
    challenges: [
      {
        id: 'ultimate-challenge',
        name: 'The Ultimate Challenge',
        description: 'Create a self-optimizing swarm ecosystem',
        category: 'mastery',
        difficulty: 5,
        xpReward: 500,
        requirements: ['Complete all previous challenges'],
        completed: false,
        commands: [{
          id: 'ultimate-cmd',
          command: 'daa_agent_create({ id: "self-optimizer", cognitivePattern: "adaptive", enableMemory: true })',
          sandbox: true,
          timeout: 15000,
          hints: ['Combine neural networks, memory, and automation for true autonomy']
        }]
      }
    ],
    unlockedTools: ['daa_agent_create', 'daa_workflow_create', 'daa_meta_learning']
  }
];

// Extended levels for advanced players
const advancedLevels: Level[] = [
  {
    id: 11,
    name: 'rUv Apprentice',
    description: 'Begin to understand the deeper mysteries of Claude Flow.',
    xpRequired: 3500,
    rewards: [
      {
        type: 'achievement',
        value: 'ruv-seeker',
        description: 'Seeker of hidden knowledge'
      }
    ],
    challenges: [],
    unlockedTools: []
  },
  // Continue up to level 50+...
];

// Add advanced levels to main levels array
levelsData.push(...advancedLevels);

// Helper functions for level system
export const calculateTotalXpForLevel = (targetLevel: number): number => {
  return levelsData
    .slice(0, targetLevel - 1)
    .reduce((total, level) => total + level.xpRequired, 0);
};

export const getLevelFromXp = (totalXp: number): number => {
  let currentXp = 0;
  for (let i = 0; i < levelsData.length; i++) {
    currentXp += levelsData[i].xpRequired;
    if (totalXp < currentXp) {
      return i + 1;
    }
  }
  return levelsData.length;
};

export const getXpProgressInLevel = (totalXp: number, level: number): number => {
  const previousLevelXp = calculateTotalXpForLevel(level);
  return totalXp - previousLevelXp;
};

export const getXpToNextLevel = (totalXp: number, level: number): number => {
  const currentLevelData = levelsData[level - 1];
  if (!currentLevelData) return 0;
  
  const progressInLevel = getXpProgressInLevel(totalXp, level);
  return currentLevelData.xpRequired - progressInLevel;
};

export const getUnlockedToolsUpToLevel = (level: number): string[] => {
  const tools = new Set<string>();
  
  for (let i = 0; i < level && i < levelsData.length; i++) {
    levelsData[i].unlockedTools.forEach(tool => tools.add(tool));
  }
  
  return Array.from(tools);
};

export const getLevelRewards = (level: number): LevelReward[] => {
  const levelData = levelsData[level - 1];
  return levelData ? levelData.rewards : [];
};

export const isToolUnlocked = (tool: string, playerLevel: number): boolean => {
  return getUnlockedToolsUpToLevel(playerLevel).includes(tool);
};

// Level progression rewards system
export const applyLevelRewards = (level: number, gameState: any) => {
  const rewards = getLevelRewards(level);
  const effects = [];
  
  rewards.forEach(reward => {
    switch (reward.type) {
      case 'tool':
        effects.push(`🔧 Unlocked tool: ${reward.value}`);
        break;
      case 'achievement':
        effects.push(`🏆 Earned achievement: ${reward.description}`);
        break;
      case 'xp-multiplier':
        effects.push(`⚡ XP multiplier increased to ${reward.value}x`);
        break;
      case 'customization':
        effects.push(`🎨 Unlocked: ${reward.description}`);
        break;
    }
  });
  
  return effects;
};