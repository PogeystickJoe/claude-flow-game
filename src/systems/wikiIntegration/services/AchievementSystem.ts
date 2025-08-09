import {
  WikiContent,
  WikiAchievement,
  AchievementCategory,
  AchievementRarity,
  AchievementRequirement,
  RequirementType,
  GameReward,
  RewardType,
  DifficultyLevel,
  WikiCategory
} from '../interfaces/WikiContent';

/**
 * Achievement system for discovering wiki secrets and mastering content
 */
export class AchievementSystem {
  private achievements: Map<string, WikiAchievement> = new Map();
  private userProgress: Map<string, any> = new Map(); // userId -> progress data
  private achievementIdCounter = 0;

  constructor() {
    this.initializeDefaultAchievements();
  }

  /**
   * Generate achievements based on wiki content
   */
  public generateWikiAchievements(wikiContent: WikiContent[]): WikiAchievement[] {
    const achievements: WikiAchievement[] = [];

    // Knowledge-based achievements
    achievements.push(...this.generateKnowledgeAchievements(wikiContent));
    
    // Practice achievements
    achievements.push(...this.generatePracticeAchievements(wikiContent));
    
    // Discovery achievements
    achievements.push(...this.generateDiscoveryAchievements(wikiContent));
    
    // Mastery achievements
    achievements.push(...this.generateMasteryAchievements(wikiContent));
    
    // Community achievements
    achievements.push(...this.generateCommunityAchievements(wikiContent));

    // Add all achievements to the system
    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });

    return achievements;
  }

  /**
   * Check and award achievements for a user action
   */
  public checkAchievements(
    userId: string,
    action: {
      type: 'read_wiki' | 'complete_tutorial' | 'answer_trivia' | 'solve_challenge' | 'discover_secret';
      data: any;
    }
  ): WikiAchievement[] {
    const userProgress = this.getUserProgress(userId);
    const awardedAchievements: WikiAchievement[] = [];

    // Update user progress
    this.updateUserProgress(userId, action);

    // Check all achievements
    for (const achievement of this.achievements.values()) {
      if (!userProgress.unlockedAchievements.includes(achievement.id)) {
        if (this.isAchievementUnlocked(userId, achievement)) {
          awardedAchievements.push(achievement);
          userProgress.unlockedAchievements.push(achievement.id);
          
          // Award rewards
          this.awardRewards(userId, achievement.rewards);
          
          // Track unlock time
          userProgress.achievementUnlockTimes[achievement.id] = new Date();
        }
      }
    }

    this.userProgress.set(userId, userProgress);
    return awardedAchievements;
  }

  /**
   * Get user's achievement progress
   */
  public getUserAchievementProgress(userId: string): {
    total: number;
    unlocked: number;
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
    byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
    recent: WikiAchievement[];
  } {
    const userProgress = this.getUserProgress(userId);
    const allAchievements = Array.from(this.achievements.values());
    
    // Initialize category and rarity counters
    const byCategory = {} as Record<AchievementCategory, { total: number; unlocked: number }>;
    const byRarity = {} as Record<AchievementRarity, { total: number; unlocked: number }>;
    
    Object.values(AchievementCategory).forEach(category => {
      byCategory[category] = { total: 0, unlocked: 0 };
    });
    
    Object.values(AchievementRarity).forEach(rarity => {
      byRarity[rarity] = { total: 0, unlocked: 0 };
    });

    // Count achievements
    allAchievements.forEach(achievement => {
      byCategory[achievement.category].total++;
      byRarity[achievement.rarity].total++;
      
      if (userProgress.unlockedAchievements.includes(achievement.id)) {
        byCategory[achievement.category].unlocked++;
        byRarity[achievement.rarity].unlocked++;
      }
    });

    // Get recent achievements (last 5)
    const recentIds = userProgress.unlockedAchievements.slice(-5);
    const recent = recentIds.map(id => this.achievements.get(id)!).filter(Boolean);

    return {
      total: allAchievements.length,
      unlocked: userProgress.unlockedAchievements.length,
      byCategory,
      byRarity,
      recent
    };
  }

  /**
   * Get achievements that are close to being unlocked
   */
  public getAlmostUnlockedAchievements(userId: string): Array<{
    achievement: WikiAchievement;
    progress: number; // 0-1
    nextRequirement: AchievementRequirement;
  }> {
    const userProgress = this.getUserProgress(userId);
    const almostUnlocked: Array<{
      achievement: WikiAchievement;
      progress: number;
      nextRequirement: AchievementRequirement;
    }> = [];

    for (const achievement of this.achievements.values()) {
      if (!userProgress.unlockedAchievements.includes(achievement.id) && !achievement.hidden) {
        const progress = this.calculateAchievementProgress(userId, achievement);
        if (progress > 0.5) {
          const nextRequirement = this.getNextRequirement(userId, achievement);
          if (nextRequirement) {
            almostUnlocked.push({
              achievement,
              progress,
              nextRequirement
            });
          }
        }
      }
    }

    return almostUnlocked.sort((a, b) => b.progress - a.progress);
  }

  /**
   * Get hidden/secret achievements that can be discovered
   */
  public getDiscoverableSecrets(userId: string): WikiAchievement[] {
    const userProgress = this.getUserProgress(userId);
    const discoverable: WikiAchievement[] = [];

    for (const achievement of this.achievements.values()) {
      if (achievement.hidden && !userProgress.unlockedAchievements.includes(achievement.id)) {
        // Check if user has prerequisites for discovering this secret
        if (this.canDiscoverSecret(userId, achievement)) {
          discoverable.push(achievement);
        }
      }
    }

    return discoverable;
  }

  // Private methods for generating achievements

  private generateKnowledgeAchievements(wikiContent: WikiContent[]): WikiAchievement[] {
    const achievements: WikiAchievement[] = [];

    // Reading achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Knowledge Seeker',
      description: 'Read your first wiki article',
      icon: 'book-open',
      category: AchievementCategory.KNOWLEDGE,
      requirements: [{
        type: RequirementType.READ_WIKI,
        target: 1,
        current: 0,
        description: 'Read 1 wiki article'
      }],
      rewards: [{
        type: RewardType.EXPERIENCE,
        value: 100,
        description: '100 XP for starting your learning journey'
      }],
      hidden: false,
      rarity: AchievementRarity.COMMON,
      unlockedBy: ['any-wiki-content']
    });

    achievements.push({
      id: this.generateAchievementId(),
      title: 'Voracious Reader',
      description: 'Read 25 wiki articles',
      icon: 'library',
      category: AchievementCategory.KNOWLEDGE,
      requirements: [{
        type: RequirementType.READ_WIKI,
        target: 25,
        current: 0,
        description: 'Read 25 wiki articles'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 1000,
          description: '1000 XP for extensive reading'
        },
        {
          type: RewardType.BADGE,
          value: 1,
          description: 'Voracious Reader badge',
          icon: 'reader-badge'
        }
      ],
      hidden: false,
      rarity: AchievementRarity.UNCOMMON,
      unlockedBy: wikiContent.map(w => w.id)
    });

    // Category-specific achievements
    Object.values(WikiCategory).forEach(category => {
      const categoryContent = wikiContent.filter(w => w.category === category);
      if (categoryContent.length > 0) {
        achievements.push({
          id: this.generateAchievementId(),
          title: `${this.formatCategoryName(category)} Expert`,
          description: `Master all content in the ${this.formatCategoryName(category)} category`,
          icon: `expert-${category}`,
          category: AchievementCategory.KNOWLEDGE,
          requirements: [{
            type: RequirementType.READ_WIKI,
            target: categoryContent.length,
            current: 0,
            description: `Read all ${categoryContent.length} articles in ${this.formatCategoryName(category)}`
          }],
          rewards: [
            {
              type: RewardType.EXPERIENCE,
              value: categoryContent.length * 200,
              description: `${categoryContent.length * 200} XP for category mastery`
            },
            {
              type: RewardType.BADGE,
              value: 1,
              description: `${this.formatCategoryName(category)} Expert badge`,
              icon: `expert-${category}-badge`
            }
          ],
          hidden: false,
          rarity: AchievementRarity.RARE,
          unlockedBy: categoryContent.map(w => w.id)
        });
      }
    });

    return achievements;
  }

  private generatePracticeAchievements(wikiContent: WikiContent[]): WikiAchievement[] {
    const achievements: WikiAchievement[] = [];

    // Tutorial completion achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'First Steps',
      description: 'Complete your first tutorial',
      icon: 'graduation-cap',
      category: AchievementCategory.PRACTICE,
      requirements: [{
        type: RequirementType.COMPLETE_TUTORIAL,
        target: 1,
        current: 0,
        description: 'Complete 1 tutorial'
      }],
      rewards: [{
        type: RewardType.EXPERIENCE,
        value: 200,
        description: '200 XP for completing first tutorial'
      }],
      hidden: false,
      rarity: AchievementRarity.COMMON,
      unlockedBy: ['tutorial-completion']
    });

    // Trivia achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Quiz Master',
      description: 'Answer 100 trivia questions correctly',
      icon: 'quiz-trophy',
      category: AchievementCategory.PRACTICE,
      requirements: [{
        type: RequirementType.ANSWER_TRIVIA,
        target: 100,
        current: 0,
        description: 'Answer 100 trivia questions correctly'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 2000,
          description: '2000 XP for trivia mastery'
        },
        {
          type: RewardType.COINS,
          value: 500,
          description: '500 coins bonus'
        }
      ],
      hidden: false,
      rarity: AchievementRarity.RARE,
      unlockedBy: ['trivia-answers']
    });

    // Challenge achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Problem Solver',
      description: 'Complete 10 challenge scenarios',
      icon: 'puzzle-piece',
      category: AchievementCategory.PRACTICE,
      requirements: [{
        type: RequirementType.SOLVE_CHALLENGE,
        target: 10,
        current: 0,
        description: 'Complete 10 challenges'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 1500,
          description: '1500 XP for problem solving'
        },
        {
          type: RewardType.BADGE,
          value: 1,
          description: 'Problem Solver badge',
          icon: 'solver-badge'
        }
      ],
      hidden: false,
      rarity: AchievementRarity.UNCOMMON,
      unlockedBy: ['challenge-completion']
    });

    return achievements;
  }

  private generateDiscoveryAchievements(wikiContent: WikiContent[]): WikiAchievement[] {
    const achievements: WikiAchievement[] = [];

    // Easter egg discoveries
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Easter Egg Hunter',
      description: 'Discover a hidden secret in the wiki',
      icon: 'egg-easter',
      category: AchievementCategory.DISCOVERY,
      requirements: [{
        type: RequirementType.DISCOVER_SECRET,
        target: 1,
        current: 0,
        description: 'Find 1 hidden easter egg'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 500,
          description: '500 XP for discovery'
        },
        {
          type: RewardType.UNLOCK_CONTENT,
          value: 1,
          description: 'Unlocks secret wiki section',
          icon: 'unlock-secret'
        }
      ],
      hidden: true,
      rarity: AchievementRarity.RARE,
      unlockedBy: ['secret-discovery']
    });

    // Deep dive achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Deep Diver',
      description: 'Spend 10 hours studying wiki content',
      icon: 'diving-mask',
      category: AchievementCategory.DISCOVERY,
      requirements: [{
        type: RequirementType.TIME_SPENT,
        target: 600, // 10 hours in minutes
        current: 0,
        description: 'Spend 600 minutes studying'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 2500,
          description: '2500 XP for dedicated study'
        },
        {
          type: RewardType.COSMETIC,
          value: 1,
          description: 'Deep Diver avatar decoration',
          icon: 'deep-diver-decoration'
        }
      ],
      hidden: false,
      rarity: AchievementRarity.EPIC,
      unlockedBy: ['time-tracking']
    });

    return achievements;
  }

  private generateMasteryAchievements(wikiContent: WikiContent[]): WikiAchievement[] {
    const achievements: WikiAchievement[] = [];

    // Perfect scores
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Perfectionist',
      description: 'Get 100% on 5 expert-level trivia challenges',
      icon: 'perfect-score',
      category: AchievementCategory.MASTERY,
      requirements: [{
        type: RequirementType.ANSWER_TRIVIA,
        target: 5,
        current: 0,
        description: 'Perfect score on 5 expert trivia'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 3000,
          description: '3000 XP for perfectionism'
        },
        {
          type: RewardType.BADGE,
          value: 1,
          description: 'Perfectionist badge',
          icon: 'perfect-badge'
        }
      ],
      hidden: false,
      rarity: AchievementRarity.LEGENDARY,
      unlockedBy: ['perfect-scores']
    });

    // Speed achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Speed Demon',
      description: 'Complete a challenge in record time',
      icon: 'lightning-bolt',
      category: AchievementCategory.MASTERY,
      requirements: [{
        type: RequirementType.SOLVE_CHALLENGE,
        target: 1,
        current: 0,
        description: 'Complete challenge in top 10% time'
      }],
      rewards: [
        {
          type: RewardType.EXPERIENCE,
          value: 1000,
          description: '1000 XP for speed'
        },
        {
          type: RewardType.COSMETIC,
          value: 1,
          description: 'Lightning effect',
          icon: 'lightning-effect'
        }
      ],
      hidden: false,
      rarity: AchievementRarity.EPIC,
      unlockedBy: ['speed-completion']
    });

    return achievements;
  }

  private generateCommunityAchievements(wikiContent: WikiContent[]): WikiAchievement[] {
    const achievements: WikiAchievement[] = [];

    // Sharing achievements
    achievements.push({
      id: this.generateAchievementId(),
      title: 'Knowledge Sharer',
      description: 'Share a wiki article with others',
      icon: 'share-network',
      category: AchievementCategory.COMMUNITY,
      requirements: [{
        type: RequirementType.DISCOVER_SECRET, // Reusing this for sharing
        target: 1,
        current: 0,
        description: 'Share 1 article'
      }],
      rewards: [{
        type: RewardType.EXPERIENCE,
        value: 300,
        description: '300 XP for sharing knowledge'
      }],
      hidden: false,
      rarity: AchievementRarity.COMMON,
      unlockedBy: ['sharing-action']
    });

    return achievements;
  }

  private initializeDefaultAchievements(): void {
    // Initialize with some basic achievements
    const defaultAchievements: WikiAchievement[] = [
      {
        id: 'welcome',
        title: 'Welcome to Claude Flow',
        description: 'Start your Claude Flow journey',
        icon: 'welcome-flag',
        category: AchievementCategory.KNOWLEDGE,
        requirements: [{
          type: RequirementType.READ_WIKI,
          target: 1,
          current: 0,
          description: 'Read the welcome article'
        }],
        rewards: [{
          type: RewardType.EXPERIENCE,
          value: 50,
          description: '50 XP welcome bonus'
        }],
        hidden: false,
        rarity: AchievementRarity.COMMON,
        unlockedBy: ['welcome-wiki']
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // Helper methods

  private generateAchievementId(): string {
    return `achievement-${++this.achievementIdCounter}`;
  }

  private getUserProgress(userId: string): any {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        unlockedAchievements: [],
        wikiReads: [],
        tutorialsCompleted: [],
        triviaAnswers: { correct: 0, total: 0 },
        challengesCompleted: [],
        secretsDiscovered: [],
        timeSpent: 0,
        achievementUnlockTimes: {},
        lastActivity: new Date()
      });
    }
    return this.userProgress.get(userId);
  }

  private updateUserProgress(userId: string, action: any): void {
    const progress = this.getUserProgress(userId);

    switch (action.type) {
      case 'read_wiki':
        if (!progress.wikiReads.includes(action.data.wikiId)) {
          progress.wikiReads.push(action.data.wikiId);
          progress.timeSpent += action.data.readingTime || 5;
        }
        break;

      case 'complete_tutorial':
        if (!progress.tutorialsCompleted.includes(action.data.tutorialId)) {
          progress.tutorialsCompleted.push(action.data.tutorialId);
        }
        break;

      case 'answer_trivia':
        progress.triviaAnswers.total++;
        if (action.data.correct) {
          progress.triviaAnswers.correct++;
        }
        break;

      case 'solve_challenge':
        if (!progress.challengesCompleted.includes(action.data.challengeId)) {
          progress.challengesCompleted.push(action.data.challengeId);
        }
        break;

      case 'discover_secret':
        if (!progress.secretsDiscovered.includes(action.data.secretId)) {
          progress.secretsDiscovered.push(action.data.secretId);
        }
        break;
    }

    progress.lastActivity = new Date();
    this.userProgress.set(userId, progress);
  }

  private isAchievementUnlocked(userId: string, achievement: WikiAchievement): boolean {
    const progress = this.getUserProgress(userId);

    return achievement.requirements.every(requirement => {
      switch (requirement.type) {
        case RequirementType.READ_WIKI:
          return progress.wikiReads.length >= requirement.target;

        case RequirementType.COMPLETE_TUTORIAL:
          return progress.tutorialsCompleted.length >= requirement.target;

        case RequirementType.ANSWER_TRIVIA:
          return progress.triviaAnswers.correct >= requirement.target;

        case RequirementType.SOLVE_CHALLENGE:
          return progress.challengesCompleted.length >= requirement.target;

        case RequirementType.DISCOVER_SECRET:
          return progress.secretsDiscovered.length >= requirement.target;

        case RequirementType.TIME_SPENT:
          return progress.timeSpent >= requirement.target;

        default:
          return false;
      }
    });
  }

  private calculateAchievementProgress(userId: string, achievement: WikiAchievement): number {
    const progress = this.getUserProgress(userId);
    let totalProgress = 0;

    achievement.requirements.forEach(requirement => {
      let currentValue = 0;

      switch (requirement.type) {
        case RequirementType.READ_WIKI:
          currentValue = progress.wikiReads.length;
          break;
        case RequirementType.COMPLETE_TUTORIAL:
          currentValue = progress.tutorialsCompleted.length;
          break;
        case RequirementType.ANSWER_TRIVIA:
          currentValue = progress.triviaAnswers.correct;
          break;
        case RequirementType.SOLVE_CHALLENGE:
          currentValue = progress.challengesCompleted.length;
          break;
        case RequirementType.DISCOVER_SECRET:
          currentValue = progress.secretsDiscovered.length;
          break;
        case RequirementType.TIME_SPENT:
          currentValue = progress.timeSpent;
          break;
      }

      totalProgress += Math.min(currentValue / requirement.target, 1);
    });

    return totalProgress / achievement.requirements.length;
  }

  private getNextRequirement(userId: string, achievement: WikiAchievement): AchievementRequirement | null {
    const progress = this.getUserProgress(userId);

    for (const requirement of achievement.requirements) {
      let currentValue = 0;

      switch (requirement.type) {
        case RequirementType.READ_WIKI:
          currentValue = progress.wikiReads.length;
          break;
        case RequirementType.COMPLETE_TUTORIAL:
          currentValue = progress.tutorialsCompleted.length;
          break;
        case RequirementType.ANSWER_TRIVIA:
          currentValue = progress.triviaAnswers.correct;
          break;
        case RequirementType.SOLVE_CHALLENGE:
          currentValue = progress.challengesCompleted.length;
          break;
        case RequirementType.DISCOVER_SECRET:
          currentValue = progress.secretsDiscovered.length;
          break;
        case RequirementType.TIME_SPENT:
          currentValue = progress.timeSpent;
          break;
      }

      if (currentValue < requirement.target) {
        return {
          ...requirement,
          current: currentValue
        };
      }
    }

    return null;
  }

  private canDiscoverSecret(userId: string, achievement: WikiAchievement): boolean {
    const progress = this.getUserProgress(userId);

    // Basic prerequisites for discovering secrets
    if (progress.wikiReads.length < 5) return false;
    if (progress.timeSpent < 60) return false; // At least 1 hour

    // Check if user has shown interest in the relevant areas
    const relevantContent = achievement.unlockedBy.some(contentId =>
      progress.wikiReads.includes(contentId)
    );

    return relevantContent;
  }

  private awardRewards(userId: string, rewards: GameReward[]): void {
    const progress = this.getUserProgress(userId);

    rewards.forEach(reward => {
      switch (reward.type) {
        case RewardType.EXPERIENCE:
          progress.totalExperience = (progress.totalExperience || 0) + reward.value;
          break;

        case RewardType.COINS:
          progress.coins = (progress.coins || 0) + reward.value;
          break;

        case RewardType.BADGE:
          progress.badges = progress.badges || [];
          progress.badges.push(reward.description);
          break;

        case RewardType.UNLOCK_CONTENT:
          progress.unlockedContent = progress.unlockedContent || [];
          progress.unlockedContent.push(reward.description);
          break;

        case RewardType.COSMETIC:
          progress.cosmetics = progress.cosmetics || [];
          progress.cosmetics.push(reward.description);
          break;
      }
    });

    this.userProgress.set(userId, progress);
  }

  private formatCategoryName(category: WikiCategory): string {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Public methods for game integration

  public getAchievementById(achievementId: string): WikiAchievement | undefined {
    return this.achievements.get(achievementId);
  }

  public getAllAchievements(): WikiAchievement[] {
    return Array.from(this.achievements.values());
  }

  public getAchievementsByCategory(category: AchievementCategory): WikiAchievement[] {
    return Array.from(this.achievements.values()).filter(
      achievement => achievement.category === category
    );
  }

  public getAchievementsByRarity(rarity: AchievementRarity): WikiAchievement[] {
    return Array.from(this.achievements.values()).filter(
      achievement => achievement.rarity === rarity
    );
  }

  public getUserStats(userId: string): any {
    return this.getUserProgress(userId);
  }

  public resetUserProgress(userId: string): void {
    this.userProgress.delete(userId);
  }
}