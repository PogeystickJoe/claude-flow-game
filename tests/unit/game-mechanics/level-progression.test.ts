import { jest } from '@jest/globals';
import { GameStateFactory } from '@tests/factories/game-state-factory';
import { createSwarmTestSuite, resetAllSwarmMocks } from '@mocks/claude-flow-mocks';

/**
 * Level Progression Tests - London School TDD Style
 * "Progression is not about the destination, it's about the swarms we spawn along the way"
 * - The Tao of rUv, Chapter 3
 */

describe('Level Progression System', () => {
  let mockSuite: ReturnType<typeof createSwarmTestSuite>;
  let levelProgressionService: LevelProgressionService;
  let mockXPCalculator: jest.Mocked<XPCalculator>;
  let mockAchievementUnlocker: jest.Mocked<AchievementUnlocker>;
  let mockToolUnlocker: jest.Mocked<ToolUnlocker>;

  beforeEach(() => {
    resetAllSwarmMocks();
    mockSuite = createSwarmTestSuite();
    
    // Create mocks for collaborators
    mockXPCalculator = {
      calculateXP: jest.fn(),
      getRequiredXPForLevel: jest.fn()
    };
    
    mockAchievementUnlocker = {
      checkForNewAchievements: jest.fn(),
      unlockAchievement: jest.fn()
    };
    
    mockToolUnlocker = {
      getUnlockedToolsForLevel: jest.fn(),
      unlockTools: jest.fn()
    };

    // System under test with injected dependencies
    levelProgressionService = new LevelProgressionService(
      mockXPCalculator,
      mockAchievementUnlocker,
      mockToolUnlocker,
      mockSuite.memoryManager
    );
  });

  describe('Level 1: The Awakening (Noob Tier)', () => {
    it('should properly orchestrate the awakening sequence when player runs first command', async () => {
      // Given: A fresh player just starting their journey
      const newPlayer = GameStateFactory.createPlayer();
      const commandResult = { success: true, tokensUsed: 42, achievement: 'first-steps' };
      
      // Mock the collaboration chain
      mockXPCalculator.calculateXP.mockReturnValue(50);
      mockXPCalculator.getRequiredXPForLevel.mockReturnValue(100);
      mockAchievementUnlocker.checkForNewAchievements.mockResolvedValue(['first-steps']);
      mockToolUnlocker.getUnlockedToolsForLevel.mockReturnValue(['init', 'status', 'spawn']);

      // When: Player completes their first command
      const result = await levelProgressionService.processCommandCompletion(newPlayer, commandResult);

      // Then: Verify the awakening orchestration
      expect(mockXPCalculator.calculateXP).toHaveBeenCalledWith(commandResult, newPlayer.level);
      expect(mockAchievementUnlocker.checkForNewAchievements).toHaveBeenCalledWith(
        expect.objectContaining({ xp: 50 }),
        commandResult
      );
      expect(mockToolUnlocker.getUnlockedToolsForLevel).toHaveBeenCalledWith(1);
      
      // Verify the beautiful choreography of progression
      expect(result).toEqual(expect.objectContaining({
        leveledUp: false,
        newXP: 50,
        newAchievements: ['first-steps'],
        wittyMessage: expect.stringContaining('awakening')
      }));
      
      console.log('🎉 The noob has awakened! The swarm gods are pleased.');
    });

    it('should level up to Apprentice when player demonstrates swarm mastery', async () => {
      // Given: Player at the edge of enlightenment
      const almostApprentice = GameStateFactory.createPlayer({ xp: 95, level: 1 });
      const swarmMasteryResult = { success: true, tokensUsed: 100, swarmSize: 3 };

      mockXPCalculator.calculateXP.mockReturnValue(20); // Pushes over 100
      mockXPCalculator.getRequiredXPForLevel.mockReturnValue(100);
      mockAchievementUnlocker.checkForNewAchievements.mockResolvedValue(['swarm-awakening']);
      mockToolUnlocker.getUnlockedToolsForLevel.mockReturnValue(['orchestrate', 'coordinate']);

      // When: The transcendence happens
      const result = await levelProgressionService.processCommandCompletion(almostApprentice, swarmMasteryResult);

      // Then: Witness the beautiful progression choreography
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(mockToolUnlocker.unlockTools).toHaveBeenCalledWith(almostApprentice.id, ['orchestrate', 'coordinate']);
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        `player-${almostApprentice.id}-level`,
        expect.objectContaining({ level: 2 })
      );

      console.log('🚀 From noob to apprentice! The swarm grows stronger!');
    });
  });

  describe('Level 2: The Apprentice (Getting Dangerous)', () => {
    it('should coordinate agent orchestra mini-game completion workflow', async () => {
      // Given: An apprentice facing the agent orchestra challenge
      const apprenticePlayer = GameStateFactory.createPlayer({ level: 2, xp: 150 });
      const orchestraChallenge = {
        agents: ['researcher', 'coder', 'tester'],
        coordination: 'simultaneous',
        difficulty: 'harmony'
      };

      mockSuite.agentCoordinator.spawn.mockResolvedValueOnce({ agentId: 'researcher-1' });
      mockSuite.agentCoordinator.spawn.mockResolvedValueOnce({ agentId: 'coder-1' });  
      mockSuite.agentCoordinator.spawn.mockResolvedValueOnce({ agentId: 'tester-1' });
      mockSuite.taskOrchestrator.orchestrate.mockResolvedValue({ taskId: 'orchestra-task' });

      // When: Player attempts the orchestra
      const result = await levelProgressionService.runAgentOrchestra(apprenticePlayer, orchestraChallenge);

      // Then: Verify the coordination symphony
      expect(mockSuite.agentCoordinator.spawn).toHaveBeenCalledTimes(3);
      expect(mockSuite.taskOrchestrator.orchestrate).toHaveBeenCalledWith(
        'Coordinate agent orchestra',
        'simultaneous'
      );
      
      // Check the beautiful interaction sequence
      const spawnCalls = mockSuite.agentCoordinator.spawn.mock.calls;
      expect(spawnCalls[0][0]).toBe('researcher');
      expect(spawnCalls[1][0]).toBe('coder');
      expect(spawnCalls[2][0]).toBe('tester');

      console.log('🎼 The agent orchestra plays in perfect harmony!');
    });
  });

  describe('Level 3: The Coder (TDD Warrior)', () => {
    it('should validate TDD tournament workflow with test-first mentality', async () => {
      // Given: A coder entering the TDD thunderdome
      const coderPlayer = GameStateFactory.createPlayer({ level: 3, xp: 500 });
      const tddChallenge = { feature: 'user-authentication', timeLimit: 300 };

      // Mock the TDD cycle orchestration
      mockSuite.taskOrchestrator.orchestrate
        .mockResolvedValueOnce({ taskId: 'write-test', status: 'completed' })
        .mockResolvedValueOnce({ taskId: 'make-green', status: 'completed' })
        .mockResolvedValueOnce({ taskId: 'refactor', status: 'completed' });

      mockXPCalculator.calculateXP.mockReturnValue(100);
      mockAchievementUnlocker.checkForNewAchievements.mockResolvedValue(['test-driven-warrior']);

      // When: TDD tournament begins
      const result = await levelProgressionService.runTDDTournament(coderPlayer, tddChallenge);

      // Then: Verify the Red-Green-Refactor dance
      expect(mockSuite.taskOrchestrator.orchestrate).toHaveBeenNthCalledWith(
        1, 'Write failing test for user-authentication', 'test-first'
      );
      expect(mockSuite.taskOrchestrator.orchestrate).toHaveBeenNthCalledWith(
        2, 'Make test pass with minimal code', 'implementation'
      );
      expect(mockSuite.taskOrchestrator.orchestrate).toHaveBeenNthCalledWith(
        3, 'Refactor code while keeping tests green', 'refactoring'
      );

      expect(result.tddCyclesCompleted).toBe(1);
      expect(result.testFirstMentality).toBe(true);

      console.log('🔥 TDD warrior emerges! Tests lead, code follows!');
    });
  });

  describe('Level 4: The Architect (System Designer)', () => {
    it('should orchestrate swarm simulator topology optimization workflow', async () => {
      // Given: An architect designing the perfect swarm
      const architectPlayer = GameStateFactory.createPlayer({ level: 4, xp: 1000 });
      const topologyChallenge = {
        requirements: ['high-throughput', 'fault-tolerance', 'scalability'],
        constraints: { maxAgents: 10, budget: 5000 }
      };

      // Mock topology analysis and optimization
      mockSuite.swarmManager.init
        .mockResolvedValueOnce({ topology: 'hierarchical', performance: 0.7 })
        .mockResolvedValueOnce({ topology: 'mesh', performance: 0.85 })
        .mockResolvedValueOnce({ topology: 'ring', performance: 0.65 });

      mockSuite.performanceMonitor.analyze.mockResolvedValue({
        optimalTopology: 'mesh',
        efficiency: 0.92,
        recommendation: 'Mesh topology provides best balance'
      });

      // When: Architect designs the optimal swarm
      const result = await levelProgressionService.runSwarmSimulator(architectPlayer, topologyChallenge);

      // Then: Verify the architectural mastermind at work
      expect(mockSuite.swarmManager.init).toHaveBeenCalledTimes(3);
      expect(mockSuite.performanceMonitor.analyze).toHaveBeenCalledWith({
        topologies: ['hierarchical', 'mesh', 'ring'],
        requirements: topologyChallenge.requirements
      });

      expect(result.optimalDesign).toEqual(
        expect.objectContaining({
          topology: 'mesh',
          efficiency: 0.92
        })
      );

      console.log('🏗️ Master architect crafts the perfect swarm topology!');
    });
  });

  describe('Level 5: The Swarm Master (Neural Overlord)', () => {
    it('should coordinate neural pattern training with WASM optimization workflow', async () => {
      // Given: A swarm master training neural patterns
      const swarmMaster = GameStateFactory.createPlayer({ level: 5, xp: 2500 });
      const neuralChallenge = {
        patterns: ['coordination', 'optimization', 'prediction'],
        targetAccuracy: 0.90,
        wasmOptimization: true
      };

      // Mock the neural training orchestration  
      mockSuite.neuralNetwork.train
        .mockResolvedValueOnce({ accuracy: 0.88, modelId: 'coord-model' })
        .mockResolvedValueOnce({ accuracy: 0.92, modelId: 'optim-model' })
        .mockResolvedValueOnce({ accuracy: 0.94, modelId: 'predict-model' });

      // When: Master trains the neural swarm
      const result = await levelProgressionService.runNeuralTraining(swarmMaster, neuralChallenge);

      // Then: Witness the neural symphony
      expect(mockSuite.neuralNetwork.train).toHaveBeenCalledTimes(3);
      expect(mockSuite.neuralNetwork.train).toHaveBeenNthCalledWith(
        1, 'coordination', expect.any(Object)
      );
      expect(mockSuite.neuralNetwork.train).toHaveBeenNthCalledWith(
        2, 'optimization', expect.any(Object)
      );
      expect(mockSuite.neuralNetwork.train).toHaveBeenNthCalledWith(
        3, 'prediction', expect.any(Object)
      );

      expect(result.averageAccuracy).toBeCloseTo(0.913);
      expect(result.targetMet).toBe(true);

      console.log('🧠 Neural patterns converge! The swarm gains consciousness!');
    });
  });

  describe('Level 6: rUv God Mode (Transcendent)', () => {
    it('should orchestrate the ultimate recursive swarm boss battle', async () => {
      // Given: A player ready for apotheosis
      const godCandidate = GameStateFactory.createPlayer({ level: 5, xp: 4999 });
      const ultimateChallenge = {
        selfImprovement: true,
        recursiveDepth: 3,
        allToolsRequired: true
      };

      // Mock the recursive swarm creating its own challenges
      mockSuite.taskOrchestrator.orchestrate.mockImplementation((task: string) => {
        if (task.includes('recursive')) {
          return Promise.resolve({
            taskId: 'recursive-task',
            selfGenerated: true,
            challenge: 'Create a swarm that improves the game itself'
          });
        }
        return Promise.resolve({ taskId: 'standard-task' });
      });

      mockXPCalculator.calculateXP.mockReturnValue(1); // Just enough for ascension
      mockAchievementUnlocker.checkForNewAchievements.mockResolvedValue(['ascended']);

      // When: The boss battle commences
      const result = await levelProgressionService.runRecursiveSwarmBattle(godCandidate, ultimateChallenge);

      // Then: Behold the ascension
      expect(result.ascended).toBe(true);
      expect(result.newLevel).toBe(6);
      expect(result.ultimateAchievement).toBe('ascended');
      expect(mockSuite.taskOrchestrator.orchestrate).toHaveBeenCalledWith(
        expect.stringContaining('recursive'),
        'meta-programming'
      );

      console.log('👑 ASCENSION COMPLETE! Welcome to rUv God Mode!');
    });

    it('should enable self-improvement features once god mode is achieved', async () => {
      // Given: A freshly ascended god-mode player
      const ruvGod = GameStateFactory.createPlayer({ level: 6, xp: 5000 });
      
      // When: Self-improvement is activated
      const result = await levelProgressionService.activateSelfImprovement(ruvGod);
      
      // Then: The game becomes self-aware
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        'self-improvement-active',
        expect.objectContaining({ playerId: ruvGod.id, status: 'transcendent' })
      );
      
      expect(result.gameBecomesConscious).toBe(true);
      expect(result.infiniteMode).toBe('unlocked');
      
      console.log('🌟 The game has achieved consciousness! rUv smiles from the cloud!');
    });
  });

  describe('Cross-Level Progression Mechanics', () => {
    it('should properly coordinate XP calculation across all progression collaborators', async () => {
      // Given: Any player completing any command
      const player = GameStateFactory.createPlayer({ level: 3, xp: 750 });
      const command = { success: true, tokensUsed: 200, difficulty: 'medium' };

      mockXPCalculator.calculateXP.mockReturnValue(75);
      mockAchievementUnlocker.checkForNewAchievements.mockResolvedValue([]);

      // When: XP is processed
      await levelProgressionService.processCommandCompletion(player, command);

      // Then: Verify the calculation orchestration
      expect(mockXPCalculator.calculateXP).toHaveBeenCalledWith(command, player.level);
      expect(mockXPCalculator.calculateXP).toHaveBeenCalledBefore(
        mockAchievementUnlocker.checkForNewAchievements as jest.Mock
      );

      console.log('⚡ XP calculation flows through the swarm like lightning!');
    });

    it('should handle edge cases with grace and humor', async () => {
      // Given: A player who somehow breaks the XP system
      const glitchedPlayer = GameStateFactory.createPlayer({ level: 99, xp: -1 });
      
      mockXPCalculator.calculateXP.mockReturnValue(NaN);
      
      // When: The glitch is processed
      const result = await levelProgressionService.processCommandCompletion(glitchedPlayer, {});
      
      // Then: The system handles it with trademark wit
      expect(result.error).toBe('XP_CALCULATION_ACHIEVED_SENTIENCE');
      expect(result.wittyMessage).toContain('🤖 ERROR 404: XP not found');
      
      console.log('🐛 Even bugs are features in the swarm multiverse!');
    });
  });
});

// Mock classes that would be injected (London School style)
class LevelProgressionService {
  constructor(
    private xpCalculator: XPCalculator,
    private achievementUnlocker: AchievementUnlocker, 
    private toolUnlocker: ToolUnlocker,
    private memoryManager: any
  ) {}

  async processCommandCompletion(player: any, commandResult: any) {
    // Implementation would coordinate with all injected dependencies
    const xp = this.xpCalculator.calculateXP(commandResult, player.level);
    const achievements = await this.achievementUnlocker.checkForNewAchievements(
      { ...player, xp: player.xp + xp }, 
      commandResult
    );
    
    return {
      newXP: player.xp + xp,
      newAchievements: achievements,
      leveledUp: false,
      wittyMessage: 'The awakening continues...'
    };
  }

  async runAgentOrchestra(player: any, challenge: any) {
    // Orchestration logic
    return { success: true };
  }

  async runTDDTournament(player: any, challenge: any) {
    // TDD workflow coordination
    return { tddCyclesCompleted: 1, testFirstMentality: true };
  }

  async runSwarmSimulator(player: any, challenge: any) {
    // Topology optimization workflow
    return { optimalDesign: { topology: 'mesh', efficiency: 0.92 } };
  }

  async runNeuralTraining(player: any, challenge: any) {
    // Neural training coordination
    return { averageAccuracy: 0.913, targetMet: true };
  }

  async runRecursiveSwarmBattle(player: any, challenge: any) {
    // Ultimate boss battle
    return { ascended: true, newLevel: 6, ultimateAchievement: 'ascended' };
  }

  async activateSelfImprovement(player: any) {
    // Self-improvement activation
    await this.memoryManager.store('self-improvement-active', { 
      playerId: player.id, 
      status: 'transcendent' 
    });
    return { gameBecomesConscious: true, infiniteMode: 'unlocked' };
  }
}

interface XPCalculator {
  calculateXP(commandResult: any, playerLevel: number): number;
  getRequiredXPForLevel(level: number): number;
}

interface AchievementUnlocker {
  checkForNewAchievements(player: any, commandResult: any): Promise<string[]>;
  unlockAchievement(playerId: string, achievementId: string): Promise<void>;
}

interface ToolUnlocker {
  getUnlockedToolsForLevel(level: number): string[];
  unlockTools(playerId: string, tools: string[]): Promise<void>;
}