/**
 * Comprehensive Wiki-Based Challenge System for Claude Flow: The Ascension
 * 
 * Complete challenge system covering ALL aspects of Claude Flow:
 * - 64 Agent mastery challenges
 * - 87 MCP tool tutorials and validation
 * - SPARC methodology training
 * - Neural network simulations
 * - Performance benchmarking
 * - GitHub integration workflows
 * - Hook system automation
 * 
 * Six main challenge categories:
 * 1. Wiki Warrior - Knowledge mastery across all topics
 * 2. Command Master - Practical MCP tool execution
 * 3. Bug Hunter - Advanced troubleshooting scenarios
 * 4. Speed Run - Efficiency and optimization challenges
 * 5. Easter Egg Hunt - Hidden features and references
 * 6. Meme Lord - Creative content and community engagement
 */

export interface WikiChallenge {
  id: string;
  type: WikiChallengeType;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'knowledge' | 'practical' | 'creative' | 'speed' | 'discovery';
  xpReward: number;
  socialPoints: number;
  timeLimit?: number; // in seconds
  requirements: string[];
  hints: string[];
  solution?: any;
  socialShareTemplate: SocialShareTemplate;
  unlockLevel: number;
}

export type WikiChallengeType = 
  | 'wiki-warrior'
  | 'command-master'
  | 'bug-hunter'
  | 'speed-run'
  | 'easter-egg-hunt'
  | 'meme-lord';

export interface SocialShareTemplate {
  title: string;
  message: string;
  hashtags: string[];
  image?: string;
  template: string;
}

export interface WikiQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  wikiReference: string;
  difficulty: 1 | 2 | 3;
  category: 'basics' | 'agents' | 'sparc' | 'neural' | 'advanced';
}

export interface CommandChallenge {
  id: string;
  name: string;
  description: string;
  commands: string[];
  expectedResults: string[];
  validation: (output: string) => boolean;
  hints: string[];
  sandbox: boolean;
  timeout: number;
}

export interface BugScenario {
  id: string;
  title: string;
  description: string;
  errorMessage: string;
  symptoms: string[];
  possibleCauses: string[];
  correctSolution: string;
  incorrectSolutions: string[];
  explanation: string;
  troubleshootingSteps: string[];
}

export interface SpeedRunTask {
  id: string;
  name: string;
  description: string;
  steps: SpeedRunStep[];
  goldTime: number; // seconds for gold medal
  silverTime: number;
  bronzeTime: number;
  worldRecord?: number;
  validation: (results: any[]) => boolean;
}

export interface SpeedRunStep {
  id: string;
  instruction: string;
  command?: string;
  expectedOutput?: string;
  points: number;
}

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  location: 'wiki' | 'code' | 'command' | 'ui' | 'docs';
  trigger: string | RegExp;
  hint: string;
  category: 'ruv-tribute' | 'developer-joke' | 'hidden-feature' | 'pop-culture';
  rarity: 'common' | 'rare' | 'legendary' | 'mythic';
  reward: string;
  found: boolean;
}

export interface MemeTemplate {
  id: string;
  name: string;
  template: string;
  placeholder: string[];
  category: 'agents' | 'swarm' | 'sparc' | 'performance' | 'bugs';
  popularityScore: number;
  viralPotential: number;
}

// Wiki Warrior Challenges - Trivia Questions
export const wikiWarriorQuestions: WikiQuestion[] = [
  // Basics
  {
    id: 'ww-001',
    question: 'What does SPARC stand for in Claude Flow methodology?',
    options: [
      'Simple Parallel Architecture Refinement Completion',
      'Specification, Pseudocode, Architecture, Refinement, Completion',
      'Swarm Protocol and Rapid Coordination',
      'Sequential Programming and Resource Control'
    ],
    correctAnswer: 1,
    explanation: 'SPARC is the systematic methodology: Specification → Pseudocode → Architecture → Refinement → Completion',
    wikiReference: 'CLAUDE.md#sparc-workflow-phases',
    difficulty: 1,
    category: 'basics'
  },
  {
    id: 'ww-002',
    question: 'How many total agents are available in Claude Flow?',
    options: ['42', '54', '90+', '27'],
    correctAnswer: 1,
    explanation: '54 specialized agents across different categories: Core Development, Swarm Coordination, GitHub Integration, etc.',
    wikiReference: 'CLAUDE.md#available-agents',
    difficulty: 2,
    category: 'agents'
  },
  {
    id: 'ww-003',
    question: 'What is the performance improvement claimed by Claude Flow?',
    options: ['1.5-2x speed', '2.8-4.4x speed', '5-10x speed', '50% faster'],
    correctAnswer: 1,
    explanation: 'Claude Flow provides 2.8-4.4x speed improvement through parallel execution and optimization',
    wikiReference: 'CLAUDE.md#performance-benefits',
    difficulty: 2,
    category: 'advanced'
  },
  {
    id: 'ww-004',
    question: 'Which command initializes a new swarm with mesh topology?',
    options: [
      'npx claude-flow init mesh',
      'npx claude-flow swarm create --topology=mesh',
      'mcp__claude-flow__swarm_init { topology: "mesh" }',
      'claude-flow start --mesh'
    ],
    correctAnswer: 2,
    explanation: 'MCP tools use the mcp__claude-flow__swarm_init function with topology parameter',
    wikiReference: 'CLAUDE.md#mcp-tool-categories',
    difficulty: 3,
    category: 'basics'
  },
  {
    id: 'ww-005',
    question: 'What is the SWE-Bench solve rate achieved by Claude Flow?',
    options: ['75.2%', '84.8%', '92.1%', '67.3%'],
    correctAnswer: 1,
    explanation: 'Claude Flow achieves an impressive 84.8% SWE-Bench solve rate',
    wikiReference: 'CLAUDE.md#performance-benefits',
    difficulty: 3,
    category: 'advanced'
  }
];

// Command Master Challenges
export const commandMasterChallenges: CommandChallenge[] = [
  {
    id: 'cm-001',
    name: 'First Swarm',
    description: 'Initialize your first swarm using the mesh topology with 3 agents',
    commands: [
      'mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 3 }',
      'mcp__claude-flow__swarm_status'
    ],
    expectedResults: [
      'Swarm initialized successfully',
      'Swarm status: Active'
    ],
    validation: (output: string) => output.includes('mesh') && output.includes('Active'),
    hints: [
      'Use the mesh topology for maximum connectivity',
      'Check swarm status to confirm initialization',
      'Remember the JSON format for parameters'
    ],
    sandbox: true,
    timeout: 30
  },
  {
    id: 'cm-002',
    name: 'Agent Orchestra',
    description: 'Spawn a researcher, coder, and tester agent, then orchestrate a simple task',
    commands: [
      'mcp__claude-flow__agent_spawn { type: "researcher" }',
      'mcp__claude-flow__agent_spawn { type: "coder" }', 
      'mcp__claude-flow__agent_spawn { type: "tester" }',
      'mcp__claude-flow__task_orchestrate { task: "Create a hello world function", strategy: "sequential" }'
    ],
    expectedResults: [
      'Agent spawned: researcher',
      'Agent spawned: coder',
      'Agent spawned: tester',
      'Task orchestrated successfully'
    ],
    validation: (output: string) => output.includes('researcher') && output.includes('coder') && output.includes('tester'),
    hints: [
      'Spawn agents in order of workflow',
      'Use sequential strategy for step-by-step execution',
      'Each agent has specialized capabilities'
    ],
    sandbox: true,
    timeout: 60
  },
  {
    id: 'cm-003',
    name: 'SPARC Master',
    description: 'Execute a complete SPARC workflow for a simple feature',
    commands: [
      'npx claude-flow sparc run specification "Create a user login system"',
      'npx claude-flow sparc run pseudocode "Create a user login system"',
      'npx claude-flow sparc run architect "Create a user login system"',
      'npx claude-flow sparc tdd "Create a user login system"'
    ],
    expectedResults: [
      'Specification complete',
      'Pseudocode generated',
      'Architecture designed',
      'TDD implementation started'
    ],
    validation: (output: string) => output.includes('specification') && output.includes('pseudocode'),
    hints: [
      'Follow the SPARC methodology order',
      'Each phase builds on the previous one',
      'Use quotes around task descriptions'
    ],
    sandbox: false,
    timeout: 120
  }
];

// Bug Hunter Scenarios
export const bugHunterScenarios: BugScenario[] = [
  {
    id: 'bh-001',
    title: 'Swarm Won\'t Initialize',
    description: 'You tried to initialize a swarm but got an error message',
    errorMessage: 'Error: Invalid topology "circle" specified',
    symptoms: [
      'Command fails immediately',
      'No swarm created',
      'Error mentions topology'
    ],
    possibleCauses: [
      'Typo in topology name',
      'Unsupported topology type',
      'Missing MCP server connection',
      'Insufficient permissions'
    ],
    correctSolution: 'Use supported topology: "mesh", "hierarchical", "ring", or "star"',
    incorrectSolutions: [
      'Restart the system',
      'Use sudo permissions',
      'Clear the cache'
    ],
    explanation: 'Claude Flow supports 4 topology types: mesh, hierarchical, ring, and star. "Circle" is not a valid topology.',
    troubleshootingSteps: [
      '1. Check supported topologies in documentation',
      '2. Verify spelling of topology name',
      '3. Use one of: mesh, hierarchical, ring, star',
      '4. Retry the command with correct topology'
    ]
  },
  {
    id: 'bh-002',
    title: 'Agent Spawn Failure',
    description: 'Agents fail to spawn despite successful swarm initialization',
    errorMessage: 'Error: Maximum agent limit reached (5/5)',
    symptoms: [
      'Swarm exists but agents won\'t spawn',
      'Error mentions agent limit',
      'Previous agents still active'
    ],
    possibleCauses: [
      'Hit maximum agent limit',
      'Previous agents not cleaned up',
      'Resource constraints',
      'Configuration issue'
    ],
    correctSolution: 'Increase maxAgents in swarm_init or clean up unused agents',
    incorrectSolutions: [
      'Restart the swarm completely',
      'Change agent types',
      'Use different topology'
    ],
    explanation: 'Each swarm has a maximum agent limit (default 5). Either increase the limit or remove unused agents.',
    troubleshootingSteps: [
      '1. Check current agent count with agent_list',
      '2. Remove unused agents or increase maxAgents',
      '3. Re-initialize swarm with higher limit if needed',
      '4. Monitor resource usage'
    ]
  }
];

// Speed Run Tasks
export const speedRunTasks: SpeedRunTask[] = [
  {
    id: 'sr-001',
    name: 'Quick Start Lightning',
    description: 'Complete the Claude Flow quick start as fast as possible',
    steps: [
      {
        id: 'sr-001-1',
        instruction: 'Add Claude Flow MCP server',
        command: 'claude mcp add claude-flow npx claude-flow@alpha mcp start',
        points: 10
      },
      {
        id: 'sr-001-2', 
        instruction: 'Initialize mesh swarm',
        command: 'mcp__claude-flow__swarm_init { topology: "mesh" }',
        points: 20
      },
      {
        id: 'sr-001-3',
        instruction: 'Spawn a researcher agent',
        command: 'mcp__claude-flow__agent_spawn { type: "researcher" }',
        points: 15
      },
      {
        id: 'sr-001-4',
        instruction: 'Check swarm status',
        command: 'mcp__claude-flow__swarm_status',
        points: 10
      },
      {
        id: 'sr-001-5',
        instruction: 'Orchestrate a simple task',
        command: 'mcp__claude-flow__task_orchestrate { task: "Hello World" }',
        points: 25
      }
    ],
    goldTime: 30,    // 30 seconds for gold
    silverTime: 45,  // 45 seconds for silver
    bronzeTime: 60,  // 60 seconds for bronze
    worldRecord: 23, // Current world record
    validation: (results: any[]) => results.length === 5 && results.every(r => r.success)
  },
  {
    id: 'sr-002',
    name: 'SPARC Sprint',
    description: 'Execute all 5 SPARC phases in record time',
    steps: [
      {
        id: 'sr-002-1',
        instruction: 'Run specification phase',
        command: 'npx claude-flow sparc run specification "Simple calculator"',
        points: 20
      },
      {
        id: 'sr-002-2',
        instruction: 'Generate pseudocode',
        command: 'npx claude-flow sparc run pseudocode "Simple calculator"',
        points: 20
      },
      {
        id: 'sr-002-3',
        instruction: 'Design architecture',
        command: 'npx claude-flow sparc run architect "Simple calculator"',
        points: 20
      },
      {
        id: 'sr-002-4',
        instruction: 'Start TDD refinement',
        command: 'npx claude-flow sparc tdd "Simple calculator"',
        points: 30
      },
      {
        id: 'sr-002-5',
        instruction: 'Complete integration',
        command: 'npx claude-flow sparc run integration "Simple calculator"',
        points: 30
      }
    ],
    goldTime: 90,
    silverTime: 120,
    bronzeTime: 150,
    worldRecord: 78,
    validation: (results: any[]) => results.every(r => r.phase && r.completed)
  }
];

// Easter Eggs
export const easterEggs: EasterEgg[] = [
  {
    id: 'ee-001',
    name: 'The Creator\'s Mark',
    description: 'Find the hidden rUv reference in the wiki',
    location: 'wiki',
    trigger: /rUv|ruv-mode|ruv-tribute/i,
    hint: 'Look for where the creator is honored in achievement categories',
    category: 'ruv-tribute',
    rarity: 'legendary',
    reward: 'rUv God Mode achievement unlocked',
    found: false
  },
  {
    id: 'ee-002',
    name: 'The Answer to Everything',
    description: 'Discover the ultimate truth hidden in the code',
    location: 'code',
    trigger: '42',
    hint: 'How many easter eggs are there to find?',
    category: 'pop-culture',
    rarity: 'rare',
    reward: 'Deep Thought achievement',
    found: false
  },
  {
    id: 'ee-003',
    name: 'Secret Command',
    description: 'Execute the hidden command mentioned in game design',
    location: 'command',
    trigger: 'npx claude-flow --ruvnet',
    hint: 'Check the game design document for special commands',
    category: 'hidden-feature',
    rarity: 'mythic',
    reward: 'Rainbow effects and special abilities',
    found: false
  },
  {
    id: 'ee-004',
    name: 'The Book of Claude',
    description: 'Find the scripture reference in the game design',
    location: 'docs',
    trigger: /Book of Claude|Chapter 1:1/i,
    hint: 'In the beginning was the word... and the word was Flow',
    category: 'developer-joke',
    rarity: 'rare',
    reward: 'Prophet achievement',
    found: false
  },
  {
    id: 'ee-005',
    name: 'Token Optimization Master',
    description: 'Achieve the exact token reduction percentage mentioned',
    location: 'ui',
    trigger: '32.3%',
    hint: 'Try to match the exact performance improvement metric',
    category: 'hidden-feature',
    rarity: 'legendary',
    reward: 'Efficiency Master title',
    found: false
  }
];

// Meme Templates
export const memeTemplates: MemeTemplate[] = [
  {
    id: 'mt-001',
    name: 'Distracted Boyfriend',
    template: 'When you see {AGENT_TYPE} but you\'re already committed to {CURRENT_AGENT}',
    placeholder: ['AGENT_TYPE', 'CURRENT_AGENT'],
    category: 'agents',
    popularityScore: 95,
    viralPotential: 8.5
  },
  {
    id: 'mt-002',
    name: 'Drake Pointing',
    template: 'Single-threaded execution ❌\n\nClaude Flow parallel swarms ✅',
    placeholder: [],
    category: 'performance',
    popularityScore: 87,
    viralPotential: 7.8
  },
  {
    id: 'mt-003',
    name: 'Expanding Brain',
    template: 'Manual coding → Using Claude → Using Claude Flow → {CUSTOM_ACHIEVEMENT}',
    placeholder: ['CUSTOM_ACHIEVEMENT'],
    category: 'sparc',
    popularityScore: 92,
    viralPotential: 9.1
  },
  {
    id: 'mt-004',
    name: 'This Is Fine',
    template: 'When your swarm has 50 agents but topology is still "mesh"',
    placeholder: [],
    category: 'swarm',
    popularityScore: 78,
    viralPotential: 6.9
  },
  {
    id: 'mt-005',
    name: 'Galaxy Brain',
    template: 'Writing code → TDD → SPARC methodology → {NEURAL_PATTERN} neural patterns',
    placeholder: ['NEURAL_PATTERN'],
    category: 'sparc',
    popularityScore: 84,
    viralPotential: 8.2
  }
];

// Main Challenge Collections
export const wikiChallenges: WikiChallenge[] = [
  // Wiki Warrior Challenges
  {
    id: 'ww-trivia-1',
    type: 'wiki-warrior',
    name: 'Claude Flow Basics Quiz',
    description: 'Test your knowledge of fundamental Claude Flow concepts',
    difficulty: 2,
    category: 'knowledge',
    xpReward: 100,
    socialPoints: 50,
    timeLimit: 300, // 5 minutes
    requirements: ['Complete tutorial'],
    hints: ['Review the CLAUDE.md file', 'Focus on SPARC methodology'],
    solution: wikiWarriorQuestions.slice(0, 3),
    socialShareTemplate: {
      title: 'Claude Flow Quiz Master!',
      message: 'Just aced the Claude Flow basics quiz! 🧠⚡ {SCORE}/100 points earned!',
      hashtags: ['#ClaudeFlow', '#AI', '#Programming', '#QuizMaster'],
      template: 'Wiki Warrior Achievement Unlocked! 🏆\n\nScore: {SCORE}%\nTime: {TIME}s\nRank: {RANK}\n\n#ClaudeFlow #WikiWarrior'
    },
    unlockLevel: 1
  },
  
  // Command Master Challenges  
  {
    id: 'cm-basic-1',
    type: 'command-master',
    name: 'Swarm Initialization Master',
    description: 'Master the art of swarm initialization across all topologies',
    difficulty: 3,
    category: 'practical',
    xpReward: 200,
    socialPoints: 75,
    timeLimit: 180,
    requirements: ['Level 2'],
    hints: ['Try all 4 topology types', 'Use MCP tool syntax'],
    solution: commandMasterChallenges[0],
    socialShareTemplate: {
      title: 'Swarm Master!',
      message: 'Successfully orchestrated my first Claude Flow swarm! 🤖✨',
      hashtags: ['#ClaudeFlow', '#SwarmIntelligence', '#AI', '#CommandMaster'],
      template: 'Command Master Achievement! ⚡\n\nCompleted: {CHALLENGE_NAME}\nTime: {TIME}s\nEfficiency: {EFFICIENCY}%\n\n#ClaudeFlow #CommandMaster'
    },
    unlockLevel: 2
  },

  // Bug Hunter Challenges
  {
    id: 'bh-troubleshoot-1',
    type: 'bug-hunter',
    name: 'Swarm Troubleshooter',
    description: 'Diagnose and fix common swarm initialization problems',
    difficulty: 4,
    category: 'practical',
    xpReward: 300,
    socialPoints: 100,
    requirements: ['Complete Command Master basics'],
    hints: ['Check error messages carefully', 'Review supported topologies'],
    solution: bugHunterScenarios[0],
    socialShareTemplate: {
      title: 'Bug Hunter Extraordinaire!',
      message: 'Debugged a gnarly Claude Flow issue like a pro! 🐛🔧',
      hashtags: ['#ClaudeFlow', '#BugHunter', '#Debugging', '#ProblemSolver'],
      template: 'Bug Hunter Victory! 🎯\n\nSolved: {BUG_TYPE}\nTime to Fix: {TIME}s\nDifficulty: {STARS}\n\n#ClaudeFlow #BugHunter'
    },
    unlockLevel: 3
  },

  // Speed Run Challenges
  {
    id: 'sr-quickstart-1',
    type: 'speed-run',
    name: 'Lightning Quick Start',
    description: 'Complete the Claude Flow quick start in record time',
    difficulty: 5,
    category: 'speed',
    xpReward: 500,
    socialPoints: 150,
    timeLimit: 60,
    requirements: ['Master all basic commands'],
    hints: ['Practice the command sequence', 'Use keyboard shortcuts'],
    solution: speedRunTasks[0],
    socialShareTemplate: {
      title: 'Speed Demon!',
      message: 'Completed Claude Flow quick start in {TIME} seconds! ⚡🏃‍♂️',
      hashtags: ['#ClaudeFlow', '#SpeedRun', '#Lightning', '#ProgrammingOlympics'],
      template: 'SPEED RUN RECORD! 🏆⚡\n\nChallenge: {CHALLENGE_NAME}\nTime: {TIME}s\nMedal: {MEDAL}\nWorld Rank: #{RANK}\n\n#ClaudeFlow #SpeedRun'
    },
    unlockLevel: 4
  },

  // Easter Egg Hunt
  {
    id: 'ee-hunt-1',
    type: 'easter-egg-hunt',
    name: 'Hidden Treasures',
    description: 'Find all the hidden references and easter eggs in the Claude Flow wiki',
    difficulty: 3,
    category: 'discovery',
    xpReward: 1000,
    socialPoints: 200,
    requirements: ['Explore all wiki sections'],
    hints: ['Look for unusual references', 'Check achievement categories', 'Try secret commands'],
    solution: easterEggs,
    socialShareTemplate: {
      title: 'Easter Egg Hunter!',
      message: 'Found {COUNT} hidden gems in Claude Flow! 🥚💎 Some legendary finds!',
      hashtags: ['#ClaudeFlow', '#EasterEggHunt', '#HiddenGems', '#SecretFinds'],
      template: 'EASTER EGG DISCOVERY! 🥚✨\n\nFound: {EGG_NAME}\nRarity: {RARITY}\nTotal Found: {COUNT}/42\n\n#ClaudeFlow #EasterEggHunt'
    },
    unlockLevel: 2
  },

  // Meme Lord Challenges
  {
    id: 'ml-viral-1',
    type: 'meme-lord',
    name: 'Viral Content Creator',
    description: 'Create shareable memes using Claude Flow concepts and templates',
    difficulty: 2,
    category: 'creative',
    xpReward: 250,
    socialPoints: 300,
    requirements: ['Unlock meme templates'],
    hints: ['Use trending formats', 'Reference Claude Flow features', 'Make it relatable'],
    solution: memeTemplates,
    socialShareTemplate: {
      title: 'Meme Lord Supreme!',
      message: 'Created viral Claude Flow content! Check out my latest meme! 😂🔥',
      hashtags: ['#ClaudeFlow', '#MemeLord', '#ViralContent', '#ProgrammerHumor'],
      template: 'MEME LORD STATUS ACHIEVED! 👑😂\n\nMeme: {MEME_NAME}\nViral Score: {VIRAL_SCORE}/10\nLikes: {LIKES}\nShares: {SHARES}\n\n#ClaudeFlow #MemeLord'
    },
    unlockLevel: 1
  }
];

// Comprehensive Agent Mastery Challenges
export const agentMasteryChallenges: WikiChallenge[] = [
  {
    id: 'agent-core-dev-master',
    type: 'command-master',
    name: 'Core Development Team Builder',
    description: 'Master all 5 core development agents and create an optimal development team',
    difficulty: 3,
    category: 'practical',
    xpReward: 500,
    socialPoints: 200,
    timeLimit: 600,
    requirements: ['Complete basic swarm setup'],
    hints: [
      'Each core development agent has unique specializations',
      'Consider the complete development lifecycle',
      'Test agent coordination and communication'
    ],
    solution: {
      requiredAgents: ['coder', 'reviewer', 'tester', 'planner', 'researcher'],
      tasks: [
        'Spawn all 5 core development agents',
        'Assign a complex development task requiring all specializations',
        'Demonstrate effective agent coordination',
        'Achieve >90% task completion quality'
      ],
      validation: (result: any) => {
        return result.agentsSpawned >= 5 && 
               result.taskQuality >= 90 && 
               result.coordinationEfficiency >= 80;
      }
    },
    socialShareTemplate: {
      title: 'Core Development Master!',
      message: 'Mastered all 5 core Claude Flow development agents! 🚀 Ready to build anything!',
      hashtags: ['#ClaudeFlow', '#AgentMastery', '#Development', '#TeamBuilder'],
      template: 'AGENT MASTERY ACHIEVED! 🤖\n\nCore Dev Team: {AGENTS}\nTask Quality: {QUALITY}%\nCoordination: {EFFICIENCY}%\n\n#ClaudeFlow #AgentMaster'
    },
    unlockLevel: 3
  },
  {
    id: 'agent-swarm-coord-expert',
    type: 'command-master',
    name: 'Swarm Coordination Expert',
    description: 'Master advanced swarm coordination with hierarchical and mesh topologies',
    difficulty: 4,
    category: 'practical',
    xpReward: 750,
    socialPoints: 300,
    timeLimit: 900,
    requirements: ['Agent Core Dev Master', 'Level 5+'],
    hints: [
      'Hierarchical topology works best for large structured teams',
      'Mesh topology excels at collaborative creative work',
      'Monitor coordination efficiency and resource utilization'
    ],
    solution: {
      challenges: [
        'Create hierarchical swarm with 15+ agents across 3 levels',
        'Create mesh swarm optimized for creative collaboration',
        'Demonstrate topology switching based on task requirements',
        'Achieve >85% efficiency in both topologies'
      ]
    },
    socialShareTemplate: {
      title: 'Swarm Coordination Master!',
      message: 'Mastered advanced swarm topologies! Hierarchical AND mesh coordination expert! 🕸️⚡',
      hashtags: ['#ClaudeFlow', '#SwarmCoordination', '#Topology', '#ScalableAI'],
      template: 'SWARM MASTER UNLOCKED! 🕸️\n\nHierarchical: {HIER_EFFICIENCY}%\nMesh: {MESH_EFFICIENCY}%\nAgents Managed: {TOTAL_AGENTS}\n\n#ClaudeFlow #SwarmMaster'
    },
    unlockLevel: 5
  }
];

// MCP Tool Mastery Challenges
export const mcpToolChallenges: WikiChallenge[] = [
  {
    id: 'mcp-coordination-master',
    type: 'command-master',
    name: 'MCP Coordination Tools Master',
    description: 'Master all coordination MCP tools: swarm_init, agent_spawn, task_orchestrate',
    difficulty: 3,
    category: 'practical',
    xpReward: 400,
    socialPoints: 150,
    timeLimit: 450,
    requirements: ['Basic MCP understanding'],
    hints: [
      'Practice with different topology types',
      'Experiment with various agent combinations',
      'Test different orchestration strategies'
    ],
    solution: {
      tools: ['swarm_init', 'agent_spawn', 'task_orchestrate'],
      proficiency: {
        'swarm_init': 'Initialize all 4 topology types successfully',
        'agent_spawn': 'Spawn agents from at least 6 different categories',
        'task_orchestrate': 'Use all 4 orchestration strategies effectively'
      }
    },
    socialShareTemplate: {
      title: 'MCP Coordination Master!',
      message: 'Mastered all MCP coordination tools! Swarm orchestration expert! 🎯',
      hashtags: ['#ClaudeFlow', '#MCP', '#Coordination', '#ToolMastery'],
      template: 'MCP MASTERY UNLOCKED! 🎯\n\nTools Mastered: {TOOL_COUNT}\nSuccess Rate: {SUCCESS_RATE}%\nTasks Orchestrated: {TASKS}\n\n#ClaudeFlow #MCPMaster'
    },
    unlockLevel: 2
  },
  {
    id: 'mcp-monitoring-expert',
    type: 'command-master',
    name: 'MCP Monitoring Expert',
    description: 'Master comprehensive system monitoring with all MCP monitoring tools',
    difficulty: 4,
    category: 'practical',
    xpReward: 600,
    socialPoints: 200,
    timeLimit: 600,
    requirements: ['MCP Coordination Master', 'Understanding of system metrics'],
    hints: [
      'Learn to interpret swarm status and health metrics',
      'Practice identifying performance bottlenecks',
      'Master agent performance analysis'
    ],
    solution: {
      monitoring_skills: [
        'Real-time swarm health monitoring',
        'Agent performance optimization',
        'Task completion tracking',
        'Resource utilization analysis'
      ],
      success_criteria: {
        'monitoring_accuracy': 90,
        'issue_detection_time': 30, // seconds
        'optimization_improvement': 25 // percent
      }
    },
    socialShareTemplate: {
      title: 'Monitoring Master!',
      message: 'Achieved expert-level system monitoring! No performance issue escapes my watch! 📊',
      hashtags: ['#ClaudeFlow', '#Monitoring', '#Performance', '#SystemExpert'],
      template: 'MONITORING EXPERT! 📊\n\nDetection Speed: {DETECTION_TIME}s\nAccuracy: {ACCURACY}%\nOptimization: +{IMPROVEMENT}%\n\n#ClaudeFlow #MonitoringMaster'
    },
    unlockLevel: 4
  }
];

// SPARC Methodology Challenges
export const sparcChallenges: WikiChallenge[] = [
  {
    id: 'sparc-complete-workflow',
    type: 'wiki-warrior',
    name: 'SPARC Complete Workflow Master',
    description: 'Successfully complete a full SPARC workflow from Specification to Completion',
    difficulty: 5,
    category: 'knowledge',
    xpReward: 1000,
    socialPoints: 400,
    timeLimit: 1800, // 30 minutes
    requirements: ['Understanding of all SPARC phases', 'Project management basics'],
    hints: [
      'Each phase must be completed before moving to the next',
      'Quality gates ensure deliverable completeness',
      'Documentation is crucial for traceability'
    ],
    solution: {
      phases: {
        'specification': {
          deliverables: ['requirements-document', 'acceptance-criteria', 'constraints'],
          quality_gate: 'Stakeholder approval',
          time_allocation: '15%'
        },
        'pseudocode': {
          deliverables: ['algorithm-design', 'logic-flows', 'error-handling'],
          quality_gate: 'Technical review',
          time_allocation: '15%'
        },
        'architecture': {
          deliverables: ['system-design', 'component-specs', 'integration-plan'],
          quality_gate: 'Architecture review',
          time_allocation: '20%'
        },
        'refinement': {
          deliverables: ['tested-implementation', 'quality-metrics', 'user-validation'],
          quality_gate: 'Acceptance criteria met',
          time_allocation: '40%'
        },
        'completion': {
          deliverables: ['production-deployment', 'monitoring', 'documentation'],
          quality_gate: 'Go-live readiness',
          time_allocation: '10%'
        }
      }
    },
    socialShareTemplate: {
      title: 'SPARC Methodology Master!',
      message: 'Completed full SPARC workflow! From Specification to Completion with excellence! 🎯',
      hashtags: ['#ClaudeFlow', '#SPARC', '#Methodology', '#SystemDevelopment'],
      template: 'SPARC MASTER ACHIEVED! 🎯\n\nPhases: 5/5 ✅\nQuality Gates: {GATES_PASSED}\nDelivery Time: {PROJECT_TIME}\n\n#ClaudeFlow #SPARCMaster'
    },
    unlockLevel: 6
  }
];

// Neural Network Training Challenges
export const neuralChallenges: WikiChallenge[] = [
  {
    id: 'neural-pattern-recognition',
    type: 'wiki-warrior',
    name: 'Neural Pattern Recognition Master',
    description: 'Train neural models to recognize coordination patterns with >90% accuracy',
    difficulty: 4,
    category: 'knowledge',
    xpReward: 800,
    socialPoints: 250,
    timeLimit: 900,
    requirements: ['Basic machine learning knowledge', 'Neural features unlocked'],
    hints: [
      'Use diverse training data for better generalization',
      'Monitor for overfitting with validation sets',
      'Experiment with different architectures'
    ],
    solution: {
      neural_objectives: [
        'Pattern recognition accuracy >90%',
        'Training time <10 minutes',
        'Model size <50MB',
        'Inference time <100ms'
      ]
    },
    socialShareTemplate: {
      title: 'Neural Network Master!',
      message: 'Achieved >90% accuracy in AI coordination pattern recognition! 🧠⚡',
      hashtags: ['#ClaudeFlow', '#MachineLearning', '#NeuralNetworks', '#AICoordination'],
      template: 'NEURAL MASTER! 🧠\n\nAccuracy: {ACCURACY}%\nTraining Time: {TRAIN_TIME}m\nInference: {INFERENCE_TIME}ms\n\n#ClaudeFlow #NeuralMaster'
    },
    unlockLevel: 8
  }
];

// Performance Benchmarking Challenges
export const performanceChallenges: WikiChallenge[] = [
  {
    id: 'performance-optimization-expert',
    type: 'speed-run',
    name: 'Performance Optimization Expert',
    description: 'Achieve 2x performance improvement through systematic optimization',
    difficulty: 5,
    category: 'speed',
    xpReward: 1200,
    socialPoints: 500,
    timeLimit: 1200,
    requirements: ['Advanced system knowledge', 'Monitoring expertise'],
    hints: [
      'Start with bottleneck identification',
      'Apply optimization incrementally',
      'Validate improvements with benchmarks'
    ],
    solution: {
      optimization_targets: {
        'throughput': { baseline: 10, target: 20, unit: 'ops/sec' },
        'latency': { baseline: 500, target: 250, unit: 'ms' },
        'resource_usage': { baseline: 80, target: 60, unit: 'percent' }
      }
    },
    socialShareTemplate: {
      title: 'Performance Optimization Master!',
      message: 'Achieved 2x performance improvement! System optimization expert! 🚀',
      hashtags: ['#ClaudeFlow', '#Performance', '#Optimization', '#SystemTuning'],
      template: 'PERFORMANCE MASTER! 🚀\n\nThroughput: +{THROUGHPUT_GAIN}%\nLatency: -{LATENCY_REDUCTION}%\nResource: -{RESOURCE_SAVINGS}%\n\n#ClaudeFlow #PerformanceMaster'
    },
    unlockLevel: 7
  }
];

// Advanced Integration Challenges
export const integrationChallenges: WikiChallenge[] = [
  {
    id: 'github-automation-master',
    type: 'command-master',
    name: 'GitHub Automation Master',
    description: 'Create comprehensive GitHub workflow automation with Claude Flow',
    difficulty: 4,
    category: 'practical',
    xpReward: 900,
    socialPoints: 350,
    timeLimit: 1200,
    requirements: ['GitHub integration knowledge', 'Workflow automation understanding'],
    hints: [
      'Combine multiple GitHub tools for complete automation',
      'Test workflows with different repository scenarios',
      'Include security and quality checks'
    ],
    solution: {
      automation_features: [
        'Automated PR review and approval',
        'Issue triage and labeling',
        'Release coordination across repos',
        'Security scanning integration'
      ]
    },
    socialShareTemplate: {
      title: 'GitHub Automation Master!',
      message: 'Mastered GitHub automation with Claude Flow! Repository management on autopilot! 🔄',
      hashtags: ['#ClaudeFlow', '#GitHub', '#Automation', '#DevOps'],
      template: 'GITHUB AUTOMATION MASTER! 🔄\n\nWorkflows: {WORKFLOW_COUNT}\nRepos Managed: {REPO_COUNT}\nAutomation Level: {AUTO_PERCENT}%\n\n#ClaudeFlow #GitHubMaster'
    },
    unlockLevel: 6
  }
];

// Combine all challenge categories
export const allWikiChallenges: WikiChallenge[] = [
  ...wikiChallenges, // Original challenges
  ...agentMasteryChallenges,
  ...mcpToolChallenges,
  ...sparcChallenges,
  ...neuralChallenges,
  ...performanceChallenges,
  ...integrationChallenges
];

// Challenge Management Functions
export class WikiChallengeManager {
  private completedChallenges: Set<string> = new Set();
  private currentStreak: number = 0;
  private totalScore: number = 0;
  private categoryProgress: Map<string, number> = new Map();

  getChallengesByType(type: WikiChallengeType): WikiChallenge[] {
    return allWikiChallenges.filter(challenge => challenge.type === type);
  }

  getChallengesByLevel(level: number): WikiChallenge[] {
    return allWikiChallenges.filter(challenge => challenge.unlockLevel <= level);
  }

  getChallengesByCategory(category: string): WikiChallenge[] {
    return allWikiChallenges.filter(challenge => challenge.category === category);
  }

  getChallengeById(id: string): WikiChallenge | undefined {
    return allWikiChallenges.find(challenge => challenge.id === id);
  }

  isUnlocked(challenge: WikiChallenge, currentLevel: number): boolean {
    return currentLevel >= challenge.unlockLevel;
  }

  completeChallenge(challengeId: string, score: number, timeSpent: number): {
    xpEarned: number;
    socialPoints: number;
    achievements: string[];
    shareContent: string;
  } {
    const challenge = this.getChallengeById(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    this.completedChallenges.add(challengeId);
    this.currentStreak++;
    this.totalScore += score;

    const achievements: string[] = [];
    
    // Check for special achievements
    if (this.currentStreak >= 5) {
      achievements.push('Streak Master');
    }
    
    if (score >= 95) {
      achievements.push('Perfectionist');
    }

    // Generate social share content
    let shareContent = challenge.socialShareTemplate.template
      .replace('{CHALLENGE_NAME}', challenge.name)
      .replace('{SCORE}', score.toString())
      .replace('{TIME}', timeSpent.toString());

    return {
      xpEarned: challenge.xpReward,
      socialPoints: challenge.socialPoints,
      achievements,
      shareContent
    };
  }

  generateRandomChallenge(level: number, type?: WikiChallengeType, category?: string): WikiChallenge {
    let availableChallenges = this.getChallengesByLevel(level);
    
    if (type) {
      availableChallenges = availableChallenges.filter(c => c.type === type);
    }
    
    if (category) {
      availableChallenges = availableChallenges.filter(c => c.category === category);
    }

    // Filter out completed challenges
    availableChallenges = availableChallenges.filter(
      c => !this.completedChallenges.has(c.id)
    );

    if (availableChallenges.length === 0) {
      // Generate procedural challenge if all completed
      return this.generateProceduralChallenge(level, type);
    }

    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    return availableChallenges[randomIndex];
  }
  
  getRecommendedChallenges(level: number, interests: string[] = [], limit: number = 5): WikiChallenge[] {
    const available = this.getChallengesByLevel(level).filter(
      c => !this.completedChallenges.has(c.id)
    );
    
    // Score challenges based on interests and difficulty appropriateness
    const scored = available.map(challenge => {
      let score = 0;
      
      // Interest match
      if (interests.includes(challenge.category)) score += 3;
      if (interests.includes(challenge.type)) score += 2;
      
      // Difficulty appropriateness
      const difficultyScore = Math.max(0, 3 - Math.abs(challenge.difficulty - Math.min(5, Math.floor(level / 2))));
      score += difficultyScore;
      
      // Variety bonus (prefer different types)
      const completedInType = Array.from(this.completedChallenges)
        .map(id => this.getChallengeById(id))
        .filter(c => c && c.type === challenge.type).length;
      score += Math.max(0, 2 - completedInType);
      
      return { challenge, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.challenge);
  }

  private generateProceduralChallenge(level: number, type?: WikiChallengeType): WikiChallenge {
    // Procedural challenge generation for infinite gameplay
    const challengeTypes: WikiChallengeType[] = type ? [type] : [
      'wiki-warrior', 'command-master', 'bug-hunter', 
      'speed-run', 'easter-egg-hunt', 'meme-lord'
    ];

    const selectedType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    return {
      id: `proc-${Date.now()}`,
      type: selectedType,
      name: `Procedural ${selectedType.replace('-', ' ')} Challenge`,
      description: `A dynamically generated ${selectedType} challenge`,
      difficulty: Math.min(5, Math.max(1, level - 1)) as 1 | 2 | 3 | 4 | 5,
      category: 'practical',
      xpReward: 100 * level,
      socialPoints: 50 * level,
      requirements: [],
      hints: ['Use your experience', 'Think creatively', 'Stay focused'],
      socialShareTemplate: {
        title: 'Procedural Master!',
        message: 'Conquered a procedural challenge! 🎲✨',
        hashtags: ['#ClaudeFlow', '#ProceduralChallenge', '#Infinite'],
        template: 'PROCEDURAL VICTORY! 🎲\n\nType: {TYPE}\nLevel: {LEVEL}\nScore: {SCORE}\n\n#ClaudeFlow #Procedural'
      },
      unlockLevel: level
    };
  }

  getStats() {
    return {
      completed: this.completedChallenges.size,
      totalChallenges: allWikiChallenges.length,
      currentStreak: this.currentStreak,
      totalScore: this.totalScore,
      completionRate: (this.completedChallenges.size / allWikiChallenges.length) * 100,
      categoryBreakdown: this.getCategoryBreakdown()
    };
  }

  private getCategoryBreakdown(): Record<string, { completed: number; total: number }> {
    const breakdown: Record<string, { completed: number; total: number }> = {};
    
    // Initialize categories
    const categories = ['knowledge', 'practical', 'creative', 'speed', 'discovery'];
    categories.forEach(cat => {
      breakdown[cat] = { completed: 0, total: 0 };
    });
    
    // Count challenges by category
    allWikiChallenges.forEach(challenge => {
      breakdown[challenge.category].total++;
      if (this.completedChallenges.has(challenge.id)) {
        breakdown[challenge.category].completed++;
      }
    });
    
    return breakdown;
  }

  exportProgress() {
    return {
      completedChallenges: Array.from(this.completedChallenges),
      currentStreak: this.currentStreak,
      totalScore: this.totalScore,
      timestamp: new Date().toISOString()
    };
  }

  importProgress(data: any) {
    this.completedChallenges = new Set(data.completedChallenges || []);
    this.currentStreak = data.currentStreak || 0;
    this.totalScore = data.totalScore || 0;
  }
}

// Social sharing utilities
export class SocialShareManager {
  generateShareUrl(challenge: WikiChallenge, results: any): string {
    const baseUrl = 'https://claude-flow-game.com/share';
    const params = new URLSearchParams({
      challenge: challenge.id,
      score: results.score.toString(),
      time: results.time.toString(),
      type: challenge.type
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  generateHashtags(challenge: WikiChallenge): string[] {
    const base = ['#ClaudeFlow', '#AI', '#Programming'];
    return [...base, ...challenge.socialShareTemplate.hashtags];
  }

  formatForPlatform(content: string, platform: 'twitter' | 'linkedin' | 'github'): string {
    switch (platform) {
      case 'twitter':
        return content.length > 280 ? content.substring(0, 277) + '...' : content;
      case 'linkedin':
        return content + '\n\nJoin the Claude Flow community and level up your AI development skills!';
      case 'github':
        return `## ${content}\n\nGenerated by Claude Flow: The Ascension game`;
      default:
        return content;
    }
  }
}

export default allWikiChallenges;