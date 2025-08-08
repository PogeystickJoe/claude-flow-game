/**
 * WikiIntegration System - Main exports
 * 
 * A comprehensive system for integrating Claude Flow wiki content into the game,
 * providing dynamic tutorials, trivia, challenges, and achievements.
 */

// Main system class
export { WikiKnowledgeBase } from './WikiKnowledgeBase';

// Core interfaces and types
export * from './interfaces/WikiContent';

// Service classes
export { WikiIntegrationSystem } from './services/WikiIntegrationSystem';
export { AchievementSystem } from './services/AchievementSystem';

// Generator classes
export { TutorialGenerator } from './generators/TutorialGenerator';
export { TriviaGenerator } from './generators/TriviaGenerator';
export { ChallengeGenerator } from './generators/ChallengeGenerator';

// Re-export commonly used enums for convenience
export {
  WikiCategory,
  DifficultyLevel,
  ComplexityLevel,
  TutorialStepType,
  ObjectiveType,
  AchievementCategory,
  AchievementRarity,
  RequirementType,
  RewardType,
  ValidationType
} from './interfaces/WikiContent';

/**
 * Utility function to create a fully configured WikiKnowledgeBase
 */
export async function createWikiKnowledgeBase(wikiData?: Array<{
  id: string;
  markdown: string;
  metadata?: any;
}>): Promise<WikiKnowledgeBase> {
  const kb = new WikiKnowledgeBase();
  
  if (wikiData) {
    await kb.initialize(wikiData);
  } else {
    // Use sample data
    return WikiKnowledgeBase.createWithSampleData();
  }
  
  return kb;
}

/**
 * Quick start configuration for common use cases
 */
export const WikiIntegrationConfig = {
  /**
   * Default configuration for new users
   */
  newUser: {
    startingDifficulty: DifficultyLevel.BEGINNER,
    recommendedCategories: [
      WikiCategory.GETTING_STARTED,
      WikiCategory.BEST_PRACTICES
    ],
    tutorialSettings: {
      learningStyle: 'practical' as const,
      includeQuizzes: true,
      showHints: true
    }
  },

  /**
   * Configuration for advanced users
   */
  advancedUser: {
    startingDifficulty: DifficultyLevel.ADVANCED,
    recommendedCategories: [
      WikiCategory.ADVANCED_FEATURES,
      WikiCategory.NEURAL_FEATURES,
      WikiCategory.PERFORMANCE
    ],
    tutorialSettings: {
      learningStyle: 'theoretical' as const,
      includeQuizzes: false,
      showHints: false
    }
  },

  /**
   * Configuration for gamified learning
   */
  gamified: {
    enableAchievements: true,
    enableTrivia: true,
    enableChallenges: true,
    dailyTriviaCount: 5,
    challengeProgressiveMode: true,
    achievementNotifications: true
  }
};

/**
 * Helper type for wiki integration events
 */
export interface WikiIntegrationEvent {
  type: 'content_read' | 'tutorial_completed' | 'trivia_answered' | 'challenge_solved' | 'achievement_unlocked';
  userId: string;
  data: {
    contentId?: string;
    score?: number;
    timeSpent?: number;
    difficulty?: DifficultyLevel;
    category?: WikiCategory;
    metadata?: Record<string, any>;
  };
  timestamp: Date;
}

/**
 * Event handler type for wiki integration
 */
export type WikiIntegrationEventHandler = (event: WikiIntegrationEvent) => void | Promise<void>;

/**
 * Sample wiki content for testing and development
 */
export const SampleWikiContent = [
  {
    id: 'claude-flow-intro',
    markdown: `
# Introduction to Claude Flow

Claude Flow is a revolutionary system for orchestrating AI agent swarms with unprecedented efficiency and intelligence.

## What Makes Claude Flow Special?

- **Swarm Intelligence**: Coordinate multiple AI agents working in harmony
- **Neural Processing**: Advanced neural networks for pattern recognition and optimization
- **Performance**: Up to 4.4x speed improvements over traditional approaches
- **Flexibility**: Support for multiple topologies and coordination patterns

## Core Concepts

### Agent Coordination
Agents in Claude Flow work together using sophisticated coordination mechanisms:
- Hierarchical coordination for structured tasks
- Mesh networks for peer-to-peer collaboration
- Adaptive topologies that evolve with workload

### SPARC Methodology
Claude Flow implements the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic development.

## Quick Start

\`\`\`bash
# Initialize a swarm
npx claude-flow swarm init --topology mesh --agents 5

# Spawn specialized agents
npx claude-flow agent spawn researcher
npx claude-flow agent spawn coder
npx claude-flow agent spawn tester
\`\`\`

## Benefits

- Reduced development time
- Improved code quality
- Better resource utilization
- Enhanced debugging capabilities
    `,
    metadata: {
      author: 'Claude Flow Team',
      readingTime: 8,
      difficulty: DifficultyLevel.BEGINNER,
      category: WikiCategory.GETTING_STARTED
    }
  },

  {
    id: 'swarm-topologies',
    markdown: `
# Swarm Topologies and Coordination Patterns

Understanding the right topology for your use case is crucial for optimal performance in Claude Flow.

## Available Topologies

### Hierarchical Topology
Best for structured tasks with clear command chains.

\`\`\`typescript
const coordinator = new HierarchicalCoordinator({
  levels: 3,
  maxAgentsPerLevel: 5,
  coordinationStrategy: 'command-and-control'
});
\`\`\`

**Benefits:**
- Clear responsibility chains
- Efficient for complex workflows
- Easy to monitor and debug

**Use Cases:**
- Large software projects
- Multi-stage data processing
- Quality assurance pipelines

### Mesh Topology
Ideal for collaborative problem-solving where agents need to communicate freely.

\`\`\`typescript
const meshSwarm = new MeshTopology({
  communicationMode: 'broadcast',
  consensusAlgorithm: 'byzantine-fault-tolerant'
});
\`\`\`

**Benefits:**
- High fault tolerance
- Parallel processing capabilities
- Dynamic load balancing

**Use Cases:**
- Research and analysis
- Creative problem solving
- Distributed computing

### Ring Topology
Perfect for sequential processing tasks.

**Benefits:**
- Predictable communication patterns
- Low overhead coordination
- Natural flow control

## Performance Considerations

### Choosing the Right Topology

1. **Task Complexity**: Hierarchical for complex, mesh for collaborative
2. **Fault Tolerance**: Mesh provides highest resilience
3. **Communication Overhead**: Ring has lowest overhead
4. **Scalability**: Mesh scales best horizontally

### Optimization Tips

- Monitor agent utilization rates
- Use adaptive topologies when workload varies
- Implement proper error handling and recovery
- Consider network latency in distributed setups

## Real-World Examples

### Software Development Team
A hierarchical topology with:
- Architect (top level)
- Team leads (middle level)  
- Developers, testers, reviewers (bottom level)

### Data Analysis Pipeline
A ring topology for:
1. Data ingestion agent
2. Cleaning agent
3. Analysis agent
4. Visualization agent
5. Reporting agent

### Research Project
A mesh topology allowing:
- Free collaboration between research agents
- Consensus-based decision making
- Parallel hypothesis testing
    `,
    metadata: {
      author: 'Architecture Team',
      readingTime: 12,
      difficulty: DifficultyLevel.INTERMEDIATE,
      category: WikiCategory.SWARM_COORDINATION
    }
  },

  {
    id: 'neural-features',
    markdown: `
# Neural Features and AI Capabilities

Claude Flow leverages advanced neural networks to provide intelligent coordination and optimization.

## Neural Coordination Engine

The neural coordination engine uses machine learning to optimize agent interactions and task distribution.

### Pattern Recognition
The system learns from successful coordination patterns:

\`\`\`python
# Example neural pattern training
coordinator.train_patterns({
  'high_performance_web_scraping': {
    'topology': 'mesh',
    'agent_count': 8,
    'coordination_frequency': 100,
    'success_rate': 0.94
  }
})
\`\`\`

### Adaptive Learning
- Learns from past successes and failures
- Adapts coordination strategies in real-time
- Optimizes resource allocation automatically

## Smart Agent Spawning

The system can automatically determine optimal agent configurations:

### Workload Analysis
- Analyzes task requirements
- Predicts resource needs
- Recommends agent types and quantities

### Performance Prediction
- Estimates completion times
- Identifies potential bottlenecks
- Suggests optimization strategies

## Neural Memory System

### Knowledge Persistence
- Maintains learned patterns across sessions
- Builds organizational knowledge base
- Enables continuous improvement

### Context Awareness
- Understands project context
- Maintains conversation history
- Provides relevant suggestions

## Advanced Features

### Meta-Learning
The system learns how to learn more effectively:
- Identifies successful learning strategies
- Adapts to different problem domains
- Transfers knowledge between projects

### Cognitive Patterns
Supports different thinking patterns:
- **Convergent**: Focus on single optimal solution
- **Divergent**: Generate multiple creative alternatives
- **Lateral**: Explore unconventional approaches
- **Systems**: Consider holistic implications

## Implementation Examples

### Smart Project Setup
\`\`\`bash
# Analyze requirements and auto-configure
npx claude-flow analyze-requirements ./project-spec.md
npx claude-flow auto-configure --optimize-for performance
\`\`\`

### Continuous Optimization
\`\`\`typescript
// Enable neural optimization
const optimizer = new NeuralOptimizer({
  learningRate: 0.01,
  adaptiveThreshold: 0.85,
  optimizationInterval: '5m'
});

swarm.enableOptimization(optimizer);
\`\`\`

## Performance Benefits

- **40% faster** task completion through better coordination
- **60% reduction** in resource waste
- **3x improvement** in first-try success rates
- **Continuous learning** from every interaction

## Best Practices

1. **Enable Learning**: Always enable neural learning features
2. **Provide Feedback**: Rate agent performance to improve learning
3. **Monitor Patterns**: Review learned patterns periodically  
4. **Update Models**: Keep neural models updated with latest training data
    `,
    metadata: {
      author: 'AI Research Team',
      readingTime: 15,
      difficulty: DifficultyLevel.ADVANCED,
      category: WikiCategory.NEURAL_FEATURES
    }
  }
];