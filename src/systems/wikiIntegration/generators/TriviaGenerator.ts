import {
  WikiContent,
  WikiSection,
  TriviaQuestion,
  DifficultyLevel,
  WikiCategory,
  CodeExample
} from '../interfaces/WikiContent';

/**
 * Generates trivia questions from wiki content
 */
export class TriviaGenerator {
  private questionIdCounter = 0;

  /**
   * Generate multiple trivia questions from wiki content
   */
  public generateTriviaSet(
    wikiContent: WikiContent, 
    count: number = 5,
    difficulty?: DifficultyLevel
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    const targetDifficulty = difficulty || wikiContent.difficulty;

    // Generate different types of questions
    questions.push(...this.generateDefinitionQuestions(wikiContent, targetDifficulty));
    questions.push(...this.generateCodeQuestions(wikiContent, targetDifficulty));
    questions.push(...this.generateConceptualQuestions(wikiContent, targetDifficulty));
    questions.push(...this.generatePracticalQuestions(wikiContent, targetDifficulty));
    questions.push(...this.generateComparisonQuestions(wikiContent, targetDifficulty));

    // Shuffle and limit to requested count
    const shuffled = this.shuffleArray(questions);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Generate daily trivia challenge
   */
  public generateDailyTrivia(
    allWikiContent: WikiContent[],
    playerLevel: DifficultyLevel = DifficultyLevel.INTERMEDIATE
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    
    // Select diverse content for daily challenge
    const categorizedContent = this.categorizeContent(allWikiContent);
    
    // One question per major category, adjusted for player level
    Object.entries(categorizedContent).forEach(([category, contents]) => {
      if (contents.length > 0) {
        const randomContent = contents[Math.floor(Math.random() * contents.length)];
        const categoryQuestions = this.generateTriviaSet(randomContent, 1, playerLevel);
        if (categoryQuestions.length > 0) {
          questions.push(categoryQuestions[0]);
        }
      }
    });

    return questions.slice(0, 5); // Limit daily challenge to 5 questions
  }

  /**
   * Generate adaptive trivia based on player performance
   */
  public generateAdaptiveTrivia(
    wikiContent: WikiContent[],
    playerStats: {
      correctAnswers: number;
      totalAnswers: number;
      weakCategories: WikiCategory[];
      averageTime: number;
    }
  ): TriviaQuestion[] {
    const accuracy = playerStats.totalAnswers > 0 
      ? playerStats.correctAnswers / playerStats.totalAnswers 
      : 0.5;

    // Adjust difficulty based on performance
    let targetDifficulty: DifficultyLevel;
    if (accuracy > 0.8) {
      targetDifficulty = DifficultyLevel.ADVANCED;
    } else if (accuracy > 0.6) {
      targetDifficulty = DifficultyLevel.INTERMEDIATE;
    } else {
      targetDifficulty = DifficultyLevel.BEGINNER;
    }

    // Focus on weak categories
    const questions: TriviaQuestion[] = [];
    const weakContent = wikiContent.filter(content => 
      playerStats.weakCategories.includes(content.category)
    );

    if (weakContent.length > 0) {
      // 70% questions from weak areas
      const weakQuestions = weakContent.flatMap(content => 
        this.generateTriviaSet(content, 2, targetDifficulty)
      );
      questions.push(...weakQuestions.slice(0, 7));
    }

    // 30% general questions
    const generalQuestions = wikiContent.flatMap(content => 
      this.generateTriviaSet(content, 1, targetDifficulty)
    );
    questions.push(...generalQuestions.slice(0, 3));

    // Adjust time limits based on player's average time
    return questions.map(q => ({
      ...q,
      timeLimit: Math.max(10, Math.min(60, playerStats.averageTime * 1.2))
    }));
  }

  /**
   * Generate definition-based questions
   */
  private generateDefinitionQuestions(
    wikiContent: WikiContent, 
    difficulty: DifficultyLevel
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    
    // Extract key terms and concepts
    const keyTerms = this.extractKeyTerms(wikiContent);
    
    keyTerms.forEach(term => {
      const definition = this.findDefinition(term, wikiContent);
      if (definition) {
        questions.push({
          id: this.generateQuestionId(),
          question: `What is ${term}?`,
          options: this.generateDefinitionOptions(definition, term),
          correctAnswer: 0, // Correct definition is always first, then shuffled
          explanation: definition,
          difficulty,
          category: wikiContent.category,
          sourceWikiId: wikiContent.id,
          points: this.calculatePoints(difficulty, 'definition'),
          timeLimit: this.calculateTimeLimit(difficulty, 'definition')
        });
      }
    });

    return this.shuffleQuestionOptions(questions);
  }

  /**
   * Generate code-based questions
   */
  private generateCodeQuestions(
    wikiContent: WikiContent, 
    difficulty: DifficultyLevel
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    const codeExamples = wikiContent.sections.flatMap(s => s.codeExamples || []);
    
    codeExamples.forEach(example => {
      // What does this code do?
      questions.push({
        id: this.generateQuestionId(),
        question: `What does this ${example.language} code do?\n\n\`\`\`${example.language}\n${example.code}\n\`\`\``,
        options: this.generateCodePurposeOptions(example),
        correctAnswer: 0,
        explanation: example.description,
        difficulty,
        category: wikiContent.category,
        sourceWikiId: wikiContent.id,
        points: this.calculatePoints(difficulty, 'code'),
        timeLimit: this.calculateTimeLimit(difficulty, 'code')
      });

      // Spot the error questions (for more complex code)
      if (difficulty !== DifficultyLevel.BEGINNER && example.code.split('\n').length > 3) {
        const buggyCode = this.introduceBug(example.code, example.language);
        if (buggyCode !== example.code) {
          questions.push({
            id: this.generateQuestionId(),
            question: `What's wrong with this ${example.language} code?\n\n\`\`\`${example.language}\n${buggyCode}\n\`\`\``,
            options: this.generateBugOptions(example.language),
            correctAnswer: 0,
            explanation: 'The code has been modified to include a common error pattern.',
            difficulty,
            category: wikiContent.category,
            sourceWikiId: wikiContent.id,
            points: this.calculatePoints(difficulty, 'debug'),
            timeLimit: this.calculateTimeLimit(difficulty, 'debug')
          });
        }
      }
    });

    return this.shuffleQuestionOptions(questions);
  }

  /**
   * Generate conceptual questions
   */
  private generateConceptualQuestions(
    wikiContent: WikiContent, 
    difficulty: DifficultyLevel
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    
    // Generate questions from key points
    wikiContent.sections.forEach(section => {
      section.keyPoints.forEach(keyPoint => {
        questions.push({
          id: this.generateQuestionId(),
          question: `Which statement best describes the concept of "${section.title}"?`,
          options: this.generateConceptOptions(keyPoint, section.title),
          correctAnswer: 0,
          explanation: keyPoint,
          difficulty,
          category: wikiContent.category,
          sourceWikiId: wikiContent.id,
          points: this.calculatePoints(difficulty, 'concept'),
          timeLimit: this.calculateTimeLimit(difficulty, 'concept')
        });
      });
    });

    // Generate benefit/purpose questions
    const benefits = this.extractBenefits(wikiContent);
    benefits.forEach(benefit => {
      questions.push({
        id: this.generateQuestionId(),
        question: `What is a key benefit of using ${wikiContent.title}?`,
        options: this.generateBenefitOptions(benefit),
        correctAnswer: 0,
        explanation: benefit,
        difficulty,
        category: wikiContent.category,
        sourceWikiId: wikiContent.id,
        points: this.calculatePoints(difficulty, 'benefit'),
        timeLimit: this.calculateTimeLimit(difficulty, 'benefit')
      });
    });

    return this.shuffleQuestionOptions(questions.slice(0, 5));
  }

  /**
   * Generate practical application questions
   */
  private generatePracticalQuestions(
    wikiContent: WikiContent, 
    difficulty: DifficultyLevel
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    
    // When would you use this?
    questions.push({
      id: this.generateQuestionId(),
      question: `When would you most likely use ${wikiContent.title}?`,
      options: this.generateUseCaseOptions(wikiContent),
      correctAnswer: 0,
      explanation: `${wikiContent.title} is most useful in scenarios that match its core capabilities and design goals.`,
      difficulty,
      category: wikiContent.category,
      sourceWikiId: wikiContent.id,
      points: this.calculatePoints(difficulty, 'practical'),
      timeLimit: this.calculateTimeLimit(difficulty, 'practical')
    });

    // Best practices questions
    const bestPractices = this.extractBestPractices(wikiContent);
    bestPractices.forEach(practice => {
      questions.push({
        id: this.generateQuestionId(),
        question: `What is a best practice when working with ${wikiContent.title}?`,
        options: this.generateBestPracticeOptions(practice),
        correctAnswer: 0,
        explanation: practice,
        difficulty,
        category: wikiContent.category,
        sourceWikiId: wikiContent.id,
        points: this.calculatePoints(difficulty, 'best-practice'),
        timeLimit: this.calculateTimeLimit(difficulty, 'best-practice')
      });
    });

    return this.shuffleQuestionOptions(questions.slice(0, 3));
  }

  /**
   * Generate comparison questions
   */
  private generateComparisonQuestions(
    wikiContent: WikiContent, 
    difficulty: DifficultyLevel
  ): TriviaQuestion[] {
    const questions: TriviaQuestion[] = [];
    
    // Compare with alternatives
    const alternatives = this.findAlternatives(wikiContent);
    alternatives.forEach(alternative => {
      questions.push({
        id: this.generateQuestionId(),
        question: `How does ${wikiContent.title} differ from ${alternative}?`,
        options: this.generateComparisonOptions(wikiContent.title, alternative),
        correctAnswer: 0,
        explanation: `${wikiContent.title} and ${alternative} serve different purposes and have distinct strengths.`,
        difficulty,
        category: wikiContent.category,
        sourceWikiId: wikiContent.id,
        points: this.calculatePoints(difficulty, 'comparison'),
        timeLimit: this.calculateTimeLimit(difficulty, 'comparison')
      });
    });

    return this.shuffleQuestionOptions(questions.slice(0, 2));
  }

  // Helper methods

  private generateQuestionId(): string {
    return `trivia-${++this.questionIdCounter}`;
  }

  private extractKeyTerms(wikiContent: WikiContent): string[] {
    const terms = new Set<string>();
    
    // Extract from titles
    terms.add(wikiContent.title);
    wikiContent.sections.forEach(section => terms.add(section.title));
    
    // Extract from tags
    wikiContent.tags.forEach(tag => {
      if (tag.length > 3 && tag.length < 20) {
        terms.add(tag);
      }
    });
    
    // Extract technical terms from content
    const technicalTerms = wikiContent.content.match(/\b[A-Z][a-zA-Z]{3,}\b/g) || [];
    technicalTerms.forEach(term => {
      if (terms.size < 10) terms.add(term);
    });
    
    return Array.from(terms).slice(0, 5);
  }

  private findDefinition(term: string, wikiContent: WikiContent): string | null {
    // Look for definition patterns in content
    const patterns = [
      new RegExp(`${term}\\s+is\\s+([^.!?]+[.!?])`, 'i'),
      new RegExp(`${term}\\s*:?\\s*([^.!?]+[.!?])`, 'i'),
      new RegExp(`([^.!?]*${term}[^.!?]*[.!?])`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = wikiContent.content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Fallback: use section content if term matches section title
    for (const section of wikiContent.sections) {
      if (section.title.toLowerCase().includes(term.toLowerCase())) {
        const sentences = section.content.split(/[.!?]+/);
        return sentences[0]?.trim() + '.';
      }
    }
    
    return null;
  }

  private generateDefinitionOptions(correctDefinition: string, term: string): string[] {
    const options = [correctDefinition];
    
    // Generate plausible but incorrect alternatives
    const alternatives = [
      `${term} is primarily used for data storage and retrieval operations.`,
      `${term} is a legacy system that has been replaced by modern alternatives.`,
      `${term} is a debugging tool used to identify performance bottlenecks.`,
      `${term} is a configuration file format similar to JSON or YAML.`
    ];
    
    // Add alternatives that don't match the correct answer
    alternatives.forEach(alt => {
      if (options.length < 4 && !this.isSimilar(alt, correctDefinition)) {
        options.push(alt);
      }
    });
    
    // Pad with generic alternatives if needed
    while (options.length < 4) {
      options.push(`${term} is not directly related to the main topic.`);
    }
    
    return options;
  }

  private generateCodePurposeOptions(example: CodeExample): string[] {
    const options = [example.description];
    
    // Generate plausible alternatives based on code analysis
    const alternatives = [];
    
    if (example.language === 'javascript' || example.language === 'typescript') {
      alternatives.push(
        'Handles user authentication and session management',
        'Processes database queries and returns results',
        'Validates form input and displays error messages',
        'Manages component state and lifecycle methods'
      );
    } else {
      alternatives.push(
        'Configures system settings and environment variables',
        'Processes data and generates output files',
        'Handles network requests and responses',
        'Manages file operations and directory structure'
      );
    }
    
    // Add alternatives that make sense but are wrong
    while (options.length < 4 && alternatives.length > 0) {
      const alt = alternatives.shift()!;
      if (!this.isSimilar(alt, example.description)) {
        options.push(alt);
      }
    }
    
    return options;
  }

  private introduceBug(code: string, language: string): string {
    let buggyCode = code;
    
    // Introduce language-specific bugs
    if (language === 'javascript' || language === 'typescript') {
      // Missing semicolon
      buggyCode = buggyCode.replace(/;(\s*\n)/, '$1');
      
      // Wrong operator
      if (buggyCode.includes('===')) {
        buggyCode = buggyCode.replace('===', '=');
      }
      
      // Missing closing brace
      if (buggyCode.includes('}')) {
        buggyCode = buggyCode.replace(/}(\s*)$/, '$1');
      }
    }
    
    return buggyCode;
  }

  private generateBugOptions(language: string): string[] {
    const options = ['Missing closing brace'];
    
    if (language === 'javascript' || language === 'typescript') {
      return [
        'Missing closing brace',
        'Using assignment (=) instead of comparison (===)',
        'Missing semicolon',
        'Undefined variable reference'
      ];
    }
    
    return [
      'Syntax error in statement',
      'Missing required parameter',
      'Incorrect indentation',
      'Invalid character sequence'
    ];
  }

  private generateConceptOptions(correctPoint: string, sectionTitle: string): string[] {
    const options = [correctPoint];
    
    // Generate related but incorrect alternatives
    const alternatives = [
      `${sectionTitle} is primarily focused on performance optimization.`,
      `${sectionTitle} requires extensive configuration before use.`,
      `${sectionTitle} is only suitable for large-scale applications.`,
      `${sectionTitle} has been deprecated in favor of newer approaches.`
    ];
    
    alternatives.forEach(alt => {
      if (options.length < 4 && !this.isSimilar(alt, correctPoint)) {
        options.push(alt);
      }
    });
    
    return options;
  }

  private extractBenefits(wikiContent: WikiContent): string[] {
    const benefits: string[] = [];
    
    // Look for benefit patterns in content
    const benefitPatterns = [
      /benefits?[^.]*([^.]+)/gi,
      /advantages?[^.]*([^.]+)/gi,
      /helps?[^.]*([^.]+)/gi,
      /enables?[^.]*([^.]+)/gi
    ];
    
    benefitPatterns.forEach(pattern => {
      const matches = wikiContent.content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (benefits.length < 3) {
            benefits.push(match.trim());
          }
        });
      }
    });
    
    return benefits;
  }

  private generateBenefitOptions(correctBenefit: string): string[] {
    const options = [correctBenefit];
    
    const alternatives = [
      'Reduces development time by eliminating manual processes',
      'Improves code maintainability through better organization',
      'Enhances performance with optimized algorithms',
      'Provides better security through built-in protections'
    ];
    
    alternatives.forEach(alt => {
      if (options.length < 4 && !this.isSimilar(alt, correctBenefit)) {
        options.push(alt);
      }
    });
    
    return options;
  }

  private generateUseCaseOptions(wikiContent: WikiContent): string[] {
    // Generate based on category and content
    const useCases = {
      [WikiCategory.GETTING_STARTED]: [
        'When starting a new project',
        'For experienced developers only',
        'Only for enterprise applications',
        'When debugging legacy code'
      ],
      [WikiCategory.PERFORMANCE]: [
        'When optimizing application performance',
        'For basic CRUD operations',
        'When creating simple websites',
        'For one-time scripts'
      ],
      [WikiCategory.SWARM_COORDINATION]: [
        'When coordinating multiple processes',
        'For single-threaded applications',
        'When working with static content',
        'For simple data storage'
      ]
    };
    
    return useCases[wikiContent.category] || useCases[WikiCategory.GETTING_STARTED];
  }

  private extractBestPractices(wikiContent: WikiContent): string[] {
    const practices: string[] = [];
    
    // Look for best practice patterns
    const practicePatterns = [
      /best practice[^.]*([^.]+)/gi,
      /should[^.]*([^.]+)/gi,
      /recommended[^.]*([^.]+)/gi,
      /always[^.]*([^.]+)/gi
    ];
    
    practicePatterns.forEach(pattern => {
      const matches = wikiContent.content.match(pattern);
      if (matches && practices.length < 3) {
        practices.push(...matches.slice(0, 3 - practices.length));
      }
    });
    
    return practices;
  }

  private generateBestPracticeOptions(correctPractice: string): string[] {
    const options = [correctPractice];
    
    const alternatives = [
      'Always use the latest version regardless of stability',
      'Avoid documentation to keep code concise',
      'Use global variables for better performance',
      'Skip testing for simple features'
    ];
    
    alternatives.forEach(alt => {
      if (options.length < 4) {
        options.push(alt);
      }
    });
    
    return options;
  }

  private findAlternatives(wikiContent: WikiContent): string[] {
    // Extract mentioned alternatives from content
    const alternatives: string[] = [];
    
    const alternativePatterns = [
      /alternative[s]? to[^.]*([^.]+)/gi,
      /instead of[^.]*([^.]+)/gi,
      /compared to[^.]*([^.]+)/gi,
      /versus[^.]*([^.]+)/gi
    ];
    
    alternativePatterns.forEach(pattern => {
      const matches = wikiContent.content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (alternatives.length < 3) {
            alternatives.push(match.trim());
          }
        });
      }
    });
    
    // Fallback generic alternatives based on category
    if (alternatives.length === 0) {
      const genericAlternatives = {
        [WikiCategory.SWARM_COORDINATION]: ['traditional threading', 'manual coordination'],
        [WikiCategory.NEURAL_FEATURES]: ['rule-based systems', 'statistical models'],
        [WikiCategory.PERFORMANCE]: ['basic optimization', 'manual tuning']
      };
      
      alternatives.push(...(genericAlternatives[wikiContent.category] || ['other approaches']));
    }
    
    return alternatives;
  }

  private generateComparisonOptions(title: string, alternative: string): string[] {
    return [
      `${title} provides better automation and coordination`,
      `${title} is more complex and harder to learn`,
      `${title} is only suitable for small projects`,
      `${title} and ${alternative} are essentially the same`
    ];
  }

  private calculatePoints(difficulty: DifficultyLevel, type: string): number {
    const basePoints = {
      [DifficultyLevel.BEGINNER]: 10,
      [DifficultyLevel.INTERMEDIATE]: 20,
      [DifficultyLevel.ADVANCED]: 30,
      [DifficultyLevel.EXPERT]: 50
    };
    
    const typeMultiplier = {
      'definition': 1,
      'concept': 1.2,
      'code': 1.5,
      'debug': 2,
      'practical': 1.3,
      'comparison': 1.4,
      'best-practice': 1.1,
      'benefit': 1
    };
    
    return Math.round(basePoints[difficulty] * (typeMultiplier[type] || 1));
  }

  private calculateTimeLimit(difficulty: DifficultyLevel, type: string): number {
    const baseTimes = {
      [DifficultyLevel.BEGINNER]: 30,
      [DifficultyLevel.INTERMEDIATE]: 45,
      [DifficultyLevel.ADVANCED]: 60,
      [DifficultyLevel.EXPERT]: 90
    };
    
    const typeMultiplier = {
      'definition': 0.8,
      'concept': 1,
      'code': 1.5,
      'debug': 2,
      'practical': 1.2,
      'comparison': 1.3,
      'best-practice': 1,
      'benefit': 0.9
    };
    
    return Math.round(baseTimes[difficulty] * (typeMultiplier[type] || 1));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private shuffleQuestionOptions(questions: TriviaQuestion[]): TriviaQuestion[] {
    return questions.map(question => {
      const correctOption = question.options[question.correctAnswer];
      const shuffledOptions = this.shuffleArray(question.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctOption);
      
      return {
        ...question,
        options: shuffledOptions,
        correctAnswer: newCorrectIndex
      };
    });
  }

  private categorizeContent(wikiContents: WikiContent[]): Record<string, WikiContent[]> {
    const categorized: Record<string, WikiContent[]> = {};
    
    wikiContents.forEach(content => {
      const category = content.category;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(content);
    });
    
    return categorized;
  }

  private isSimilar(text1: string, text2: string): boolean {
    // Simple similarity check - could be enhanced with more sophisticated algorithms
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size > 0.3; // 30% similarity threshold
  }
}