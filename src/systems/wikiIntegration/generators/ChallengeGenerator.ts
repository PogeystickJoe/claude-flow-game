import {
  WikiContent,
  ChallengeScenario,
  ChallengeObjective,
  ObjectiveType,
  DifficultyLevel,
  GameReward,
  RewardType,
  CodeExample
} from '../interfaces/WikiContent';

/**
 * Generates challenge scenarios based on real-world examples from wiki content
 */
export class ChallengeGenerator {
  private challengeIdCounter = 0;
  private objectiveIdCounter = 0;

  /**
   * Generate challenge scenarios from wiki content
   */
  public generateChallenges(
    wikiContent: WikiContent, 
    count: number = 3,
    difficulty?: DifficultyLevel
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];
    const targetDifficulty = difficulty || wikiContent.difficulty;

    // Generate different types of challenges
    challenges.push(...this.generateImplementationChallenges(wikiContent, targetDifficulty));
    challenges.push(...this.generateOptimizationChallenges(wikiContent, targetDifficulty));
    challenges.push(...this.generateDebuggingChallenges(wikiContent, targetDifficulty));
    challenges.push(...this.generateIntegrationChallenges(wikiContent, targetDifficulty));
    challenges.push(...this.generateRealWorldScenarios(wikiContent, targetDifficulty));

    // Sort by relevance and limit to requested count
    const sortedChallenges = challenges.sort((a, b) => 
      this.calculateChallengeRelevance(b, wikiContent) - this.calculateChallengeRelevance(a, wikiContent)
    );

    return sortedChallenges.slice(0, count);
  }

  /**
   * Generate progressive challenge series
   */
  public generateProgressiveSeries(
    wikiContent: WikiContent,
    startDifficulty: DifficultyLevel = DifficultyLevel.BEGINNER
  ): ChallengeScenario[] {
    const difficulties = [
      DifficultyLevel.BEGINNER,
      DifficultyLevel.INTERMEDIATE, 
      DifficultyLevel.ADVANCED,
      DifficultyLevel.EXPERT
    ];

    const startIndex = difficulties.indexOf(startDifficulty);
    const challenges: ChallengeScenario[] = [];

    for (let i = startIndex; i < difficulties.length; i++) {
      const levelChallenges = this.generateChallenges(wikiContent, 2, difficulties[i]);
      challenges.push(...levelChallenges);
    }

    // Link challenges together
    this.linkChallenges(challenges);

    return challenges;
  }

  /**
   * Generate context-aware challenges based on user history
   */
  public generateContextualChallenges(
    wikiContent: WikiContent[],
    userContext: {
      completedChallenges: string[];
      preferredObjectiveTypes: ObjectiveType[];
      skillAreas: string[];
      timePreference: 'short' | 'medium' | 'long';
    }
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];

    // Filter content relevant to user's skill areas
    const relevantContent = wikiContent.filter(content =>
      content.tags.some(tag => userContext.skillAreas.includes(tag)) ||
      userContext.skillAreas.some(skill => content.title.toLowerCase().includes(skill.toLowerCase()))
    );

    // Generate challenges with preferred objective types
    relevantContent.forEach(content => {
      const contentChallenges = this.generateChallenges(content, 2);
      const filtered = contentChallenges.filter(challenge =>
        challenge.objectives.some(obj => userContext.preferredObjectiveTypes.includes(obj.type))
      );
      challenges.push(...filtered);
    });

    // Adjust for time preference
    const timeAdjusted = this.adjustForTimePreference(challenges, userContext.timePreference);

    // Exclude already completed challenges
    return timeAdjusted.filter(challenge => 
      !userContext.completedChallenges.includes(challenge.id)
    );
  }

  /**
   * Generate implementation challenges
   */
  private generateImplementationChallenges(
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];
    
    // Extract implementation opportunities from code examples
    const codeExamples = wikiContent.sections.flatMap(s => s.codeExamples || []);
    
    codeExamples.forEach(example => {
      const scenario = this.createImplementationScenario(example, wikiContent, difficulty);
      if (scenario) {
        challenges.push(scenario);
      }
    });

    // Generate feature implementation challenges
    const features = this.extractFeatures(wikiContent);
    features.forEach(feature => {
      challenges.push(this.createFeatureChallenge(feature, wikiContent, difficulty));
    });

    return challenges;
  }

  /**
   * Generate optimization challenges
   */
  private generateOptimizationChallenges(
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];

    // Performance optimization challenges
    if (this.hasPerformanceContent(wikiContent)) {
      challenges.push({
        id: this.generateChallengeId(),
        title: `Optimize ${wikiContent.title} Performance`,
        description: 'Identify and fix performance bottlenecks in a real-world scenario',
        scenario: this.createPerformanceScenario(wikiContent),
        objectives: this.createPerformanceObjectives(difficulty),
        constraints: this.createPerformanceConstraints(difficulty),
        difficulty,
        estimatedTime: this.calculateEstimatedTime(difficulty, 'optimization'),
        rewards: this.createRewards(difficulty, 'optimization'),
        sourceWikiIds: [wikiContent.id],
        realWorldContext: this.createRealWorldContext(wikiContent, 'performance')
      });
    }

    // Code quality optimization
    challenges.push({
      id: this.generateChallengeId(),
      title: `Refactor ${wikiContent.title} Implementation`,
      description: 'Improve code quality while maintaining functionality',
      scenario: this.createRefactoringScenario(wikiContent),
      objectives: this.createRefactoringObjectives(difficulty),
      constraints: [
        'Must maintain all existing functionality',
        'Improve code readability and maintainability',
        'Follow best practices from the documentation'
      ],
      difficulty,
      estimatedTime: this.calculateEstimatedTime(difficulty, 'refactoring'),
      rewards: this.createRewards(difficulty, 'refactoring'),
      sourceWikiIds: [wikiContent.id],
      realWorldContext: this.createRealWorldContext(wikiContent, 'maintenance')
    });

    return challenges;
  }

  /**
   * Generate debugging challenges
   */
  private generateDebuggingChallenges(
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];
    const codeExamples = wikiContent.sections.flatMap(s => s.codeExamples || []);

    if (codeExamples.length > 0) {
      challenges.push({
        id: this.generateChallengeId(),
        title: `Debug ${wikiContent.title} Issues`,
        description: 'Identify and fix bugs in a production environment',
        scenario: this.createDebuggingScenario(wikiContent, codeExamples[0]),
        objectives: this.createDebuggingObjectives(difficulty),
        constraints: [
          'Cannot modify the core architecture',
          'Must maintain backward compatibility',
          'Fix must be production-ready'
        ],
        difficulty,
        estimatedTime: this.calculateEstimatedTime(difficulty, 'debugging'),
        rewards: this.createRewards(difficulty, 'debugging'),
        sourceWikiIds: [wikiContent.id],
        realWorldContext: this.createRealWorldContext(wikiContent, 'production-issue')
      });
    }

    return challenges;
  }

  /**
   * Generate integration challenges
   */
  private generateIntegrationChallenges(
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];

    // System integration challenges
    challenges.push({
      id: this.generateChallengeId(),
      title: `Integrate ${wikiContent.title} with Existing Systems`,
      description: 'Successfully integrate new technology with legacy systems',
      scenario: this.createIntegrationScenario(wikiContent),
      objectives: this.createIntegrationObjectives(difficulty),
      constraints: [
        'Cannot modify existing system interfaces',
        'Must maintain current performance levels',
        'Integration must be reversible'
      ],
      difficulty,
      estimatedTime: this.calculateEstimatedTime(difficulty, 'integration'),
      rewards: this.createRewards(difficulty, 'integration'),
      sourceWikiIds: [wikiContent.id],
      realWorldContext: this.createRealWorldContext(wikiContent, 'system-integration')
    });

    return challenges;
  }

  /**
   * Generate real-world scenarios
   */
  private generateRealWorldScenarios(
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario[] {
    const challenges: ChallengeScenario[] = [];

    // Extract real-world examples from content
    const realWorldExamples = this.extractRealWorldExamples(wikiContent);
    
    realWorldExamples.forEach(example => {
      challenges.push({
        id: this.generateChallengeId(),
        title: `Real-World: ${example.title}`,
        description: example.description,
        scenario: example.scenario,
        objectives: this.createRealWorldObjectives(example, difficulty),
        constraints: example.constraints,
        difficulty,
        estimatedTime: this.calculateEstimatedTime(difficulty, 'real-world'),
        rewards: this.createRewards(difficulty, 'real-world'),
        sourceWikiIds: [wikiContent.id],
        realWorldContext: example.context
      });
    });

    return challenges;
  }

  // Helper methods for scenario creation

  private createImplementationScenario(
    example: CodeExample,
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario | null {
    if (!example || !example.code) return null;

    return {
      id: this.generateChallengeId(),
      title: `Implement ${example.description}`,
      description: `Build a working implementation based on the ${wikiContent.title} documentation`,
      scenario: `
You are a developer tasked with implementing ${example.description} for a production system.

**Background:**
Your team needs to integrate ${wikiContent.title} into an existing application. The current implementation is basic and needs to be enhanced with the patterns and practices described in the documentation.

**Starting Code:**
\`\`\`${example.language}
${example.code}
\`\`\`

**Your Task:**
Enhance this implementation to be production-ready, following best practices from ${wikiContent.title}.
      `,
      objectives: [
        {
          id: this.generateObjectiveId(),
          description: 'Implement the core functionality',
          type: ObjectiveType.IMPLEMENT,
          target: example.description,
          completed: false,
          points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
        },
        {
          id: this.generateObjectiveId(),
          description: 'Add proper error handling',
          type: ObjectiveType.IMPLEMENT,
          target: 'error_handling',
          completed: false,
          points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
        },
        {
          id: this.generateObjectiveId(),
          description: 'Write unit tests',
          type: ObjectiveType.TEST,
          target: 'unit_tests',
          completed: false,
          points: this.calculateObjectivePoints(difficulty, ObjectiveType.TEST)
        }
      ],
      constraints: [
        'Must follow the patterns described in the documentation',
        'Code must be production-ready',
        'Include proper documentation'
      ],
      difficulty,
      estimatedTime: this.calculateEstimatedTime(difficulty, 'implementation'),
      rewards: this.createRewards(difficulty, 'implementation'),
      sourceWikiIds: [wikiContent.id],
      realWorldContext: `This type of implementation is commonly needed when adopting ${wikiContent.title} in enterprise environments.`
    };
  }

  private createFeatureChallenge(
    feature: string,
    wikiContent: WikiContent,
    difficulty: DifficultyLevel
  ): ChallengeScenario {
    return {
      id: this.generateChallengeId(),
      title: `Build ${feature} Feature`,
      description: `Implement the ${feature} feature using ${wikiContent.title}`,
      scenario: `
You're working on a project that requires implementing ${feature}. The team has decided to use ${wikiContent.title} for this implementation.

**Requirements:**
- Feature must be scalable and maintainable
- Should follow the architectural patterns described in the documentation
- Must include proper testing and documentation
- Should handle edge cases gracefully

**Success Criteria:**
The ${feature} should work seamlessly with the existing system and provide the functionality described in the ${wikiContent.title} documentation.
      `,
      objectives: [
        {
          id: this.generateObjectiveId(),
          description: `Design the ${feature} architecture`,
          type: ObjectiveType.IMPLEMENT,
          target: 'architecture',
          completed: false,
          points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
        },
        {
          id: this.generateObjectiveId(),
          description: `Implement core ${feature} functionality`,
          type: ObjectiveType.IMPLEMENT,
          target: 'core_functionality',
          completed: false,
          points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
        },
        {
          id: this.generateObjectiveId(),
          description: 'Test the implementation',
          type: ObjectiveType.TEST,
          target: 'testing',
          completed: false,
          points: this.calculateObjectivePoints(difficulty, ObjectiveType.TEST)
        }
      ],
      constraints: [
        'Must use patterns from the documentation',
        'Should be backward compatible',
        'Must include monitoring and logging'
      ],
      difficulty,
      estimatedTime: this.calculateEstimatedTime(difficulty, 'feature'),
      rewards: this.createRewards(difficulty, 'feature'),
      sourceWikiIds: [wikiContent.id],
      realWorldContext: `${feature} is a commonly requested feature in modern applications using ${wikiContent.title}.`
    };
  }

  private createPerformanceScenario(wikiContent: WikiContent): string {
    return `
**Performance Crisis Scenario**

Your application using ${wikiContent.title} is experiencing performance issues in production:

- Response times have increased by 300%
- Memory usage is growing continuously
- Users are reporting timeouts
- The system occasionally becomes unresponsive

**Investigation reveals:**
- The current implementation doesn't follow performance best practices
- Some operations are not optimized
- Resource cleanup is incomplete
- Monitoring is insufficient

**Your Mission:**
Use the performance optimization techniques from ${wikiContent.title} documentation to restore the system to acceptable performance levels.
    `;
  }

  private createRefactoringScenario(wikiContent: WikiContent): string {
    return `
**Legacy Code Modernization**

You've inherited a codebase that uses ${wikiContent.title} but was written without following current best practices:

**Issues identified:**
- Code is difficult to understand and maintain
- No consistent patterns or structure
- Limited error handling
- Poor separation of concerns
- Minimal documentation

**Business Requirements:**
- Cannot afford system downtime
- Must maintain all existing functionality
- Need to improve maintainability for future development
- Should follow modern ${wikiContent.title} patterns

**Your Goal:**
Refactor the code to align with best practices while ensuring zero functional regressions.
    `;
  }

  private createDebuggingScenario(wikiContent: WikiContent, example: CodeExample): string {
    return `
**Production Bug Hunt**

A critical bug has been reported in the production system using ${wikiContent.title}:

**Symptoms:**
- Intermittent failures in ${example.description}
- Error logs are unclear
- Issue only occurs under high load
- Affects 15% of user requests

**Code in Question:**
\`\`\`${example.language}
${this.introduceBugs(example.code, 2)}
\`\`\`

**Investigation Notes:**
- Bug wasn't caught in testing
- Seems related to edge cases
- May involve race conditions or resource contention
- Customer escalation is imminent

**Your Challenge:**
Find and fix the bug using debugging techniques and best practices from ${wikiContent.title}.
    `;
  }

  private createIntegrationScenario(wikiContent: WikiContent): string {
    return `
**System Integration Challenge**

Your company is implementing ${wikiContent.title} to work with existing systems:

**Current Architecture:**
- Legacy database system (10+ years old)
- REST API layer (microservices)
- Frontend applications (web and mobile)
- Third-party integrations (payment, auth, analytics)

**Integration Requirements:**
- Must work with existing authentication
- Cannot break current API contracts
- Need gradual rollout capability
- Must maintain data consistency

**Constraints:**
- Limited downtime windows
- Existing team has limited ${wikiContent.title} experience
- Budget constraints on infrastructure changes
- Strict security and compliance requirements

**Success Metrics:**
Seamless integration with zero service interruption and improved system capabilities.
    `;
  }

  // Helper methods for objectives and constraints

  private createPerformanceObjectives(difficulty: DifficultyLevel): ChallengeObjective[] {
    const baseObjectives = [
      {
        id: this.generateObjectiveId(),
        description: 'Identify performance bottlenecks',
        type: ObjectiveType.ANALYZE,
        target: 'bottlenecks',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.ANALYZE)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Implement performance optimizations',
        type: ObjectiveType.OPTIMIZE,
        target: 'performance',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.OPTIMIZE)
      }
    ];

    if (difficulty === DifficultyLevel.ADVANCED || difficulty === DifficultyLevel.EXPERT) {
      baseObjectives.push({
        id: this.generateObjectiveId(),
        description: 'Set up performance monitoring',
        type: ObjectiveType.IMPLEMENT,
        target: 'monitoring',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
      });
    }

    return baseObjectives;
  }

  private createRefactoringObjectives(difficulty: DifficultyLevel): ChallengeObjective[] {
    return [
      {
        id: this.generateObjectiveId(),
        description: 'Improve code structure and organization',
        type: ObjectiveType.OPTIMIZE,
        target: 'structure',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.OPTIMIZE)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Add comprehensive error handling',
        type: ObjectiveType.IMPLEMENT,
        target: 'error_handling',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Create unit tests for refactored code',
        type: ObjectiveType.TEST,
        target: 'unit_tests',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.TEST)
      }
    ];
  }

  private createDebuggingObjectives(difficulty: DifficultyLevel): ChallengeObjective[] {
    return [
      {
        id: this.generateObjectiveId(),
        description: 'Identify the root cause of the bug',
        type: ObjectiveType.DEBUG,
        target: 'root_cause',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.DEBUG)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Fix the bug without breaking existing functionality',
        type: ObjectiveType.DEBUG,
        target: 'fix_bug',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.DEBUG)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Add tests to prevent regression',
        type: ObjectiveType.TEST,
        target: 'regression_tests',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.TEST)
      }
    ];
  }

  private createIntegrationObjectives(difficulty: DifficultyLevel): ChallengeObjective[] {
    return [
      {
        id: this.generateObjectiveId(),
        description: 'Design integration architecture',
        type: ObjectiveType.IMPLEMENT,
        target: 'architecture',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Implement integration layer',
        type: ObjectiveType.INTEGRATE,
        target: 'integration_layer',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.INTEGRATE)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Test integration scenarios',
        type: ObjectiveType.TEST,
        target: 'integration_tests',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.TEST)
      }
    ];
  }

  private createRealWorldObjectives(
    example: any,
    difficulty: DifficultyLevel
  ): ChallengeObjective[] {
    return [
      {
        id: this.generateObjectiveId(),
        description: 'Analyze the real-world requirements',
        type: ObjectiveType.ANALYZE,
        target: 'requirements',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.ANALYZE)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Implement the solution',
        type: ObjectiveType.IMPLEMENT,
        target: 'solution',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.IMPLEMENT)
      },
      {
        id: this.generateObjectiveId(),
        description: 'Validate against real-world constraints',
        type: ObjectiveType.TEST,
        target: 'validation',
        completed: false,
        points: this.calculateObjectivePoints(difficulty, ObjectiveType.TEST)
      }
    ];
  }

  // Utility methods

  private generateChallengeId(): string {
    return `challenge-${++this.challengeIdCounter}`;
  }

  private generateObjectiveId(): string {
    return `objective-${++this.objectiveIdCounter}`;
  }

  private calculateChallengeRelevance(challenge: ChallengeScenario, wikiContent: WikiContent): number {
    let relevance = 0;
    
    // Title relevance
    if (challenge.title.toLowerCase().includes(wikiContent.title.toLowerCase())) {
      relevance += 3;
    }
    
    // Category relevance
    if (challenge.sourceWikiIds.includes(wikiContent.id)) {
      relevance += 5;
    }
    
    // Difficulty match
    if (challenge.difficulty === wikiContent.difficulty) {
      relevance += 2;
    }
    
    return relevance;
  }

  private extractFeatures(wikiContent: WikiContent): string[] {
    const features: string[] = [];
    
    // Extract features from section titles
    wikiContent.sections.forEach(section => {
      if (section.title.length > 5 && section.title.length < 50) {
        features.push(section.title);
      }
    });
    
    // Extract from key points
    const keyPoints = wikiContent.sections.flatMap(s => s.keyPoints);
    keyPoints.forEach(point => {
      const featureMatch = point.match(/implement|create|build|add\s+([^.]+)/i);
      if (featureMatch) {
        features.push(featureMatch[1].trim());
      }
    });
    
    return features.slice(0, 3);
  }

  private hasPerformanceContent(wikiContent: WikiContent): boolean {
    const performanceKeywords = ['performance', 'optimization', 'speed', 'efficiency', 'benchmark'];
    const content = wikiContent.content.toLowerCase();
    
    return performanceKeywords.some(keyword => content.includes(keyword));
  }

  private extractRealWorldExamples(wikiContent: WikiContent): any[] {
    const examples: any[] = [];
    
    // Look for example patterns in content
    const examplePatterns = [
      /example[^.]*:([^.]+)/gi,
      /for instance[^.]*:([^.]+)/gi,
      /use case[^.]*:([^.]+)/gi
    ];
    
    examplePatterns.forEach(pattern => {
      const matches = wikiContent.content.match(pattern);
      if (matches) {
        matches.forEach((match, index) => {
          examples.push({
            title: `Example ${index + 1}`,
            description: match.trim(),
            scenario: `Real-world scenario based on: ${match.trim()}`,
            constraints: ['Must be production-ready', 'Follow best practices'],
            context: `This example is commonly encountered when working with ${wikiContent.title}`
          });
        });
      }
    });
    
    return examples.slice(0, 2);
  }

  private calculateEstimatedTime(difficulty: DifficultyLevel, type: string): number {
    const baseTimes = {
      [DifficultyLevel.BEGINNER]: 30,
      [DifficultyLevel.INTERMEDIATE]: 60,
      [DifficultyLevel.ADVANCED]: 120,
      [DifficultyLevel.EXPERT]: 180
    };
    
    const typeMultipliers = {
      'implementation': 1.5,
      'optimization': 2.0,
      'debugging': 1.2,
      'integration': 2.5,
      'real-world': 1.8,
      'refactoring': 1.3,
      'feature': 2.0
    };
    
    return Math.round(baseTimes[difficulty] * (typeMultipliers[type] || 1));
  }

  private calculateObjectivePoints(difficulty: DifficultyLevel, type: ObjectiveType): number {
    const basePoints = {
      [DifficultyLevel.BEGINNER]: 100,
      [DifficultyLevel.INTERMEDIATE]: 200,
      [DifficultyLevel.ADVANCED]: 350,
      [DifficultyLevel.EXPERT]: 500
    };
    
    const typeMultipliers = {
      [ObjectiveType.IMPLEMENT]: 1.0,
      [ObjectiveType.OPTIMIZE]: 1.3,
      [ObjectiveType.DEBUG]: 1.5,
      [ObjectiveType.INTEGRATE]: 1.4,
      [ObjectiveType.ANALYZE]: 0.8,
      [ObjectiveType.TEST]: 1.1
    };
    
    return Math.round(basePoints[difficulty] * typeMultipliers[type]);
  }

  private createRewards(difficulty: DifficultyLevel, type: string): GameReward[] {
    const baseRewards: GameReward[] = [
      {
        type: RewardType.EXPERIENCE,
        value: this.calculateExperienceReward(difficulty, type),
        description: 'Experience points for challenge completion'
      }
    ];
    
    // Add bonus rewards for higher difficulties
    if (difficulty === DifficultyLevel.ADVANCED || difficulty === DifficultyLevel.EXPERT) {
      baseRewards.push({
        type: RewardType.COINS,
        value: Math.round(baseRewards[0].value * 0.1),
        description: 'Bonus coins for advanced challenge'
      });
    }
    
    if (difficulty === DifficultyLevel.EXPERT) {
      baseRewards.push({
        type: RewardType.BADGE,
        value: 1,
        description: `Expert ${type} badge`,
        icon: `expert-${type}-badge`
      });
    }
    
    return baseRewards;
  }

  private calculateExperienceReward(difficulty: DifficultyLevel, type: string): number {
    const baseXP = {
      [DifficultyLevel.BEGINNER]: 500,
      [DifficultyLevel.INTERMEDIATE]: 1000,
      [DifficultyLevel.ADVANCED]: 2000,
      [DifficultyLevel.EXPERT]: 3500
    };
    
    const typeMultiplier = {
      'implementation': 1.0,
      'optimization': 1.4,
      'debugging': 1.6,
      'integration': 1.5,
      'real-world': 1.3,
      'refactoring': 1.1,
      'feature': 1.2
    };
    
    return Math.round(baseXP[difficulty] * (typeMultiplier[type] || 1));
  }

  private createRealWorldContext(wikiContent: WikiContent, scenario: string): string {
    const contexts = {
      'performance': `Performance optimization is critical in production environments using ${wikiContent.title}.`,
      'maintenance': `Code maintenance and refactoring are ongoing needs in ${wikiContent.title} projects.`,
      'production-issue': `Production issues require quick diagnosis and resolution skills with ${wikiContent.title}.`,
      'system-integration': `Integration challenges are common when adopting ${wikiContent.title} in enterprise environments.`
    };
    
    return contexts[scenario] || `This scenario reflects real-world usage of ${wikiContent.title}.`;
  }

  private createPerformanceConstraints(difficulty: DifficultyLevel): string[] {
    const baseConstraints = [
      'Cannot take system offline',
      'Must maintain current functionality',
      'Limited budget for infrastructure changes'
    ];
    
    if (difficulty === DifficultyLevel.ADVANCED || difficulty === DifficultyLevel.EXPERT) {
      baseConstraints.push(
        'Must achieve 90% performance improvement',
        'Solution must be scalable to 10x current load'
      );
    }
    
    return baseConstraints;
  }

  private introduceBugs(code: string, bugCount: number): string {
    let buggyCode = code;
    const bugs = [
      // Missing null checks
      (c) => c.replace(/if\s*\(([^)]+)\)/, 'if ($1 && $1.isValid())'),
      // Race conditions
      (c) => c.replace(/async\s+/, ''),
      // Resource leaks
      (c) => c.replace(/\.close\(\)/, '// .close() - TODO: fix resource leak'),
      // Off-by-one errors
      (c) => c.replace(/< length/g, '<= length'),
      // Wrong variable names
      (c) => c.replace(/\bindex\b/g, 'indx')
    ];
    
    for (let i = 0; i < Math.min(bugCount, bugs.length); i++) {
      buggyCode = bugs[i](buggyCode);
    }
    
    return buggyCode;
  }

  private linkChallenges(challenges: ChallengeScenario[]): void {
    // Add progression links between challenges
    for (let i = 0; i < challenges.length - 1; i++) {
      const current = challenges[i];
      const next = challenges[i + 1];
      
      // Add unlock condition
      current.rewards.push({
        type: RewardType.UNLOCK_CONTENT,
        value: 1,
        description: `Unlocks: ${next.title}`,
        icon: 'unlock-challenge'
      });
    }
  }

  private adjustForTimePreference(
    challenges: ChallengeScenario[],
    preference: 'short' | 'medium' | 'long'
  ): ChallengeScenario[] {
    const timeRanges = {
      'short': [0, 60],
      'medium': [30, 120], 
      'long': [90, 300]
    };
    
    const [minTime, maxTime] = timeRanges[preference];
    
    return challenges.filter(challenge => 
      challenge.estimatedTime >= minTime && challenge.estimatedTime <= maxTime
    );
  }
}