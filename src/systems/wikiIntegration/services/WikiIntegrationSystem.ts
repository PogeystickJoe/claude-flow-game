import {
  WikiContent,
  WikiSection,
  WikiCategory,
  DifficultyLevel,
  ComplexityLevel,
  WikiMetadata,
  CodeExample,
  WikiSearchResult,
  LearningPath
} from '../interfaces/WikiContent';

/**
 * Core system for processing and integrating wiki content into game elements
 */
export class WikiIntegrationSystem {
  private wikiContent: Map<string, WikiContent> = new Map();
  private categoryIndex: Map<WikiCategory, string[]> = new Map();
  private tagIndex: Map<string, string[]> = new Map();
  private difficultyIndex: Map<DifficultyLevel, string[]> = new Map();

  constructor() {
    this.initializeIndexes();
  }

  /**
   * Initialize all indexing structures
   */
  private initializeIndexes(): void {
    // Initialize category index
    Object.values(WikiCategory).forEach(category => {
      this.categoryIndex.set(category, []);
    });

    // Initialize difficulty index
    Object.values(DifficultyLevel).forEach(difficulty => {
      this.difficultyIndex.set(difficulty, []);
    });
  }

  /**
   * Add wiki content to the system
   */
  public addWikiContent(content: WikiContent): void {
    this.wikiContent.set(content.id, content);
    this.updateIndexes(content);
  }

  /**
   * Process raw wiki markdown content into structured WikiContent
   */
  public processWikiMarkdown(id: string, markdown: string, metadata: Partial<WikiMetadata> = {}): WikiContent {
    const sections = this.parseMarkdownSections(markdown);
    const codeExamples = this.extractCodeExamples(markdown);
    const tags = this.extractTags(markdown);
    const keyPoints = this.extractKeyPoints(sections);
    
    const processedMetadata: WikiMetadata = {
      author: metadata.author || 'Claude Flow Team',
      contributors: metadata.contributors || [],
      readingTime: this.calculateReadingTime(markdown),
      prerequisites: this.extractPrerequisites(markdown),
      learningObjectives: this.extractLearningObjectives(markdown),
      complexity: this.assessComplexity(markdown, codeExamples),
      practicalExamples: codeExamples.length
    };

    const wikiContent: WikiContent = {
      id,
      title: this.extractTitle(markdown),
      category: this.categorizeContent(markdown, tags),
      content: markdown,
      metadata: processedMetadata,
      sections,
      tags,
      difficulty: this.assessDifficulty(processedMetadata.complexity, codeExamples.length),
      lastUpdated: new Date()
    };

    this.addWikiContent(wikiContent);
    return wikiContent;
  }

  /**
   * Parse markdown into structured sections
   */
  private parseMarkdownSections(markdown: string): WikiSection[] {
    const lines = markdown.split('\n');
    const sections: WikiSection[] = [];
    let currentSection: WikiSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n');
          currentSection.keyPoints = this.extractKeyPointsFromContent(currentSection.content);
          currentSection.relatedTopics = this.extractRelatedTopics(currentSection.content);
          sections.push(currentSection);
        }

        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        
        currentSection = {
          id: this.generateSectionId(title),
          title,
          content: '',
          keyPoints: [],
          relatedTopics: [],
          codeExamples: this.extractCodeExamplesFromSection(line)
        };
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n');
      currentSection.keyPoints = this.extractKeyPointsFromContent(currentSection.content);
      currentSection.relatedTopics = this.extractRelatedTopics(currentSection.content);
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract code examples from markdown
   */
  private extractCodeExamples(markdown: string): CodeExample[] {
    const codeBlocks = markdown.match(/```(\w+)?\n([\s\S]*?)```/g) || [];
    const examples: CodeExample[] = [];

    codeBlocks.forEach((block, index) => {
      const match = block.match(/```(\w+)?\n([\s\S]*?)```/);
      if (match) {
        const language = match[1] || 'text';
        const code = match[2].trim();
        
        examples.push({
          id: `code-${index}`,
          language,
          code,
          description: this.inferCodeDescription(code, language),
          difficulty: this.assessCodeDifficulty(code, language),
          tags: this.extractCodeTags(code, language)
        });
      }
    });

    return examples;
  }

  /**
   * Extract tags from markdown content
   */
  private extractTags(markdown: string): string[] {
    const tags = new Set<string>();
    
    // Extract from common patterns
    const patterns = [
      /\*\*([\w\s-]+)\*\*/g, // Bold text
      /`([^`]+)`/g, // Inline code
      /#(\w+)/g, // Hashtags
      /\[([^\]]+)\]/g // Links
    ];

    patterns.forEach(pattern => {
      const matches = markdown.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clean = match.replace(/[*`#\[\]]/g, '').toLowerCase().trim();
          if (clean.length > 2 && clean.length < 20) {
            tags.add(clean);
          }
        });
      }
    });

    return Array.from(tags);
  }

  /**
   * Search wiki content
   */
  public searchContent(query: string, filters: {
    category?: WikiCategory;
    difficulty?: DifficultyLevel;
    tags?: string[];
  } = {}): WikiSearchResult[] {
    const results: WikiSearchResult[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);

    for (const content of this.wikiContent.values()) {
      // Apply filters
      if (filters.category && content.category !== filters.category) continue;
      if (filters.difficulty && content.difficulty !== filters.difficulty) continue;
      if (filters.tags?.some(tag => !content.tags.includes(tag))) continue;

      const relevanceScore = this.calculateRelevanceScore(content, queryTerms);
      if (relevanceScore > 0) {
        results.push({
          content,
          relevanceScore,
          matchedTerms: this.getMatchedTerms(content, queryTerms),
          snippet: this.generateSnippet(content, queryTerms)
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Generate learning paths based on difficulty progression
   */
  public generateLearningPath(startLevel: DifficultyLevel, category?: WikiCategory): LearningPath {
    const difficulties = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT];
    const startIndex = difficulties.indexOf(startLevel);
    const pathContent: string[] = [];

    for (let i = startIndex; i < difficulties.length; i++) {
      const levelContent = this.getContentByDifficulty(difficulties[i], category);
      pathContent.push(...levelContent.slice(0, 3)); // Limit per level
    }

    return {
      id: `path-${category || 'general'}-${startLevel}`,
      title: `${category ? this.formatCategoryName(category) : 'General'} Learning Path`,
      description: `Progressive learning path starting from ${startLevel} level`,
      difficulty: startLevel,
      estimatedTime: this.calculatePathTime(pathContent),
      prerequisites: this.getPathPrerequisites(pathContent),
      wikiContentIds: pathContent,
      milestones: this.generatePathMilestones(pathContent)
    };
  }

  // Private helper methods

  private updateIndexes(content: WikiContent): void {
    // Update category index
    const categoryContent = this.categoryIndex.get(content.category) || [];
    categoryContent.push(content.id);
    this.categoryIndex.set(content.category, categoryContent);

    // Update tag index
    content.tags.forEach(tag => {
      const tagContent = this.tagIndex.get(tag) || [];
      tagContent.push(content.id);
      this.tagIndex.set(tag, tagContent);
    });

    // Update difficulty index
    const difficultyContent = this.difficultyIndex.get(content.difficulty) || [];
    difficultyContent.push(content.id);
    this.difficultyIndex.set(content.difficulty, difficultyContent);
  }

  private extractTitle(markdown: string): string {
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : 'Untitled';
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private extractPrerequisites(markdown: string): string[] {
    const prereqMatch = markdown.match(/prerequisite[s]?:?\s*(.+)/i);
    if (prereqMatch) {
      return prereqMatch[1].split(',').map(p => p.trim());
    }
    return [];
  }

  private extractLearningObjectives(markdown: string): string[] {
    const objectives: string[] = [];
    const lines = markdown.split('\n');
    
    let inObjectives = false;
    for (const line of lines) {
      if (/learning objectives?|you will learn/i.test(line)) {
        inObjectives = true;
        continue;
      }
      
      if (inObjectives && line.match(/^[-*]\s+(.+)$/)) {
        objectives.push(line.replace(/^[-*]\s+/, ''));
      } else if (inObjectives && line.trim() === '') {
        continue;
      } else if (inObjectives) {
        break;
      }
    }
    
    return objectives;
  }

  private assessComplexity(markdown: string, codeExamples: CodeExample[]): ComplexityLevel {
    let complexity = 0;
    
    // Factor in content length
    complexity += Math.min(markdown.length / 5000, 2);
    
    // Factor in code examples
    complexity += codeExamples.length * 0.5;
    
    // Factor in technical terms
    const technicalTerms = ['async', 'await', 'promise', 'callback', 'closure', 'prototype'];
    const termCount = technicalTerms.filter(term => 
      markdown.toLowerCase().includes(term)
    ).length;
    complexity += termCount * 0.3;

    if (complexity < 1) return ComplexityLevel.LOW;
    if (complexity < 2.5) return ComplexityLevel.MEDIUM;
    if (complexity < 4) return ComplexityLevel.HIGH;
    return ComplexityLevel.VERY_HIGH;
  }

  private categorizeContent(markdown: string, tags: string[]): WikiCategory {
    const categoryKeywords = {
      [WikiCategory.GETTING_STARTED]: ['introduction', 'setup', 'install', 'quick start', 'getting started'],
      [WikiCategory.SPARC_METHODOLOGY]: ['sparc', 'specification', 'pseudocode', 'architecture', 'refinement'],
      [WikiCategory.SWARM_COORDINATION]: ['swarm', 'agent', 'coordination', 'parallel', 'distributed'],
      [WikiCategory.NEURAL_FEATURES]: ['neural', 'ai', 'machine learning', 'model', 'training'],
      [WikiCategory.GITHUB_INTEGRATION]: ['github', 'git', 'repository', 'pr', 'pull request'],
      [WikiCategory.PERFORMANCE]: ['performance', 'optimization', 'benchmark', 'speed', 'efficiency'],
      [WikiCategory.BEST_PRACTICES]: ['best practice', 'convention', 'standard', 'guideline'],
      [WikiCategory.ADVANCED_FEATURES]: ['advanced', 'expert', 'complex', 'sophisticated'],
      [WikiCategory.TROUBLESHOOTING]: ['troubleshoot', 'debug', 'error', 'problem', 'issue'],
      [WikiCategory.EXAMPLES]: ['example', 'tutorial', 'demo', 'sample', 'walkthrough']
    };

    const content = markdown.toLowerCase();
    let maxScore = 0;
    let bestCategory = WikiCategory.GETTING_STARTED;

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (content.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category as WikiCategory;
      }
    });

    return bestCategory;
  }

  private assessDifficulty(complexity: ComplexityLevel, codeExampleCount: number): DifficultyLevel {
    let score = 0;
    
    switch (complexity) {
      case ComplexityLevel.LOW: score += 1; break;
      case ComplexityLevel.MEDIUM: score += 2; break;
      case ComplexityLevel.HIGH: score += 3; break;
      case ComplexityLevel.VERY_HIGH: score += 4; break;
    }
    
    score += Math.min(codeExampleCount, 3);
    
    if (score <= 2) return DifficultyLevel.BEGINNER;
    if (score <= 4) return DifficultyLevel.INTERMEDIATE;
    if (score <= 6) return DifficultyLevel.ADVANCED;
    return DifficultyLevel.EXPERT;
  }

  private extractKeyPoints(sections: WikiSection[]): string[] {
    const keyPoints: string[] = [];
    sections.forEach(section => {
      keyPoints.push(...section.keyPoints);
    });
    return keyPoints;
  }

  private extractKeyPointsFromContent(content: string): string[] {
    const points: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const bulletMatch = line.match(/^[-*]\s+(.+)$/);
      if (bulletMatch) {
        points.push(bulletMatch[1]);
      }
    });
    
    return points.slice(0, 5); // Limit key points
  }

  private extractRelatedTopics(content: string): string[] {
    const topics: string[] = [];
    const linkMatches = content.match(/\[([^\]]+)\]/g);
    
    if (linkMatches) {
      linkMatches.forEach(match => {
        const topic = match.replace(/[\[\]]/g, '');
        if (topic.length > 3 && topic.length < 30) {
          topics.push(topic);
        }
      });
    }
    
    return topics.slice(0, 10);
  }

  private generateSectionId(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private extractCodeExamplesFromSection(content: string): CodeExample[] {
    return this.extractCodeExamples(content);
  }

  private inferCodeDescription(code: string, language: string): string {
    const lines = code.split('\n');
    const firstLine = lines[0].trim();
    
    if (firstLine.startsWith('//') || firstLine.startsWith('#')) {
      return firstLine.replace(/^[\/\#]\s*/, '');
    }
    
    // Try to infer from code structure
    if (language === 'javascript' || language === 'typescript') {
      if (code.includes('async') && code.includes('await')) {
        return 'Asynchronous operation example';
      }
      if (code.includes('class')) {
        return 'Class definition example';
      }
      if (code.includes('function')) {
        return 'Function implementation example';
      }
    }
    
    return `${language} code example`;
  }

  private assessCodeDifficulty(code: string, language: string): DifficultyLevel {
    let complexity = 0;
    
    // Line count factor
    const lineCount = code.split('\n').length;
    complexity += Math.min(lineCount / 10, 2);
    
    // Advanced patterns
    const advancedPatterns = [
      'async', 'await', 'Promise', 'callback',
      'class', 'extends', 'interface', 'generic',
      'recursion', 'closure', 'decorator'
    ];
    
    advancedPatterns.forEach(pattern => {
      if (code.includes(pattern)) complexity += 0.5;
    });
    
    if (complexity < 1) return DifficultyLevel.BEGINNER;
    if (complexity < 2.5) return DifficultyLevel.INTERMEDIATE;
    if (complexity < 4) return DifficultyLevel.ADVANCED;
    return DifficultyLevel.EXPERT;
  }

  private extractCodeTags(code: string, language: string): string[] {
    const tags = [language];
    
    if (code.includes('async') || code.includes('await')) tags.push('asynchronous');
    if (code.includes('class')) tags.push('oop');
    if (code.includes('interface')) tags.push('typescript');
    if (code.includes('test') || code.includes('expect')) tags.push('testing');
    
    return tags;
  }

  private calculateRelevanceScore(content: WikiContent, queryTerms: string[]): number {
    let score = 0;
    const searchText = (content.title + ' ' + content.content + ' ' + content.tags.join(' ')).toLowerCase();
    
    queryTerms.forEach(term => {
      const termCount = (searchText.match(new RegExp(term, 'g')) || []).length;
      score += termCount;
      
      // Boost for title matches
      if (content.title.toLowerCase().includes(term)) {
        score += 5;
      }
      
      // Boost for tag matches
      if (content.tags.some(tag => tag.includes(term))) {
        score += 3;
      }
    });
    
    return score;
  }

  private getMatchedTerms(content: WikiContent, queryTerms: string[]): string[] {
    const searchText = (content.title + ' ' + content.content).toLowerCase();
    return queryTerms.filter(term => searchText.includes(term));
  }

  private generateSnippet(content: WikiContent, queryTerms: string[]): string {
    const sentences = content.content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (queryTerms.some(term => sentence.toLowerCase().includes(term))) {
        return sentence.trim().substring(0, 200) + '...';
      }
    }
    
    return content.content.substring(0, 200) + '...';
  }

  private getContentByDifficulty(difficulty: DifficultyLevel, category?: WikiCategory): string[] {
    const difficultyContent = this.difficultyIndex.get(difficulty) || [];
    
    if (category) {
      const categoryContent = this.categoryIndex.get(category) || [];
      return difficultyContent.filter(id => categoryContent.includes(id));
    }
    
    return difficultyContent;
  }

  private formatCategoryName(category: WikiCategory): string {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private calculatePathTime(contentIds: string[]): number {
    return contentIds.reduce((total, id) => {
      const content = this.wikiContent.get(id);
      return total + (content?.metadata.readingTime || 5);
    }, 0);
  }

  private getPathPrerequisites(contentIds: string[]): string[] {
    const prerequisites = new Set<string>();
    
    contentIds.forEach(id => {
      const content = this.wikiContent.get(id);
      content?.metadata.prerequisites.forEach(prereq => prerequisites.add(prereq));
    });
    
    return Array.from(prerequisites);
  }

  private generatePathMilestones(contentIds: string[]): any[] {
    const milestones: any[] = [];
    const chunkSize = Math.ceil(contentIds.length / 4);
    
    for (let i = 0; i < contentIds.length; i += chunkSize) {
      const chunk = contentIds.slice(i, i + chunkSize);
      milestones.push({
        id: `milestone-${i / chunkSize}`,
        title: `Milestone ${Math.floor(i / chunkSize) + 1}`,
        description: `Complete ${chunk.length} topics`,
        requiredContent: chunk,
        unlocks: [],
        reward: {
          type: 'experience',
          value: chunk.length * 50,
          description: `${chunk.length * 50} XP for milestone completion`
        }
      });
    }
    
    return milestones;
  }

  // Public getters for game integration
  public getContentById(id: string): WikiContent | undefined {
    return this.wikiContent.get(id);
  }

  public getContentByCategory(category: WikiCategory): WikiContent[] {
    const contentIds = this.categoryIndex.get(category) || [];
    return contentIds.map(id => this.wikiContent.get(id)!).filter(Boolean);
  }

  public getAllContent(): WikiContent[] {
    return Array.from(this.wikiContent.values());
  }

  public getCategories(): WikiCategory[] {
    return Object.values(WikiCategory);
  }

  public getContentStats(): {
    total: number;
    byCategory: Record<WikiCategory, number>;
    byDifficulty: Record<DifficultyLevel, number>;
  } {
    const stats = {
      total: this.wikiContent.size,
      byCategory: {} as Record<WikiCategory, number>,
      byDifficulty: {} as Record<DifficultyLevel, number>
    };

    // Initialize counters
    Object.values(WikiCategory).forEach(cat => stats.byCategory[cat] = 0);
    Object.values(DifficultyLevel).forEach(diff => stats.byDifficulty[diff] = 0);

    // Count content
    for (const content of this.wikiContent.values()) {
      stats.byCategory[content.category]++;
      stats.byDifficulty[content.difficulty]++;
    }

    return stats;
  }
}