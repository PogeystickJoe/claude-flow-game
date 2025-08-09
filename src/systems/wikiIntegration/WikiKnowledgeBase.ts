import {
  WikiContent,
  WikiSearchResult,
  TutorialStep,
  TriviaQuestion,
  ChallengeScenario,
  WikiAchievement,
  LearningPath,
  DifficultyLevel,
  WikiCategory
} from './interfaces/WikiContent';

import { WikiIntegrationSystem } from './services/WikiIntegrationSystem';
import { TutorialGenerator } from './generators/TutorialGenerator';
import { TriviaGenerator } from './generators/TriviaGenerator';
import { ChallengeGenerator } from './generators/ChallengeGenerator';
import { AchievementSystem } from './services/AchievementSystem';

/**
 * Main WikiKnowledgeBase system that orchestrates all wiki integration components
 */
export class WikiKnowledgeBase {
  private integrationSystem: WikiIntegrationSystem;
  private tutorialGenerator: TutorialGenerator;
  private triviaGenerator: TriviaGenerator;
  private challengeGenerator: ChallengeGenerator;
  private achievementSystem: AchievementSystem;
  
  private isInitialized = false;

  constructor() {
    this.integrationSystem = new WikiIntegrationSystem();
    this.tutorialGenerator = new TutorialGenerator();
    this.triviaGenerator = new TriviaGenerator();
    this.challengeGenerator = new ChallengeGenerator();
    this.achievementSystem = new AchievementSystem();
  }

  /**
   * Initialize the knowledge base with wiki content
   */
  public async initialize(wikiData: Array<{
    id: string;
    markdown: string;
    metadata?: any;
  }>): Promise<void> {
    console.log('Initializing WikiKnowledgeBase...');

    // Process all wiki content
    const processedContent: WikiContent[] = [];
    
    for (const data of wikiData) {
      try {
        const processed = this.integrationSystem.processWikiMarkdown(
          data.id,
          data.markdown,
          data.metadata
        );
        processedContent.push(processed);
        console.log(`Processed wiki content: ${processed.title}`);
      } catch (error) {
        console.error(`Error processing wiki content ${data.id}:`, error);
      }
    }

    // Generate achievements based on processed content
    const achievements = this.achievementSystem.generateWikiAchievements(processedContent);
    console.log(`Generated ${achievements.length} achievements`);

    this.isInitialized = true;
    console.log('WikiKnowledgeBase initialization complete');
  }

  /**
   * Add new wiki content to the system
   */
  public addWikiContent(id: string, markdown: string, metadata?: any): WikiContent {
    const processed = this.integrationSystem.processWikiMarkdown(id, markdown, metadata);
    
    // Update achievements with new content
    this.achievementSystem.generateWikiAchievements([processed]);
    
    return processed;
  }

  /**
   * Search wiki content
   */
  public searchWiki(
    query: string,
    filters: {
      category?: WikiCategory;
      difficulty?: DifficultyLevel;
      tags?: string[];
    } = {}
  ): WikiSearchResult[] {
    this.ensureInitialized();
    return this.integrationSystem.searchContent(query, filters);
  }

  /**
   * Get wiki content by ID
   */
  public getWikiContent(id: string): WikiContent | undefined {
    this.ensureInitialized();
    return this.integrationSystem.getContentById(id);
  }

  /**
   * Get all wiki content by category
   */
  public getWikiByCategory(category: WikiCategory): WikiContent[] {
    this.ensureInitialized();
    return this.integrationSystem.getContentByCategory(category);
  }

  /**
   * Get all available categories
   */
  public getCategories(): WikiCategory[] {
    return this.integrationSystem.getCategories();
  }

  /**
   * Get content statistics
   */
  public getContentStats(): {
    total: number;
    byCategory: Record<WikiCategory, number>;
    byDifficulty: Record<DifficultyLevel, number>;
  } {
    this.ensureInitialized();
    return this.integrationSystem.getContentStats();
  }

  // Tutorial Generation

  /**
   * Generate tutorial from wiki content
   */
  public generateTutorial(wikiContentId: string): TutorialStep[] {
    this.ensureInitialized();
    const content = this.integrationSystem.getContentById(wikiContentId);
    
    if (!content) {
      throw new Error(`Wiki content not found: ${wikiContentId}`);
    }

    return this.tutorialGenerator.generateTutorial(content);
  }

  /**
   * Generate adaptive tutorial based on user preferences
   */
  public generateAdaptiveTutorial(
    wikiContentId: string,
    userProgress: {
      completedTopics: string[];
      preferredLearningStyle: 'visual' | 'practical' | 'theoretical';
      skillLevel: DifficultyLevel;
    }
  ): TutorialStep[] {
    this.ensureInitialized();
    const content = this.integrationSystem.getContentById(wikiContentId);
    
    if (!content) {
      throw new Error(`Wiki content not found: ${wikiContentId}`);
    }

    return this.tutorialGenerator.generateAdaptiveTutorial(content, userProgress);
  }

  /**
   * Generate micro-tutorial for specific concept
   */
  public generateMicroTutorial(concept: string, wikiContentId?: string): TutorialStep[] {
    this.ensureInitialized();
    
    let content: WikiContent;
    
    if (wikiContentId) {
      content = this.integrationSystem.getContentById(wikiContentId);
      if (!content) {
        throw new Error(`Wiki content not found: ${wikiContentId}`);
      }
    } else {
      // Find relevant content for the concept
      const searchResults = this.integrationSystem.searchContent(concept);
      if (searchResults.length === 0) {
        throw new Error(`No content found for concept: ${concept}`);
      }
      content = searchResults[0].content;
    }

    return this.tutorialGenerator.generateMicroTutorial(concept, content);
  }

  // Trivia Generation

  /**
   * Generate trivia questions from wiki content
   */
  public generateTrivia(
    wikiContentId: string,
    count: number = 5,
    difficulty?: DifficultyLevel
  ): TriviaQuestion[] {
    this.ensureInitialized();
    const content = this.integrationSystem.getContentById(wikiContentId);
    
    if (!content) {
      throw new Error(`Wiki content not found: ${wikiContentId}`);
    }

    return this.triviaGenerator.generateTriviaSet(content, count, difficulty);
  }

  /**
   * Generate daily trivia challenge
   */
  public generateDailyTrivia(playerLevel: DifficultyLevel = DifficultyLevel.INTERMEDIATE): TriviaQuestion[] {
    this.ensureInitialized();
    const allContent = this.integrationSystem.getAllContent();
    return this.triviaGenerator.generateDailyTrivia(allContent, playerLevel);
  }

  /**
   * Generate adaptive trivia based on player performance
   */
  public generateAdaptiveTrivia(playerStats: {
    correctAnswers: number;
    totalAnswers: number;
    weakCategories: WikiCategory[];
    averageTime: number;
  }): TriviaQuestion[] {
    this.ensureInitialized();
    const allContent = this.integrationSystem.getAllContent();
    return this.triviaGenerator.generateAdaptiveTrivia(allContent, playerStats);
  }

  // Challenge Generation

  /**
   * Generate challenge scenarios from wiki content
   */
  public generateChallenges(
    wikiContentId: string,
    count: number = 3,
    difficulty?: DifficultyLevel
  ): ChallengeScenario[] {
    this.ensureInitialized();
    const content = this.integrationSystem.getContentById(wikiContentId);
    
    if (!content) {
      throw new Error(`Wiki content not found: ${wikiContentId}`);
    }

    return this.challengeGenerator.generateChallenges(content, count, difficulty);
  }

  /**
   * Generate progressive challenge series
   */
  public generateProgressiveChallenges(
    wikiContentId: string,
    startDifficulty: DifficultyLevel = DifficultyLevel.BEGINNER
  ): ChallengeScenario[] {
    this.ensureInitialized();
    const content = this.integrationSystem.getContentById(wikiContentId);
    
    if (!content) {
      throw new Error(`Wiki content not found: ${wikiContentId}`);
    }

    return this.challengeGenerator.generateProgressiveSeries(content, startDifficulty);
  }

  /**
   * Generate contextual challenges based on user history
   */
  public generateContextualChallenges(userContext: {
    completedChallenges: string[];
    preferredObjectiveTypes: any[];
    skillAreas: string[];
    timePreference: 'short' | 'medium' | 'long';
  }): ChallengeScenario[] {
    this.ensureInitialized();
    const allContent = this.integrationSystem.getAllContent();
    return this.challengeGenerator.generateContextualChallenges(allContent, userContext);
  }

  // Achievement System

  /**
   * Check and award achievements for user action
   */
  public checkAchievements(
    userId: string,
    action: {
      type: 'read_wiki' | 'complete_tutorial' | 'answer_trivia' | 'solve_challenge' | 'discover_secret';
      data: any;
    }
  ): WikiAchievement[] {
    this.ensureInitialized();
    return this.achievementSystem.checkAchievements(userId, action);
  }

  /**
   * Get user's achievement progress
   */
  public getUserAchievementProgress(userId: string): any {
    this.ensureInitialized();
    return this.achievementSystem.getUserAchievementProgress(userId);
  }

  /**
   * Get achievements that are close to being unlocked
   */
  public getAlmostUnlockedAchievements(userId: string): any[] {
    this.ensureInitialized();
    return this.achievementSystem.getAlmostUnlockedAchievements(userId);
  }

  /**
   * Get discoverable secret achievements
   */
  public getDiscoverableSecrets(userId: string): WikiAchievement[] {
    this.ensureInitialized();
    return this.achievementSystem.getDiscoverableSecrets(userId);
  }

  /**
   * Get all achievements
   */
  public getAllAchievements(): WikiAchievement[] {
    this.ensureInitialized();
    return this.achievementSystem.getAllAchievements();
  }

  // Learning Paths

  /**
   * Generate learning path based on difficulty progression
   */
  public generateLearningPath(
    startLevel: DifficultyLevel,
    category?: WikiCategory
  ): LearningPath {
    this.ensureInitialized();
    return this.integrationSystem.generateLearningPath(startLevel, category);
  }

  /**
   * Get recommended learning paths for user
   */
  public getRecommendedLearningPaths(userProfile: {
    currentLevel: DifficultyLevel;
    interests: WikiCategory[];
    completedContent: string[];
  }): LearningPath[] {
    this.ensureInitialized();
    const paths: LearningPath[] = [];

    // Generate paths for user's interests
    userProfile.interests.forEach(category => {
      const path = this.integrationSystem.generateLearningPath(userProfile.currentLevel, category);
      
      // Filter out already completed content
      path.wikiContentIds = path.wikiContentIds.filter(id => 
        !userProfile.completedContent.includes(id)
      );
      
      if (path.wikiContentIds.length > 0) {
        paths.push(path);
      }
    });

    // Add general path if no specific interests
    if (paths.length === 0) {
      paths.push(this.integrationSystem.generateLearningPath(userProfile.currentLevel));
    }

    return paths;
  }

  // Utility Methods

  /**
   * Get random wiki fact for display
   */
  public getRandomWikiFact(): { fact: string; source: WikiContent } | null {
    this.ensureInitialized();
    const allContent = this.integrationSystem.getAllContent();
    
    if (allContent.length === 0) return null;

    const randomContent = allContent[Math.floor(Math.random() * allContent.length)];
    const facts = this.extractFacts(randomContent);
    
    if (facts.length === 0) return null;

    return {
      fact: facts[Math.floor(Math.random() * facts.length)],
      source: randomContent
    };
  }

  /**
   * Get content recommendations based on reading history
   */
  public getContentRecommendations(
    userId: string,
    count: number = 5
  ): WikiContent[] {
    this.ensureInitialized();
    const userProgress = this.achievementSystem.getUserStats(userId);
    
    if (!userProgress.wikiReads || userProgress.wikiReads.length === 0) {
      // New user - recommend beginner content
      return this.integrationSystem.getAllContent()
        .filter(content => content.difficulty === DifficultyLevel.BEGINNER)
        .slice(0, count);
    }

    // Analyze user's reading patterns
    const readContent = userProgress.wikiReads.map(id => 
      this.integrationSystem.getContentById(id)
    ).filter(Boolean);

    // Find preferred categories and difficulty
    const categoryPrefs = this.analyzeUserPreferences(readContent);
    const recommendations: WikiContent[] = [];

    // Get recommendations from preferred categories
    Object.keys(categoryPrefs)
      .sort((a, b) => categoryPrefs[b] - categoryPrefs[a])
      .forEach(category => {
        const categoryContent = this.integrationSystem.getContentByCategory(category as WikiCategory)
          .filter(content => !userProgress.wikiReads.includes(content.id));
        
        recommendations.push(...categoryContent.slice(0, 2));
      });

    return recommendations.slice(0, count);
  }

  /**
   * Track user activity for analytics
   */
  public trackUserActivity(userId: string, activity: {
    type: string;
    contentId?: string;
    duration?: number;
    metadata?: any;
  }): void {
    // This would integrate with analytics system
    console.log(`User ${userId} activity:`, activity);
    
    // Automatically check for achievements
    if (activity.type === 'wiki_read' && activity.contentId) {
      this.checkAchievements(userId, {
        type: 'read_wiki',
        data: {
          wikiId: activity.contentId,
          readingTime: activity.duration || 5
        }
      });
    }
  }

  /**
   * Get system health and statistics
   */
  public getSystemStats(): {
    content: {
      total: number;
      byCategory: Record<WikiCategory, number>;
      byDifficulty: Record<DifficultyLevel, number>;
    };
    achievements: {
      total: number;
      byCategory: Record<string, number>;
      byRarity: Record<string, number>;
    };
    isInitialized: boolean;
  } {
    const contentStats = this.isInitialized ? this.integrationSystem.getContentStats() : {
      total: 0,
      byCategory: {} as Record<WikiCategory, number>,
      byDifficulty: {} as Record<DifficultyLevel, number>
    };

    const achievements = this.isInitialized ? this.achievementSystem.getAllAchievements() : [];
    const achievementStats = {
      total: achievements.length,
      byCategory: {},
      byRarity: {}
    };

    achievements.forEach(achievement => {
      achievementStats.byCategory[achievement.category] = 
        (achievementStats.byCategory[achievement.category] || 0) + 1;
      achievementStats.byRarity[achievement.rarity] = 
        (achievementStats.byRarity[achievement.rarity] || 0) + 1;
    });

    return {
      content: contentStats,
      achievements: achievementStats,
      isInitialized: this.isInitialized
    };
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('WikiKnowledgeBase must be initialized before use');
    }
  }

  private extractFacts(content: WikiContent): string[] {
    const facts: string[] = [];
    
    // Extract key points as facts
    content.sections.forEach(section => {
      section.keyPoints.forEach(point => {
        if (point.length > 10 && point.length < 200) {
          facts.push(point);
        }
      });
    });

    // Extract interesting sentences
    const sentences = content.content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 20 && trimmed.length < 150) {
        // Check if it contains interesting keywords
        const interestingKeywords = ['allows', 'enables', 'provides', 'features', 'benefits'];
        if (interestingKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
          facts.push(trimmed + '.');
        }
      }
    });

    return facts.slice(0, 10); // Limit to 10 facts per content
  }

  private analyzeUserPreferences(readContent: WikiContent[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    readContent.forEach(content => {
      preferences[content.category] = (preferences[content.category] || 0) + 1;
    });

    return preferences;
  }

  // Static factory methods

  /**
   * Create WikiKnowledgeBase with sample Claude Flow data
   */
  public static async createWithSampleData(): Promise<WikiKnowledgeBase> {
    const kb = new WikiKnowledgeBase();
    
    // This would load actual Claude Flow wiki data
    const sampleData = [
      {
        id: 'getting-started',
        markdown: `# Getting Started with Claude Flow

Claude Flow is a powerful orchestration system for managing AI agent swarms.

## Key Features
- Swarm coordination
- Neural processing
- Performance optimization

## Quick Start
1. Install Claude Flow
2. Initialize a swarm
3. Deploy agents

## Best Practices
- Start with simple topologies
- Monitor performance metrics
- Use progressive scaling
        `,
        metadata: {
          author: 'Claude Flow Team',
          readingTime: 5
        }
      },
      {
        id: 'swarm-coordination',
        markdown: `# Swarm Coordination

Effective swarm coordination is crucial for optimal performance.

## Coordination Patterns
- Hierarchical: Clear command structure
- Mesh: Peer-to-peer communication
- Ring: Circular coordination

## Implementation
\`\`\`typescript
const swarm = new SwarmCoordinator({
  topology: 'hierarchical',
  maxAgents: 10
});
\`\`\`

## Performance Tips
- Use appropriate topology for your use case
- Monitor agent utilization
- Implement proper error handling
        `
      }
    ];

    await kb.initialize(sampleData);
    return kb;
  }
}