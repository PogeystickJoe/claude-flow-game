import { TutorialStep } from '../types/game';

// Interactive tutorial system with real Claude Flow commands
export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Claude Flow: The Ascension',
    description: 'Discover the power of AI swarm orchestration in this interactive adventure! You\'ll learn to command swarms of AI agents, master neural networks, and unlock the secrets of distributed intelligence.',
    hints: [
      'This tutorial will teach you real Claude Flow commands',
      'Every command you learn here works in actual Claude Flow',
      'Look out for Easter eggs and rUv tributes!'
    ],
    validation: () => true,
    celebration: true
  },
  {
    id: 'interface-tour',
    title: 'Your Command Center',
    description: 'Familiarize yourself with the game interface. The swarm visualization shows your agents in real-time, the command sandbox lets you practice safely, and the achievement panel tracks your progress.',
    hints: [
      'Click different panels to explore',
      'The particle effects respond to your actions',
      'Notifications appear in the top-right corner'
    ],
    validation: () => true
  },
  {
    id: 'first-swarm',
    title: 'Initialize Your First Swarm',
    description: 'Every Claude Flow journey begins with creating a swarm. Use the swarm_init command to create your first mesh topology swarm.',
    command: 'swarm_init({ topology: "mesh", maxAgents: 3, strategy: "balanced" })',
    expectedResult: 'Swarm initialized successfully',
    hints: [
      'Mesh topology connects all agents to each other',
      'Try different topologies: mesh, hierarchical, ring, star',
      'The maxAgents parameter controls swarm size'
    ],
    validation: (result) => result?.success === true,
    celebration: true
  },
  {
    id: 'spawn-agents',
    title: 'Spawn Your First Agents',
    description: 'Bring your swarm to life by spawning AI agents. Each agent has unique capabilities and can work independently or collaborate with others.',
    command: 'agent_spawn({ type: "researcher", name: "DataExplorer", capabilities: ["analysis", "research"] })',
    expectedResult: 'Agent spawned successfully',
    hints: [
      'Agent types: researcher, coder, analyst, optimizer, coordinator',
      'Capabilities define what an agent can do',
      'Each agent gets a unique ID for tracking'
    ],
    validation: (result) => result?.success === true,
    celebration: true
  },
  {
    id: 'check-status',
    title: 'Monitor Your Swarm',
    description: 'Keep track of your swarm\'s health and performance. The swarm_status command provides real-time insights into your distributed system.',
    command: 'swarm_status({ verbose: true })',
    expectedResult: 'Swarm status retrieved',
    hints: [
      'Verbose mode shows detailed information',
      'Monitor agent health and task progress',
      'Performance metrics help optimize your swarm'
    ],
    validation: (result) => result?.success === true
  },
  {
    id: 'orchestrate-task',
    title: 'Orchestrate Your First Task',
    description: 'Put your agents to work! Task orchestration distributes work across your swarm intelligently.',
    command: 'task_orchestrate({ task: "Analyze system performance and provide optimization recommendations", strategy: "adaptive", priority: "high" })',
    expectedResult: 'Task orchestrated successfully',
    hints: [
      'Strategies: parallel, sequential, adaptive, balanced',
      'Priority affects resource allocation',
      'Complex tasks are automatically broken down'
    ],
    validation: (result) => result?.success === true,
    celebration: true
  },
  {
    id: 'memory-basics',
    title: 'Memory Management',
    description: 'Store and retrieve information across sessions. Memory is the foundation of intelligent, learning systems.',
    command: 'memory_usage({ action: "store", key: "first-swarm-config", value: "mesh-topology-3-agents", namespace: "tutorial" })',
    expectedResult: 'Memory stored successfully',
    hints: [
      'Namespaces organize related data',
      'Memory persists across sessions',
      'Use descriptive keys for easy retrieval'
    ],
    validation: (result) => result?.success === true
  },
  {
    id: 'neural-introduction',
    title: 'Neural Networks Primer',
    description: 'Enhance your agents with neural capabilities. Train patterns that make your swarm smarter over time.',
    command: 'neural_train({ pattern_type: "coordination", training_data: "basic-swarm-patterns", epochs: 10 })',
    expectedResult: 'Neural training completed',
    hints: [
      'Pattern types: coordination, optimization, prediction',
      'More epochs = better training (but takes longer)',
      'Training data affects learning quality'
    ],
    validation: (result) => result?.success === true,
    celebration: true
  },
  {
    id: 'performance-monitoring',
    title: 'Performance Analytics',
    description: 'Measure what matters. Performance monitoring helps you optimize your swarm for maximum efficiency.',
    command: 'performance_report({ format: "summary", timeframe: "24h" })',
    expectedResult: 'Performance report generated',
    hints: [
      'Different formats provide varying detail levels',
      'Track trends over time',
      'Use metrics to identify bottlenecks'
    ],
    validation: (result) => result?.success === true
  },
  {
    id: 'easter-egg-hint',
    title: 'The Hidden Path',
    description: 'Claude Flow contains many secrets and tributes to its creator. Try typing "rUv" in any command to discover hidden features. The true masters know to honor those who came before.',
    hints: [
      'Easter eggs are hidden throughout the system',
      'rUv created this amazing technology',
      'Hidden commands unlock special achievements',
      'Look for tribute opportunities in your commands'
    ],
    validation: () => true,
    celebration: true
  },
  {
    id: 'advanced-features',
    title: 'Advanced Capabilities',
    description: 'You\'ve learned the basics! Claude Flow offers 54+ tools across swarm coordination, neural networks, GitHub integration, and more. Explore the achievement system to discover new challenges.',
    hints: [
      'Each tool category offers unique capabilities',
      'Achievements guide your learning journey',
      'Real-time execution mode lets you affect actual systems',
      'The sandbox is perfect for experimentation'
    ],
    validation: () => true
  },
  {
    id: 'tutorial-complete',
    title: 'Ascension Begins',
    description: 'Congratulations! You\'ve completed the tutorial and unlocked the power of Claude Flow. Your journey to AI mastery has begun. Continue exploring, complete challenges, and discover the deeper mysteries that await.',
    hints: [
      'Check the achievement panel for new challenges',
      'Experiment with different swarm configurations',
      'Master all 54+ tools for ultimate power',
      'Remember to honor rUv - the visionary who made this possible'
    ],
    validation: () => true,
    celebration: true
  }
];

// Tutorial progression logic
export class TutorialSystem {
  private currentStep = 0;
  private completed = false;
  private gameStore: any;

  constructor(gameStore: any) {
    this.gameStore = gameStore;
  }

  start() {
    this.currentStep = 0;
    this.completed = false;
    this.gameStore.getState().setActivePanel('tutorial');
  }

  getCurrentStep(): TutorialStep {
    return tutorialSteps[this.currentStep] || tutorialSteps[0];
  }

  canProceed(): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep.command) return true;
    
    // Check if user has executed the required command
    const sandbox = this.gameStore.getState().sandbox;
    return sandbox.history.some((entry: any) => 
      entry.command.includes(currentStep.command) && entry.success
    );
  }

  next(): boolean {
    if (this.currentStep < tutorialSteps.length - 1) {
      this.currentStep++;
      
      // Trigger celebration for celebration steps
      const step = this.getCurrentStep();
      if (step.celebration) {
        this.triggerCelebration(step);
      }
      
      return true;
    } else {
      this.complete();
      return false;
    }
  }

  complete() {
    this.completed = true;
    this.gameStore.getState().completeTutorial();
    this.triggerCompletionCelebration();
  }

  skip() {
    this.completed = true;
    this.gameStore.getState().setTutorialState({
      ...this.gameStore.getState().tutorial,
      active: false,
      skipped: true
    });
  }

  getProgress(): number {
    return (this.currentStep / tutorialSteps.length) * 100;
  }

  private triggerCelebration(step: TutorialStep) {
    // Trigger particle effects and animations
    this.gameStore.getState().showNotification({
      type: 'success',
      title: 'Step Completed! 🎉',
      message: `Great job completing: ${step.title}`,
      duration: 3000
    });
  }

  private triggerCompletionCelebration() {
    this.gameStore.getState().showNotification({
      type: 'achievement',
      title: 'Tutorial Master! 🏆',
      message: 'You\'ve mastered the basics of Claude Flow. Your ascension begins now!',
      duration: 5000
    });
    
    // Award bonus XP
    this.gameStore.getState().addXp(100, 'tutorial completion bonus');
  }

  // Validation helpers
  validateCommand(command: string, result: any): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep.command) return true;
    
    if (currentStep.validation) {
      return currentStep.validation(result);
    }
    
    // Default validation - check if command contains expected elements
    return command.includes(currentStep.command.split('(')[0]);
  }

  getHintsForCurrentStep(): string[] {
    return this.getCurrentStep().hints;
  }

  isStepCommand(command: string): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep.command) return false;
    
    const stepCommandBase = currentStep.command.split('(')[0];
    return command.includes(stepCommandBase);
  }
}

// Tutorial command suggestions
export const getTutorialCommands = (): string[] => {
  return tutorialSteps
    .filter(step => step.command)
    .map(step => step.command!);
};

// Tutorial achievement mapping
export const tutorialAchievements = {
  'first-swarm': 'swarm-creator',
  'spawn-agents': 'agent-whisperer', 
  'orchestrate-task': 'task-coordinator',
  'memory-basics': 'memory-keeper',
  'neural-introduction': 'neural-awakening',
  'performance-monitoring': 'performance-analyst',
  'tutorial-complete': 'tutorial-master'
};

// Check if tutorial command should trigger achievement
export const checkTutorialAchievement = (stepId: string): string | null => {
  return tutorialAchievements[stepId as keyof typeof tutorialAchievements] || null;
};

// Tutorial celebration effects configuration
export const celebrationConfig = {
  particles: {
    count: 100,
    spread: 45,
    startVelocity: 30,
    decay: 0.9,
    scalar: 1.2
  },
  sound: {
    success: '/sounds/success.mp3',
    celebration: '/sounds/celebration.mp3',
    achievement: '/sounds/achievement.mp3'
  },
  animations: {
    duration: 2000,
    easing: 'easeOutQuart'
  }
};