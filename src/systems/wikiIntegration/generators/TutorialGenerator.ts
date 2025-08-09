import {
  WikiContent,
  WikiSection,
  TutorialStep,
  TutorialStepType,
  ValidationRule,
  ValidationType,
  DifficultyLevel,
  CodeExample
} from '../interfaces/WikiContent';

/**
 * Dynamic tutorial generation system based on wiki content
 */
export class TutorialGenerator {
  private stepIdCounter = 0;

  /**
   * Generate a complete tutorial from wiki content
   */
  public generateTutorial(wikiContent: WikiContent): TutorialStep[] {
    const steps: TutorialStep[] = [];

    // Introduction step
    steps.push(this.createIntroductionStep(wikiContent));

    // Process each section into tutorial steps
    wikiContent.sections.forEach(section => {
      steps.push(...this.processSectionToSteps(section, wikiContent.difficulty));
    });

    // Add summary step
    steps.push(this.createSummaryStep(wikiContent));

    // Link steps together
    this.linkSteps(steps);

    return steps;
  }

  /**
   * Generate adaptive tutorial based on user progress and preferences
   */
  public generateAdaptiveTutorial(
    wikiContent: WikiContent,
    userProgress: {
      completedTopics: string[];
      preferredLearningStyle: 'visual' | 'practical' | 'theoretical';
      skillLevel: DifficultyLevel;
    }
  ): TutorialStep[] {
    let steps = this.generateTutorial(wikiContent);

    // Adapt based on skill level
    steps = this.adaptForSkillLevel(steps, userProgress.skillLevel);

    // Adapt based on learning style
    steps = this.adaptForLearningStyle(steps, userProgress.preferredLearningStyle);

    // Filter out already known concepts
    steps = this.filterKnownConcepts(steps, userProgress.completedTopics);

    return steps;
  }

  /**
   * Generate micro-tutorial for specific concept
   */
  public generateMicroTutorial(concept: string, wikiContent: WikiContent): TutorialStep[] {
    const relevantSections = wikiContent.sections.filter(section =>
      section.title.toLowerCase().includes(concept.toLowerCase()) ||
      section.content.toLowerCase().includes(concept.toLowerCase())
    );

    if (relevantSections.length === 0) {
      return this.generateConceptExplanationSteps(concept, wikiContent);
    }

    const steps: TutorialStep[] = [];

    // Quick intro
    steps.push({
      id: this.generateStepId(),
      title: `Understanding ${concept}`,
      content: `Let's explore the concept of ${concept} in the context of Claude Flow.`,
      type: TutorialStepType.INTRODUCTION,
      interactive: false,
      hints: [`Focus on practical applications of ${concept}`],
      nextSteps: []
    });

    // Process relevant sections
    relevantSections.forEach(section => {
      steps.push(...this.processSectionToSteps(section, DifficultyLevel.INTERMEDIATE));
    });

    this.linkSteps(steps);
    return steps;
  }

  /**
   * Create introduction step
   */
  private createIntroductionStep(wikiContent: WikiContent): TutorialStep {
    const objectives = wikiContent.metadata.learningObjectives.length > 0
      ? wikiContent.metadata.learningObjectives
      : ['Understand the core concepts', 'Apply the knowledge practically'];

    const content = `
# Welcome to: ${wikiContent.title}

## What You'll Learn
${objectives.map(obj => `• ${obj}`).join('\n')}

## Estimated Time
${wikiContent.metadata.readingTime} minutes

## Prerequisites
${wikiContent.metadata.prerequisites.length > 0 
  ? wikiContent.metadata.prerequisites.map(prereq => `• ${prereq}`).join('\n')
  : '• No prerequisites required'
}

Let's begin your journey into ${wikiContent.title}!
    `;

    return {
      id: this.generateStepId(),
      title: `Introduction to ${wikiContent.title}`,
      content: content.trim(),
      type: TutorialStepType.INTRODUCTION,
      interactive: false,
      hints: [
        'Take your time to understand each concept',
        'Don\'t hesitate to review previous steps if needed',
        'Practice with the interactive examples'
      ],
      nextSteps: []
    };
  }

  /**
   * Process a wiki section into tutorial steps
   */
  private processSectionToSteps(section: WikiSection, difficulty: DifficultyLevel): TutorialStep[] {
    const steps: TutorialStep[] = [];

    // Concept explanation step
    steps.push(this.createConceptStep(section));

    // If section has code examples, create practical steps
    if (section.codeExamples && section.codeExamples.length > 0) {
      section.codeExamples.forEach(example => {
        steps.push(this.createPracticalStep(section, example));
      });
    }

    // Create exercise step if content is complex enough
    if (section.keyPoints.length > 2 || difficulty !== DifficultyLevel.BEGINNER) {
      steps.push(this.createExerciseStep(section, difficulty));
    }

    // Create quiz step for key concepts
    if (section.keyPoints.length > 0) {
      steps.push(this.createQuizStep(section));
    }

    return steps;
  }

  /**
   * Create concept explanation step
   */
  private createConceptStep(section: WikiSection): TutorialStep {
    const content = `
# ${section.title}

${section.content}

## Key Points
${section.keyPoints.map(point => `• ${point}`).join('\n')}

${section.relatedTopics.length > 0 ? `
## Related Topics
${section.relatedTopics.map(topic => `• ${topic}`).join('\n')}
` : ''}
    `;

    return {
      id: this.generateStepId(),
      title: section.title,
      content: content.trim(),
      type: TutorialStepType.CONCEPT,
      interactive: false,
      hints: [
        'Read through the concept carefully',
        'Pay attention to the key points',
        'Consider how this relates to your current knowledge'
      ],
      nextSteps: []
    };
  }

  /**
   * Create practical step with code example
   */
  private createPracticalStep(section: WikiSection, example: CodeExample): TutorialStep {
    const content = `
# Hands-on: ${example.description}

Let's put the concept into practice with this ${example.language} example:

\`\`\`${example.language}
${example.code}
\`\`\`

## Your Task
Try to understand what this code does and think about:
1. What problem does it solve?
2. How does it relate to the concept we just learned?
3. Can you identify any patterns or best practices?

## Code Analysis
${this.generateCodeAnalysis(example)}
    `;

    return {
      id: this.generateStepId(),
      title: `Practice: ${example.description}`,
      content: content.trim(),
      type: TutorialStepType.PRACTICAL,
      interactive: true,
      codeExample: example,
      hints: [
        'Read the code line by line',
        'Try to trace the execution flow',
        'Look for familiar patterns',
        'Consider edge cases'
      ],
      nextSteps: []
    };
  }

  /**
   * Create exercise step
   */
  private createExerciseStep(section: WikiSection, difficulty: DifficultyLevel): TutorialStep {
    const exercises = this.generateExercises(section, difficulty);
    const selectedExercise = exercises[0]; // For now, just take the first

    return {
      id: this.generateStepId(),
      title: `Exercise: ${section.title}`,
      content: selectedExercise.content,
      type: TutorialStepType.EXERCISE,
      interactive: true,
      validation: selectedExercise.validation,
      hints: selectedExercise.hints,
      nextSteps: []
    };
  }

  /**
   * Create quiz step
   */
  private createQuizStep(section: WikiSection): TutorialStep {
    const questions = this.generateQuizQuestions(section);
    const content = `
# Quick Check: ${section.title}

Let's test your understanding of the key concepts:

${questions.map((q, i) => `
## Question ${i + 1}
${q.question}

${q.options.map((option, j) => `${String.fromCharCode(65 + j)}. ${option}`).join('\n')}
`).join('\n')}
    `;

    return {
      id: this.generateStepId(),
      title: `Quiz: ${section.title}`,
      content: content.trim(),
      type: TutorialStepType.QUIZ,
      interactive: true,
      hints: [
        'Think about the key points we just covered',
        'Refer back to the concept if needed',
        'Don\'t guess - understanding is more important than speed'
      ],
      nextSteps: []
    };
  }

  /**
   * Create summary step
   */
  private createSummaryStep(wikiContent: WikiContent): TutorialStep {
    const keyLearnings = wikiContent.sections.flatMap(s => s.keyPoints).slice(0, 5);
    
    const content = `
# Congratulations! 🎉

You've completed the tutorial on **${wikiContent.title}**.

## What You've Learned
${keyLearnings.map(learning => `✅ ${learning}`).join('\n')}

## Next Steps
${this.generateNextSteps(wikiContent)}

## Keep Practicing
The best way to master these concepts is through regular practice. Look for opportunities to apply what you've learned in real projects.

## Review Resources
- Return to any section for review
- Explore related topics: ${wikiContent.sections.flatMap(s => s.relatedTopics).slice(0, 3).join(', ')}
- Practice with more examples

Great job on completing this tutorial! 🚀
    `;

    return {
      id: this.generateStepId(),
      title: `Summary: ${wikiContent.title}`,
      content: content.trim(),
      type: TutorialStepType.SUMMARY,
      interactive: false,
      hints: [
        'Review the key learnings',
        'Bookmark this for future reference',
        'Share your progress with the community'
      ],
      nextSteps: []
    };
  }

  /**
   * Link steps together with next step references
   */
  private linkSteps(steps: TutorialStep[]): void {
    for (let i = 0; i < steps.length - 1; i++) {
      steps[i].nextSteps = [steps[i + 1].id];
    }
  }

  /**
   * Adapt tutorial for different skill levels
   */
  private adaptForSkillLevel(steps: TutorialStep[], skillLevel: DifficultyLevel): TutorialStep[] {
    switch (skillLevel) {
      case DifficultyLevel.BEGINNER:
        return this.addBeginnerSupport(steps);
      case DifficultyLevel.EXPERT:
        return this.addExpertChallenges(steps);
      default:
        return steps;
    }
  }

  /**
   * Adapt tutorial for different learning styles
   */
  private adaptForLearningStyle(
    steps: TutorialStep[], 
    learningStyle: 'visual' | 'practical' | 'theoretical'
  ): TutorialStep[] {
    switch (learningStyle) {
      case 'practical':
        return this.emphasizePracticalSteps(steps);
      case 'visual':
        return this.addVisualElements(steps);
      case 'theoretical':
        return this.addTheoreticalDepth(steps);
      default:
        return steps;
    }
  }

  /**
   * Filter out concepts the user already knows
   */
  private filterKnownConcepts(steps: TutorialStep[], completedTopics: string[]): TutorialStep[] {
    return steps.filter(step => {
      const stepTopics = this.extractTopicsFromStep(step);
      return !stepTopics.every(topic => completedTopics.includes(topic));
    });
  }

  // Helper methods

  private generateStepId(): string {
    return `step-${++this.stepIdCounter}`;
  }

  private generateCodeAnalysis(example: CodeExample): string {
    const analysis = [];
    
    if (example.language === 'javascript' || example.language === 'typescript') {
      if (example.code.includes('async')) {
        analysis.push('• Uses asynchronous programming patterns');
      }
      if (example.code.includes('class')) {
        analysis.push('• Demonstrates object-oriented programming');
      }
      if (example.code.includes('=>')) {
        analysis.push('• Uses arrow functions for concise syntax');
      }
    }
    
    analysis.push(`• Complexity level: ${example.difficulty}`);
    analysis.push(`• Key concepts: ${example.tags.join(', ')}`);
    
    return analysis.join('\n');
  }

  private generateExercises(section: WikiSection, difficulty: DifficultyLevel) {
    const exercises = [];
    
    // Generate different types of exercises based on content
    if (section.codeExamples && section.codeExamples.length > 0) {
      exercises.push({
        content: `
# Exercise: Modify the Code

Based on the code example you just saw, try to:

1. **Explain** what the code does in your own words
2. **Identify** any potential improvements
3. **Suggest** how you might modify it for a different use case

**Your Answer:**
[Type your response here]
        `,
        validation: {
          type: ValidationType.CONTAINS,
          pattern: 'explain|identify|suggest',
          errorMessage: 'Please address all three points in your answer'
        } as ValidationRule,
        hints: [
          'Think about the core functionality first',
          'Consider error handling and edge cases',
          'Look for opportunities to make the code more reusable'
        ]
      });
    }
    
    // Conceptual exercise
    exercises.push({
      content: `
# Exercise: Apply the Concept

Using the key concepts from this section:
${section.keyPoints.map(point => `• ${point}`).join('\n')}

**Challenge:** Write a brief explanation of how you would apply these concepts in a real-world scenario.

**Your Response:**
[Describe your scenario and application here]
      `,
      validation: {
        type: ValidationType.CUSTOM,
        customValidator: (input: string) => input.length > 50 && input.includes('scenario'),
        errorMessage: 'Please provide a detailed scenario with practical application'
      } as ValidationRule,
      hints: [
        'Think of a specific problem you could solve',
        'Connect the concepts to practical benefits',
        'Be specific about implementation details'
      ]
    });
    
    return exercises;
  }

  private generateQuizQuestions(section: WikiSection) {
    const questions = [];
    
    // Generate question from key points
    if (section.keyPoints.length > 0) {
      const keyPoint = section.keyPoints[0];
      questions.push({
        question: `What is the main benefit of ${keyPoint.toLowerCase()}?`,
        options: [
          'Improved performance',
          'Better code organization',
          'Enhanced debugging',
          'All of the above'
        ],
        correctAnswer: 3, // "All of the above" is often a safe bet for concept questions
        explanation: `${keyPoint} typically provides multiple benefits including performance, organization, and debugging improvements.`
      });
    }
    
    return questions.slice(0, 2); // Limit to 2 questions per quiz
  }

  private generateNextSteps(wikiContent: WikiContent): string {
    const suggestions = [];
    
    // Suggest related content
    const relatedTopics = wikiContent.sections.flatMap(s => s.relatedTopics);
    if (relatedTopics.length > 0) {
      suggestions.push(`Explore related topics: ${relatedTopics.slice(0, 3).join(', ')}`);
    }
    
    // Suggest practice
    if (wikiContent.sections.some(s => s.codeExamples && s.codeExamples.length > 0)) {
      suggestions.push('Practice with similar code examples in your own projects');
    }
    
    // Suggest advanced content
    if (wikiContent.difficulty !== DifficultyLevel.EXPERT) {
      suggestions.push('Look for advanced tutorials on this topic');
    }
    
    return suggestions.map(s => `• ${s}`).join('\n');
  }

  private generateConceptExplanationSteps(concept: string, wikiContent: WikiContent): TutorialStep[] {
    // Fallback when specific concept isn't found
    return [{
      id: this.generateStepId(),
      title: `Understanding ${concept}`,
      content: `
# ${concept}

While we don't have specific content about "${concept}" in this tutorial, let's explore what we can learn from the available information.

## What We Know
Based on the context of ${wikiContent.title}, ${concept} likely relates to:
${wikiContent.tags.filter(tag => tag.includes(concept.toLowerCase())).map(tag => `• ${tag}`).join('\n')}

## Exploration Exercise
Research ${concept} and write a brief explanation of how it applies to ${wikiContent.category}.
      `,
      type: TutorialStepType.EXERCISE,
      interactive: true,
      hints: [
        `Look for connections between ${concept} and ${wikiContent.category}`,
        'Consider practical applications',
        'Think about why this concept would be important'
      ],
      nextSteps: []
    }];
  }

  private addBeginnerSupport(steps: TutorialStep[]): TutorialStep[] {
    return steps.map(step => ({
      ...step,
      hints: [
        'Take your time - there\'s no rush',
        'It\'s okay to not understand everything immediately',
        ...step.hints,
        'Ask for help if you get stuck'
      ]
    }));
  }

  private addExpertChallenges(steps: TutorialStep[]): TutorialStep[] {
    return steps.map(step => {
      if (step.type === TutorialStepType.EXERCISE) {
        return {
          ...step,
          content: step.content + '\n\n**Expert Challenge:** Can you think of 2-3 alternative approaches to solve this problem?',
          hints: [
            'Consider performance implications',
            'Think about scalability',
            'Explore edge cases'
          ]
        };
      }
      return step;
    });
  }

  private emphasizePracticalSteps(steps: TutorialStep[]): TutorialStep[] {
    // Add more practical examples and reduce theoretical content
    return steps.filter(step => 
      step.type === TutorialStepType.PRACTICAL || 
      step.type === TutorialStepType.EXERCISE ||
      step.type === TutorialStepType.INTRODUCTION ||
      step.type === TutorialStepType.SUMMARY
    );
  }

  private addVisualElements(steps: TutorialStep[]): TutorialStep[] {
    return steps.map(step => ({
      ...step,
      content: step.content + '\n\n*Note: Visualize the concepts as you read - imagine the code flow and data structures.*'
    }));
  }

  private addTheoreticalDepth(steps: TutorialStep[]): TutorialStep[] {
    return steps.map(step => {
      if (step.type === TutorialStepType.CONCEPT) {
        return {
          ...step,
          content: step.content + '\n\n## Theoretical Background\nConsider the underlying principles and design patterns that make this concept effective.'
        };
      }
      return step;
    });
  }

  private extractTopicsFromStep(step: TutorialStep): string[] {
    const topics = [];
    
    // Extract from title
    const titleWords = step.title.toLowerCase().split(/\s+/);
    topics.push(...titleWords.filter(word => word.length > 3));
    
    // Extract from content (basic keyword extraction)
    const contentWords = step.content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const commonWords = new Set(['this', 'that', 'with', 'from', 'they', 'will', 'have', 'been', 'code', 'step']);
    
    contentWords.forEach(word => {
      if (!commonWords.has(word) && topics.length < 10) {
        topics.push(word);
      }
    });
    
    return [...new Set(topics)];
  }
}