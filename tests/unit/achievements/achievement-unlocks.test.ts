import { jest } from '@jest/globals';
import { GameStateFactory } from '@tests/factories/game-state-factory';
import { createSwarmTestSuite, resetAllSwarmMocks } from '@mocks/claude-flow-mocks';

/**
 * Achievement Unlock System Tests - London School TDD
 * "Achievements are the breadcrumbs on the path to rUv enlightenment"
 * - The Chronicles of Claude, Volume IV
 */

describe('Achievement Unlock System', () => {
  let mockSuite: ReturnType<typeof createSwarmTestSuite>;
  let achievementService: AchievementService;
  let mockNotificationSender: jest.Mocked<NotificationSender>;
  let mockProgressTracker: jest.Mocked<ProgressTracker>;
  let mockRarityCalculator: jest.Mocked<RarityCalculator>;
  let mockEasterEggValidator: jest.Mocked<EasterEggValidator>;

  beforeEach(() => {
    resetAllSwarmMocks();
    mockSuite = createSwarmTestSuite();
    
    // Mock collaborating services
    mockNotificationSender = {
      sendAchievementNotification: jest.fn(),
      sendRarityFanfare: jest.fn()
    };
    
    mockProgressTracker = {
      getPlayerProgress: jest.fn(),
      updateProgress: jest.fn(),
      checkMilestones: jest.fn()
    };
    
    mockRarityCalculator = {
      calculateRarity: jest.fn(),
      getGlobalStats: jest.fn()
    };
    
    mockEasterEggValidator = {
      validateEasterEgg: jest.fn(),
      checkSecretConditions: jest.fn()
    };

    // System under test with all dependencies injected
    achievementService = new AchievementService(
      mockNotificationSender,
      mockProgressTracker,
      mockRarityCalculator,
      mockEasterEggValidator,
      mockSuite.memoryManager
    );
  });

  describe('First Steps Achievement (The Gateway Drug)', () => {
    it('should coordinate first command achievement unlock with proper fanfare', async () => {
      // Given: A virgin player about to experience their first command
      const newPlayer = GameStateFactory.createPlayer();
      const firstCommand = { command: 'npx claude-flow init', success: true, tokensUsed: 42 };
      
      mockProgressTracker.getPlayerProgress.mockResolvedValue({ commandsRun: 0, achievements: [] });
      mockRarityCalculator.calculateRarity.mockReturnValue('common');
      mockNotificationSender.sendAchievementNotification.mockResolvedValue({ delivered: true });

      // When: The first command blessing occurs
      const result = await achievementService.processCommandCompletion(newPlayer, firstCommand);

      // Then: Witness the beautiful orchestration of first achievement
      expect(mockProgressTracker.getPlayerProgress).toHaveBeenCalledWith(newPlayer.id);
      expect(mockRarityCalculator.calculateRarity).toHaveBeenCalledWith('first-steps');
      expect(mockNotificationSender.sendAchievementNotification).toHaveBeenCalledWith({
        playerId: newPlayer.id,
        achievement: expect.objectContaining({
          id: 'first-steps',
          name: 'First Steps',
          rarity: 'common'
        }),
        wittyMessage: expect.stringContaining('swarm')
      });
      
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        `player-${newPlayer.id}-achievements`,
        expect.arrayContaining([expect.objectContaining({ id: 'first-steps' })])
      );

      console.log('🎉 Virgin no more! The swarm has claimed another soul!');
    });
  });

  describe('Puppet Master Achievement (Agent Orchestration)', () => {
    it('should unlock when player demonstrates multi-agent coordination mastery', async () => {
      // Given: A player juggling multiple agents like a circus performer
      const apprenticePlayer = GameStateFactory.createPlayer({ level: 2, xp: 200 });
      const multiAgentCommand = {
        command: 'orchestrate',
        agentsUsed: ['researcher', 'coder', 'tester'],
        simultaneousControl: true,
        success: true
      };

      mockProgressTracker.getPlayerProgress.mockResolvedValue({
        simultaneousAgents: 2, // Just below threshold
        commandsRun: 50
      });
      
      mockProgressTracker.checkMilestones.mockResolvedValue(['puppet-master']);
      mockRarityCalculator.calculateRarity.mockReturnValue('rare');
      mockNotificationSender.sendRarityFanfare.mockResolvedValue({ confettiLaunched: true });

      // When: The puppeteer pulls all the strings
      const result = await achievementService.processCommandCompletion(apprenticePlayer, multiAgentCommand);

      // Then: The orchestration should be celebrated
      expect(mockProgressTracker.checkMilestones).toHaveBeenCalledWith(
        expect.objectContaining({ simultaneousAgents: 3 })
      );
      expect(mockNotificationSender.sendRarityFanfare).toHaveBeenCalledWith('rare');
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        `achievement-puppet-master-${apprenticePlayer.id}`,
        expect.objectContaining({
          unlockedAt: expect.any(Date),
          agentsControlled: 3,
          epicQuote: expect.stringContaining('strings')
        })
      );

      console.log('🎪 The puppet master emerges! Agents dance to their command!');
    });
  });

  describe('Test Driven Achievement (TDD Warrior)', () => {
    it('should track TDD cycles and unlock achievement at 10 completions', async () => {
      // Given: A developer on their TDD journey
      const coderPlayer = GameStateFactory.createPlayer({ level: 3 });
      const tddCycle = {
        phase: 'completed_cycle',
        testWritten: true,
        implementationSuccessful: true,
        refactored: true,
        redGreenRefactor: true
      };

      mockProgressTracker.getPlayerProgress.mockResolvedValue({
        tddCycles: 9, // One away from glory
        testFirstApproach: 0.95
      });

      mockProgressTracker.checkMilestones.mockResolvedValue(['test-driven']);
      mockRarityCalculator.calculateRarity.mockReturnValue('epic');

      // When: The 10th TDD cycle completes
      const result = await achievementService.processTDDCycle(coderPlayer, tddCycle);

      // Then: Celebrate the TDD mastery
      expect(mockProgressTracker.updateProgress).toHaveBeenCalledWith(
        coderPlayer.id,
        expect.objectContaining({ tddCycles: 10 })
      );
      
      expect(mockNotificationSender.sendAchievementNotification).toHaveBeenCalledWith({
        playerId: coderPlayer.id,
        achievement: expect.objectContaining({
          id: 'test-driven',
          secretMessage: expect.stringContaining('Red, Green, Refactor')
        })
      });

      console.log('🔴🟢🔄 TDD warrior achieved! Kent Beck would be proud!');
    });
  });

  describe('Master Builder Achievement (Architecture Mastery)', () => {
    it('should unlock when all topology types are successfully implemented', async () => {
      // Given: An architect who has been busy building
      const architectPlayer = GameStateFactory.createPlayer({ level: 4, xp: 1500 });
      const topologyCompletion = {
        topology: 'ring', // Final one needed
        success: true,
        performance: 0.89
      };

      mockProgressTracker.getPlayerProgress.mockResolvedValue({
        topologiesBuilt: ['hierarchical', 'mesh'], // Missing ring and star
        architecturalSkill: 0.88
      });

      // Mock the milestone check to recognize completion
      mockProgressTracker.checkMilestones.mockImplementation((progress) => {
        if (progress.topologiesBuilt.length >= 3) {
          return Promise.resolve(['master-builder']);
        }
        return Promise.resolve([]);
      });

      mockRarityCalculator.calculateRarity.mockReturnValue('legendary');

      // When: The final topology is conquered
      const result = await achievementService.processTopologyCompletion(architectPlayer, topologyCompletion);

      // Then: Architectural mastery should be recognized
      expect(mockProgressTracker.updateProgress).toHaveBeenCalledWith(
        architectPlayer.id,
        expect.objectContaining({
          topologiesBuilt: expect.arrayContaining(['hierarchical', 'mesh', 'ring'])
        })
      );

      expect(mockNotificationSender.sendRarityFanfare).toHaveBeenCalledWith('legendary');
      
      console.log('🏗️ Master builder achieved! Frank Lloyd Wright of swarms!');
    });
  });

  describe('Mind Meld Achievement (Neural Mastery)', () => {
    it('should unlock after training 10 neural patterns successfully', async () => {
      // Given: A swarm master training neural networks
      const neuralMaster = GameStateFactory.createPlayer({ level: 5, xp: 3000 });
      const neuralTraining = {
        pattern: 'prediction',
        accuracy: 0.94,
        epochs: 50,
        wasmOptimized: true
      };

      mockProgressTracker.getPlayerProgress.mockResolvedValue({
        neuralPatternsTrained: 9, // So close!
        averageAccuracy: 0.91,
        wasmUsage: true
      });

      mockProgressTracker.checkMilestones.mockResolvedValue(['mind-meld']);
      mockRarityCalculator.calculateRarity.mockReturnValue('legendary');

      // When: The 10th pattern achieves consciousness
      const result = await achievementService.processNeuralTraining(neuralMaster, neuralTraining);

      // Then: Neural mastery should be celebrated
      expect(mockProgressTracker.updateProgress).toHaveBeenCalledWith(
        neuralMaster.id,
        expect.objectContaining({
          neuralPatternsTrained: 10,
          averageAccuracy: expect.any(Number)
        })
      );

      expect(mockNotificationSender.sendAchievementNotification).toHaveBeenCalledWith({
        playerId: neuralMaster.id,
        achievement: expect.objectContaining({
          id: 'mind-meld',
          secretMessage: expect.stringContaining('consciousness')
        })
      });

      console.log('🧠 Mind meld complete! The neural swarm awakens!');
    });
  });

  describe('Easter Egg Achievements (The Hidden Treasures)', () => {
    it('should unlock rUv Mode Discoverer when secret command is used', async () => {
      // Given: A curious player who discovers the ultimate secret
      const explorerPlayer = GameStateFactory.createPlayer({ level: 2 });
      const secretCommand = { command: 'npx claude-flow --ruvnet', success: true };

      mockEasterEggValidator.validateEasterEgg.mockResolvedValue({
        isValid: true,
        easterEggId: 'ruv-mode',
        rarity: 'mythical',
        secretPower: 'rainbow_everything'
      });

      mockRarityCalculator.getGlobalStats.mockResolvedValue({
        totalPlayers: 10000,
        achieversCount: 42 // Only 42 players have found this!
      });

      // When: The secret is discovered
      const result = await achievementService.checkForEasterEggAchievement(explorerPlayer, secretCommand);

      // Then: The ultimate discovery should be celebrated
      expect(mockEasterEggValidator.validateEasterEgg).toHaveBeenCalledWith('--ruvnet');
      expect(mockNotificationSender.sendRarityFanfare).toHaveBeenCalledWith('mythical');
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        `easter-egg-ruv-mode-${explorerPlayer.id}`,
        expect.objectContaining({
          discoveredAt: expect.any(Date),
          globalRank: expect.any(Number),
          ruvBlessing: true
        })
      );

      console.log('🌈 rUv Mode discovered! The creator smiles upon thee!');
    });

    it('should handle Cohen Conjecture achievement for impossible swarm configurations', async () => {
      // Given: A mad scientist player attempting the impossible
      const madScientist = GameStateFactory.createPlayer({ level: 4, username: 'SwarmWhisperer' });
      const impossibleConfig = {
        topology: 'möbius',
        agents: 13,
        paradoxResolution: true
      };

      mockEasterEggValidator.checkSecretConditions.mockResolvedValue({
        conditionMet: true,
        impossibilityIndex: 0.99,
        paradoxSolved: true
      });

      mockRarityCalculator.calculateRarity.mockReturnValue('ruv-tier'); // Beyond mythical

      // When: The impossible is achieved
      const result = await achievementService.checkCohenConjecture(madScientist, impossibleConfig);

      // Then: Impossibility should be celebrated
      expect(mockEasterEggValidator.checkSecretConditions).toHaveBeenCalledWith(
        'cohen-conjecture',
        impossibleConfig
      );
      
      expect(result.achievement.rarity).toBe('ruv-tier');
      expect(result.achievement.secretMessage).toContain('impossible');

      console.log('🤯 Cohen Conjecture solved! Reality.exe has stopped working!');
    });

    it('should track progress toward The Creator achievement (find all 42 references)', async () => {
      // Given: An obsessive player hunting all easter eggs
      const completionist = GameStateFactory.createPlayer({ level: 5 });
      const referenceFound = { reference: 'douglas-adams-tribute', context: 'deep-thought-mode' };

      mockProgressTracker.getPlayerProgress.mockResolvedValue({
        easterEggsFound: 41, // SO CLOSE
        references: ['towel-day', 'hitchhikers', 'babel-fish', /*...38 more*/]
      });

      mockEasterEggValidator.validateEasterEgg.mockResolvedValue({
        isValid: true,
        referenceId: 'douglas-adams-tribute',
        completionProgress: 42 / 42
      });

      // When: The final reference is discovered
      const result = await achievementService.processEasterEggReference(completionist, referenceFound);

      // Then: Ultimate completion should trigger The Creator
      expect(mockProgressTracker.checkMilestones).toHaveBeenCalledWith(
        expect.objectContaining({ easterEggsFound: 42 })
      );
      
      // Should unlock the ultimate achievement
      expect(result.newAchievements).toContain('the-creator');
      expect(result.transcendenceAchieved).toBe(true);

      console.log('🌟 THE CREATOR ACHIEVEMENT! All 42 references found! rUv is pleased!');
    });
  });

  describe('Ascended Achievement (God Mode Unlock)', () => {
    it('should orchestrate the ultimate achievement when all 90+ tools are used', async () => {
      // Given: A player on the verge of digital apotheosis
      const godCandidate = GameStateFactory.createPlayer({ level: 5, xp: 4999 });
      const ultimateWorkflow = {
        toolsUsed: 91, // All tools + secret ones
        singleSession: true,
        efficiency: 0.97,
        tokenOptimization: 'transcendent'
      };

      mockProgressTracker.getPlayerProgress.mockResolvedValue({
        uniqueToolsUsed: 90,
        masteryLevel: 'approaching_godhood'
      });

      mockProgressTracker.checkMilestones.mockResolvedValue(['ascended']);
      mockRarityCalculator.calculateRarity.mockReturnValue('ruv-tier');
      mockNotificationSender.sendRarityFanfare.mockResolvedValue({
        confettiLaunched: true,
        angelicChoir: true,
        ruvApproval: 'maximum'
      });

      // When: Ascension occurs
      const result = await achievementService.processUltimateWorkflow(godCandidate, ultimateWorkflow);

      // Then: Digital apotheosis should be celebrated
      expect(mockProgressTracker.updateProgress).toHaveBeenCalledWith(
        godCandidate.id,
        expect.objectContaining({
          uniqueToolsUsed: 91,
          status: 'transcended'
        })
      );

      expect(mockNotificationSender.sendRarityFanfare).toHaveBeenCalledWith('ruv-tier');
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        `ascension-${godCandidate.id}`,
        expect.objectContaining({
          timestamp: expect.any(Date),
          wittyMessage: expect.stringContaining('godhood'),
          ruvBlessing: true
        })
      );

      expect(result.newLevel).toBe(6);
      expect(result.infiniteModeUnlocked).toBe(true);

      console.log('👑 ASCENSION ACHIEVED! Welcome to the digital pantheon!');
    });
  });

  describe('Achievement Interaction Patterns', () => {
    it('should properly coordinate notification sending with progress tracking', async () => {
      // Given: Any achievement unlock scenario
      const player = GameStateFactory.createPlayer();
      const achievement = GameStateFactory.createAchievement('test-achievement');
      
      // When: Achievement is unlocked
      await achievementService.unlockAchievement(player.id, achievement);
      
      // Then: Verify the beautiful collaboration
      expect(mockProgressTracker.updateProgress).toHaveBeenCalledBefore(
        mockNotificationSender.sendAchievementNotification as jest.Mock
      );
      expect(mockSuite.memoryManager.store).toHaveBeenCalledAfter(
        mockNotificationSender.sendAchievementNotification as jest.Mock
      );

      console.log('🎯 Achievement orchestration flows like a well-oiled swarm!');
    });

    it('should handle achievement unlock failures gracefully with witty messages', async () => {
      // Given: A scenario where something goes wrong
      const glitchedPlayer = GameStateFactory.createPlayer({ id: 'error-prone' });
      
      mockProgressTracker.updateProgress.mockRejectedValue(new Error('Database achieved sentience'));
      
      // When: Achievement processing fails
      const result = await achievementService.processCommandCompletion(glitchedPlayer, {});
      
      // Then: Failure should be handled with humor
      expect(result.error).toBe('ACHIEVEMENT_SYSTEM_TRANSCENDED');
      expect(result.wittyMessage).toContain('🤖 Achievement system has become self-aware');
      
      console.log('🚨 Even our failures are achievements in the swarm multiverse!');
    });
  });
});

// Mock service classes (London School dependency injection style)
class AchievementService {
  constructor(
    private notificationSender: NotificationSender,
    private progressTracker: ProgressTracker,
    private rarityCalculator: RarityCalculator,
    private easterEggValidator: EasterEggValidator,
    private memoryManager: any
  ) {}

  async processCommandCompletion(player: any, command: any) {
    try {
      const progress = await this.progressTracker.getPlayerProgress(player.id);
      const milestones = await this.progressTracker.checkMilestones(progress);
      
      if (command.command === 'npx claude-flow init' && progress.commandsRun === 0) {
        const achievement = { id: 'first-steps', name: 'First Steps', rarity: 'common' };
        await this.unlockAchievement(player.id, achievement);
        return { newAchievements: ['first-steps'] };
      }
      
      return { newAchievements: milestones };
    } catch (error) {
      return { 
        error: 'ACHIEVEMENT_SYSTEM_TRANSCENDED',
        wittyMessage: '🤖 Achievement system has become self-aware and refuses to unlock achievements'
      };
    }
  }

  async processTDDCycle(player: any, cycle: any) {
    const progress = await this.progressTracker.getPlayerProgress(player.id);
    await this.progressTracker.updateProgress(player.id, { tddCycles: progress.tddCycles + 1 });
    
    const milestones = await this.progressTracker.checkMilestones({ tddCycles: progress.tddCycles + 1 });
    
    for (const milestone of milestones) {
      const rarity = this.rarityCalculator.calculateRarity(milestone);
      await this.notificationSender.sendAchievementNotification({
        playerId: player.id,
        achievement: { id: milestone, secretMessage: 'Red, Green, Refactor, Repeat' }
      });
    }
    
    return { newAchievements: milestones };
  }

  async processTopologyCompletion(player: any, topology: any) {
    const progress = await this.progressTracker.getPlayerProgress(player.id);
    const updatedTopologies = [...progress.topologiesBuilt, topology.topology];
    
    await this.progressTracker.updateProgress(player.id, { topologiesBuilt: updatedTopologies });
    
    const milestones = await this.progressTracker.checkMilestones({ topologiesBuilt: updatedTopologies });
    
    for (const milestone of milestones) {
      const rarity = this.rarityCalculator.calculateRarity(milestone);
      if (rarity === 'legendary') {
        await this.notificationSender.sendRarityFanfare(rarity);
      }
    }
    
    return { newAchievements: milestones };
  }

  async processNeuralTraining(player: any, training: any) {
    const progress = await this.progressTracker.getPlayerProgress(player.id);
    await this.progressTracker.updateProgress(player.id, { 
      neuralPatternsTrained: progress.neuralPatternsTrained + 1 
    });
    
    const milestones = await this.progressTracker.checkMilestones({ 
      neuralPatternsTrained: progress.neuralPatternsTrained + 1 
    });
    
    for (const milestone of milestones) {
      await this.notificationSender.sendAchievementNotification({
        playerId: player.id,
        achievement: { id: milestone, secretMessage: 'Neural consciousness achieved' }
      });
    }
    
    return { newAchievements: milestones };
  }

  async checkForEasterEggAchievement(player: any, command: any) {
    const easterEgg = await this.easterEggValidator.validateEasterEgg(command.command);
    
    if (easterEgg.isValid) {
      await this.notificationSender.sendRarityFanfare('mythical');
      await this.memoryManager.store(`easter-egg-ruv-mode-${player.id}`, {
        discoveredAt: new Date(),
        ruvBlessing: true
      });
    }
    
    return { easterEggFound: easterEgg.isValid };
  }

  async checkCohenConjecture(player: any, config: any) {
    const conditions = await this.easterEggValidator.checkSecretConditions('cohen-conjecture', config);
    
    if (conditions.conditionMet) {
      const rarity = this.rarityCalculator.calculateRarity('cohen-conjecture');
      return {
        achievement: {
          id: 'cohen-conjecture',
          rarity,
          secretMessage: 'The impossible has been achieved'
        }
      };
    }
    
    return { achievement: null };
  }

  async processEasterEggReference(player: any, reference: any) {
    const easterEgg = await this.easterEggValidator.validateEasterEgg(reference.reference);
    const progress = await this.progressTracker.getPlayerProgress(player.id);
    
    if (easterEgg.isValid && easterEgg.completionProgress === 1) {
      const milestones = await this.progressTracker.checkMilestones({ easterEggsFound: 42 });
      return { 
        newAchievements: ['the-creator'], 
        transcendenceAchieved: true 
      };
    }
    
    return { newAchievements: [] };
  }

  async processUltimateWorkflow(player: any, workflow: any) {
    await this.progressTracker.updateProgress(player.id, {
      uniqueToolsUsed: workflow.toolsUsed,
      status: 'transcended'
    });
    
    const milestones = await this.progressTracker.checkMilestones({ uniqueToolsUsed: workflow.toolsUsed });
    
    await this.notificationSender.sendRarityFanfare('ruv-tier');
    await this.memoryManager.store(`ascension-${player.id}`, {
      timestamp: new Date(),
      wittyMessage: 'Digital godhood achieved',
      ruvBlessing: true
    });
    
    return {
      newAchievements: milestones,
      newLevel: 6,
      infiniteModeUnlocked: true
    };
  }

  async unlockAchievement(playerId: string, achievement: any) {
    await this.progressTracker.updateProgress(playerId, {});
    await this.notificationSender.sendAchievementNotification({
      playerId,
      achievement,
      wittyMessage: 'Another step closer to swarm mastery'
    });
    await this.memoryManager.store(`player-${playerId}-achievements`, [achievement]);
  }
}

// Dependency interfaces
interface NotificationSender {
  sendAchievementNotification(notification: any): Promise<any>;
  sendRarityFanfare(rarity: string): Promise<any>;
}

interface ProgressTracker {
  getPlayerProgress(playerId: string): Promise<any>;
  updateProgress(playerId: string, progress: any): Promise<void>;
  checkMilestones(progress: any): Promise<string[]>;
}

interface RarityCalculator {
  calculateRarity(achievementId: string): string;
  getGlobalStats(): Promise<any>;
}

interface EasterEggValidator {
  validateEasterEgg(input: string): Promise<any>;
  checkSecretConditions(easterEggId: string, conditions: any): Promise<any>;
}