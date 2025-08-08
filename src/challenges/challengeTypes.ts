/**
 * Challenge Type Definitions and Validators
 * Supporting the wiki-based challenges system
 */

export interface ChallengeResult {
  challengeId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  attempts: number;
  hintsUsed: number;
  perfectScore: boolean;
  medalEarned: 'gold' | 'silver' | 'bronze' | null;
  timestamp: Date;
}

export interface ChallengeValidation {
  isValid: boolean;
  score: number;
  feedback: string[];
  errors: string[];
  completionTime: number;
}

// Wiki Warrior Validation
export class WikiWarriorValidator {
  static validateAnswers(questions: any[], userAnswers: number[]): ChallengeValidation {
    if (userAnswers.length !== questions.length) {
      return {
        isValid: false,
        score: 0,
        feedback: ['Incomplete quiz - please answer all questions'],
        errors: ['Missing answers'],
        completionTime: 0
      };
    }

    let correct = 0;
    const feedback: string[] = [];
    const errors: string[] = [];

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correct++;
        feedback.push(`✅ Question ${index + 1}: Correct! ${question.explanation}`);
      } else {
        errors.push(`❌ Question ${index + 1}: Incorrect. ${question.explanation}`);
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    
    return {
      isValid: score >= 60, // 60% passing grade
      score,
      feedback,
      errors,
      completionTime: Date.now()
    };
  }
}

// Command Master Validation
export class CommandMasterValidator {
  static validateExecution(challenge: any, outputs: string[]): ChallengeValidation {
    const feedback: string[] = [];
    const errors: string[] = [];
    let score = 0;
    let totalPoints = 0;

    challenge.commands.forEach((command: string, index: number) => {
      totalPoints += 20; // Each command worth 20 points
      const output = outputs[index] || '';
      const expected = challenge.expectedResults[index] || '';
      
      if (this.isOutputValid(output, expected)) {
        score += 20;
        feedback.push(`✅ Command ${index + 1}: Executed successfully`);
      } else {
        errors.push(`❌ Command ${index + 1}: Unexpected output`);
        feedback.push(`Expected: ${expected}`);
        feedback.push(`Got: ${output}`);
      }
    });

    return {
      isValid: score >= totalPoints * 0.7, // 70% success rate required
      score: Math.round((score / totalPoints) * 100),
      feedback,
      errors,
      completionTime: Date.now()
    };
  }

  private static isOutputValid(actual: string, expected: string): boolean {
    // Flexible matching - check if expected content is present
    return actual.toLowerCase().includes(expected.toLowerCase()) ||
           this.matchesPattern(actual, expected);
  }

  private static matchesPattern(actual: string, pattern: string): boolean {
    // Simple pattern matching for common outputs
    if (pattern.includes('success') && actual.includes('success')) return true;
    if (pattern.includes('active') && actual.includes('active')) return true;
    if (pattern.includes('spawned') && actual.includes('spawned')) return true;
    return false;
  }
}

// Bug Hunter Validation
export class BugHunterValidator {
  static validateDiagnosis(scenario: any, userSolution: string): ChallengeValidation {
    const feedback: string[] = [];
    const errors: string[] = [];
    
    const solutionKeywords = this.extractKeywords(scenario.correctSolution);
    const userKeywords = this.extractKeywords(userSolution);
    
    let matchScore = 0;
    let totalKeywords = solutionKeywords.length;
    
    solutionKeywords.forEach(keyword => {
      if (userKeywords.includes(keyword)) {
        matchScore++;
        feedback.push(`✅ Correctly identified: ${keyword}`);
      }
    });

    // Check if user avoided incorrect solutions
    let penaltyScore = 0;
    scenario.incorrectSolutions.forEach((incorrect: string) => {
      const incorrectKeywords = this.extractKeywords(incorrect);
      if (incorrectKeywords.some((k: string) => userKeywords.includes(k))) {
        penaltyScore += 10;
        errors.push(`❌ Mentioned incorrect solution: ${incorrect}`);
      }
    });

    const baseScore = Math.round((matchScore / totalKeywords) * 100);
    const finalScore = Math.max(0, baseScore - penaltyScore);

    return {
      isValid: finalScore >= 70,
      score: finalScore,
      feedback: [
        ...feedback,
        `Correct approach: ${scenario.explanation}`,
        ...scenario.troubleshootingSteps.map((step: string) => `💡 ${step}`)
      ],
      errors,
      completionTime: Date.now()
    };
  }

  private static extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'has', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
  }
}

// Speed Run Validation
export class SpeedRunValidator {
  static validateSpeedRun(task: any, results: any[], completionTime: number): ChallengeValidation {
    const feedback: string[] = [];
    const errors: string[] = [];
    
    // Validate all steps completed
    if (results.length !== task.steps.length) {
      return {
        isValid: false,
        score: 0,
        feedback: ['Incomplete speed run - all steps must be completed'],
        errors: ['Missing steps'],
        completionTime
      };
    }

    // Check if task validation passes
    const taskValid = task.validation(results);
    if (!taskValid) {
      return {
        isValid: false,
        score: 25, // Partial credit for attempt
        feedback: ['Steps completed but validation failed'],
        errors: ['Task validation failed'],
        completionTime
      };
    }

    // Calculate score based on time
    let medal: string = '';
    let timeBonus = 0;

    if (completionTime <= task.goldTime) {
      medal = 'gold';
      timeBonus = 100;
      feedback.push('🥇 GOLD MEDAL! Incredible speed!');
    } else if (completionTime <= task.silverTime) {
      medal = 'silver';
      timeBonus = 75;
      feedback.push('🥈 Silver Medal! Great performance!');
    } else if (completionTime <= task.bronzeTime) {
      medal = 'bronze';
      timeBonus = 50;
      feedback.push('🥉 Bronze Medal! Good job!');
    } else {
      timeBonus = 25;
      feedback.push('Task completed, but work on your speed!');
    }

    // World record check
    if (task.worldRecord && completionTime < task.worldRecord) {
      feedback.push('🌟 NEW WORLD RECORD! Absolutely phenomenal!');
      timeBonus += 50;
    }

    const baseScore = 50; // Base completion score
    const finalScore = Math.min(100, baseScore + timeBonus);

    return {
      isValid: true,
      score: finalScore,
      feedback,
      errors,
      completionTime
    };
  }
}

// Easter Egg Validation
export class EasterEggValidator {
  static validateFind(easterEgg: any, userInput: string, context: string): ChallengeValidation {
    const feedback: string[] = [];
    const errors: string[] = [];
    
    let found = false;
    
    if (typeof easterEgg.trigger === 'string') {
      found = userInput.includes(easterEgg.trigger) || context.includes(easterEgg.trigger);
    } else if (easterEgg.trigger instanceof RegExp) {
      found = easterEgg.trigger.test(userInput) || easterEgg.trigger.test(context);
    }

    if (found) {
      feedback.push(`🥚 Easter Egg Found: ${easterEgg.name}`);
      feedback.push(`📝 ${easterEgg.description}`);
      feedback.push(`🏆 Reward: ${easterEgg.reward}`);
      feedback.push(`⭐ Rarity: ${easterEgg.rarity.toUpperCase()}`);
      
      // Rarity-based scoring
      const rarityScores = {
        'common': 25,
        'rare': 50,
        'legendary': 75,
        'mythic': 100
      };
      
      const score = rarityScores[easterEgg.rarity as keyof typeof rarityScores] || 25;
      
      return {
        isValid: true,
        score,
        feedback,
        errors,
        completionTime: Date.now()
      };
    }

    return {
      isValid: false,
      score: 0,
      feedback: ['Keep searching! The easter egg is still hidden.'],
      errors: ['Easter egg not found'],
      completionTime: Date.now()
    };
  }

  static validateCollection(foundEggs: string[], totalEggs: number): {
    completionRate: number;
    achievements: string[];
    totalScore: number;
  } {
    const completionRate = (foundEggs.length / totalEggs) * 100;
    const achievements: string[] = [];
    let totalScore = foundEggs.length * 50; // Base score per egg

    // Achievement thresholds
    if (completionRate >= 25) achievements.push('Egg Collector');
    if (completionRate >= 50) achievements.push('Treasure Hunter');
    if (completionRate >= 75) achievements.push('Master Explorer');
    if (completionRate >= 100) achievements.push('Perfect Find');

    // Bonus for rare finds
    // This would need access to the actual egg data to calculate properly

    return {
      completionRate,
      achievements,
      totalScore
    };
  }
}

// Meme Lord Validation
export class MemeLordValidator {
  static validateMeme(template: any, userContent: string, placeholders: Record<string, string>): ChallengeValidation {
    const feedback: string[] = [];
    const errors: string[] = [];
    
    // Check if all placeholders are filled
    let templateFilled = template.template;
    let missingPlaceholders = 0;
    
    template.placeholder.forEach((placeholder: string) => {
      if (placeholders[placeholder]) {
        templateFilled = templateFilled.replace(`{${placeholder}}`, placeholders[placeholder]);
        feedback.push(`✅ Placeholder filled: ${placeholder}`);
      } else {
        missingPlaceholders++;
        errors.push(`❌ Missing placeholder: ${placeholder}`);
      }
    });

    if (missingPlaceholders > 0) {
      return {
        isValid: false,
        score: 0,
        feedback,
        errors,
        completionTime: Date.now()
      };
    }

    // Creativity score based on content analysis
    const creativityScore = this.analyzeCreativity(userContent, template.category);
    const relevanceScore = this.analyzeRelevance(userContent);
    const viralPotentialScore = Math.min(template.viralPotential * 10, 50);
    
    const totalScore = Math.round((creativityScore + relevanceScore + viralPotentialScore) / 3);

    feedback.push(`🎨 Creativity: ${creativityScore}%`);
    feedback.push(`🎯 Relevance: ${relevanceScore}%`);
    feedback.push(`🔥 Viral Potential: ${viralPotentialScore}%`);

    if (totalScore >= 80) feedback.push('🌟 Meme Master! This could go viral!');
    else if (totalScore >= 60) feedback.push('😄 Great meme! Very shareable!');
    else feedback.push('👍 Good effort! Keep refining your meme skills!');

    return {
      isValid: totalScore >= 40, // Low bar for creativity
      score: totalScore,
      feedback,
      errors,
      completionTime: Date.now()
    };
  }

  private static analyzeCreativity(content: string, category: string): number {
    // Simple creativity scoring based on content analysis
    let score = 50; // Base score

    // Length check (not too short, not too long)
    if (content.length >= 20 && content.length <= 200) score += 10;
    
    // Contains category-relevant terms
    const categoryTerms = {
      'agents': ['agent', 'swarm', 'spawn', 'orchestrate'],
      'swarm': ['topology', 'mesh', 'hierarchical', 'coordination'],
      'sparc': ['specification', 'pseudocode', 'architecture', 'tdd'],
      'performance': ['speed', 'token', 'optimization', 'efficiency'],
      'bugs': ['error', 'debug', 'fix', 'troubleshoot']
    };

    const terms = categoryTerms[category as keyof typeof categoryTerms] || [];
    const relevantTerms = terms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    
    score += Math.min(relevantTerms * 10, 30);

    // Humor indicators (very basic)
    const humorWords = ['lol', '😂', '🤣', 'haha', 'omg', 'epic', 'fail'];
    const hasHumor = humorWords.some(word => 
      content.toLowerCase().includes(word)
    );
    
    if (hasHumor) score += 10;

    return Math.min(score, 100);
  }

  private static analyzeRelevance(content: string): number {
    // Check for Claude Flow specific terms
    const claudeFlowTerms = [
      'claude-flow', 'claudeflow', 'mcp', 'sparc', 'swarm', 
      'agent', 'neural', 'topology', 'orchestrate'
    ];
    
    const relevantTerms = claudeFlowTerms.filter(term =>
      content.toLowerCase().includes(term)
    ).length;

    return Math.min(50 + (relevantTerms * 10), 100);
  }
}

// Challenge Progress Tracker
export class ChallengeProgressTracker {
  private progress: Map<string, ChallengeResult> = new Map();

  recordResult(result: ChallengeResult): void {
    this.progress.set(result.challengeId, result);
  }

  getResult(challengeId: string): ChallengeResult | undefined {
    return this.progress.get(challengeId);
  }

  getBestScore(challengeId: string): number {
    const result = this.getResult(challengeId);
    return result?.score || 0;
  }

  getCompletionRate(): number {
    const completed = Array.from(this.progress.values())
      .filter(result => result.completed).length;
    return this.progress.size > 0 ? (completed / this.progress.size) * 100 : 0;
  }

  getAverageScore(): number {
    const scores = Array.from(this.progress.values())
      .filter(result => result.completed)
      .map(result => result.score);
    
    return scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
  }

  getTotalTime(): number {
    return Array.from(this.progress.values())
      .reduce((total, result) => total + result.timeSpent, 0);
  }

  getStreakData(): { current: number; longest: number } {
    const results = Array.from(this.progress.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (const result of results) {
      if (result.completed && result.score >= 60) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // Current streak is from the end
    for (let i = results.length - 1; i >= 0; i--) {
      const result = results[i];
      if (result.completed && result.score >= 60) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  }

  exportData(): any {
    return {
      progress: Array.from(this.progress.entries()),
      stats: {
        completionRate: this.getCompletionRate(),
        averageScore: this.getAverageScore(),
        totalTime: this.getTotalTime(),
        streakData: this.getStreakData()
      },
      timestamp: new Date().toISOString()
    };
  }

  importData(data: any): void {
    if (data.progress) {
      this.progress = new Map(data.progress);
    }
  }
}

export {
  WikiWarriorValidator,
  CommandMasterValidator,
  BugHunterValidator,
  SpeedRunValidator,
  EasterEggValidator,
  MemeLordValidator,
  ChallengeProgressTracker
};