/**
 * Wiki-Based Game Challenges for Claude Flow: The Ascension
 * 
 * Six entertaining challenge types based on Claude Flow wiki content:
 * 1. Wiki Warrior - Trivia mastery
 * 2. Command Master - Practical execution
 * 3. Bug Hunter - Troubleshooting skills
 * 4. Speed Run - Quick start mastery
 * 5. Easter Egg Hunt - Hidden reference discovery
 * 6. Meme Lord - Viral content creation
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

// Challenge Management Functions
export class WikiChallengeManager {
  private completedChallenges: Set<string> = new Set();
  private currentStreak: number = 0;
  private totalScore: number = 0;

  getChallengesByType(type: WikiChallengeType): WikiChallenge[] {
    return wikiChallenges.filter(challenge => challenge.type === type);
  }

  getChallengesByLevel(level: number): WikiChallenge[] {
    return wikiChallenges.filter(challenge => challenge.unlockLevel <= level);
  }

  getChallengeById(id: string): WikiChallenge | undefined {
    return wikiChallenges.find(challenge => challenge.id === id);
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

  generateRandomChallenge(level: number, type?: WikiChallengeType): WikiChallenge {
    let availableChallenges = this.getChallengesByLevel(level);
    
    if (type) {
      availableChallenges = availableChallenges.filter(c => c.type === type);
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
      totalChallenges: wikiChallenges.length,
      currentStreak: this.currentStreak,
      totalScore: this.totalScore,
      completionRate: (this.completedChallenges.size / wikiChallenges.length) * 100
    };
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

export default wikiChallenges;