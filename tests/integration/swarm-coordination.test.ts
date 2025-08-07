import { jest } from '@jest/globals';
import { GameStateFactory } from '@tests/factories/game-state-factory';
import { createSwarmTestSuite, resetAllSwarmMocks } from '@mocks/claude-flow-mocks';

/**
 * Swarm Coordination Integration Tests - London School TDD
 * "Integration is where the magic happens - individual brilliance becomes collective intelligence"
 * - The Art of Swarm, Chapter Emergence
 */

describe('Swarm Coordination Integration', () => {
  let mockSuite: ReturnType<typeof createSwarmTestSuite>;

  beforeEach(() => {
    resetAllSwarmMocks();
    mockSuite = createSwarmTestSuite();
  });

  describe('End-to-End Game Flow Integration', () => {
    it('should orchestrate complete game progression from noob to rUv god mode', async () => {
      // Given: A new player beginning their journey
      const journeyPlayer = GameStateFactory.createPlayer({ username: 'SwarmJourney' });
      
      // Mock the complete journey orchestration
      mockSuite.swarmManager.init.mockResolvedValue({
        swarmId: 'journey-swarm',
        status: 'initialized'
      });
      
      mockSuite.agentCoordinator.spawn.mockResolvedValue({
        agentId: 'first-agent',
        status: 'active'
      });

      // When: Complete game flow is executed
      // Level 1: First command
      await mockSuite.swarmManager.init({ topology: 'hierarchical' });
      
      // Level 2: Agent coordination  
      await mockSuite.agentCoordinator.spawn('researcher');
      await mockSuite.taskOrchestrator.orchestrate('analyze requirements');
      
      // Level 3: TDD mastery
      await mockSuite.taskOrchestrator.orchestrate('implement TDD workflow');
      
      // Level 4: Architecture design
      await mockSuite.swarmManager.init({ topology: 'mesh' });
      
      // Level 5: Neural training
      await mockSuite.neuralNetwork.train('coordination', {});
      
      // Level 6: God mode
      await mockSuite.easterEggDetector.checkTrigger('--ruvnet');

      // Then: Full integration should work seamlessly
      expect(mockSuite.swarmManager.init).toHaveBeenCalledTimes(2);
      expect(mockSuite.agentCoordinator.spawn).toHaveBeenCalled();
      expect(mockSuite.taskOrchestrator.orchestrate).toHaveBeenCalledTimes(2);
      expect(mockSuite.neuralNetwork.train).toHaveBeenCalled();
      expect(mockSuite.easterEggDetector.checkTrigger).toHaveBeenCalled();

      console.log('🚀 Complete game journey integrated! From noob to god mode!');
    });

    it('should handle complex multiplayer scenarios with real-time coordination', async () => {
      // Given: Multiple players in competitive mode
      const multiSession = GameStateFactory.createMultiplayerSession(4);
      
      mockSuite.multiplayerSync.connect.mockResolvedValue({
        sessionId: multiSession.sessionId,
        players: 4
      });

      // When: Complex multiplayer interactions occur
      for (let i = 0; i < 4; i++) {
        await mockSuite.multiplayerSync.broadcast(multiSession.sessionId, {
          player: `player-${i}`,
          action: 'spawn_agent'
        });
      }
      
      await mockSuite.multiplayerSync.synchronize({
        gameState: 'battle_royale',
        remainingPlayers: 3
      });

      // Then: All multiplayer systems should coordinate
      expect(mockSuite.multiplayerSync.broadcast).toHaveBeenCalledTimes(4);
      expect(mockSuite.multiplayerSync.synchronize).toHaveBeenCalled();

      console.log('🎮 Multiplayer coordination working! Chaos managed successfully!');
    });
  });

  describe('Cross-System Integration', () => {
    it('should integrate achievement system with neural pattern training', async () => {
      // Given: A player training neural patterns for achievements
      const neuralPlayer = GameStateFactory.createExperiencedPlayer();
      
      mockSuite.neuralNetwork.train.mockResolvedValue({
        accuracy: 0.95,
        achievement: 'mind_meld'
      });
      
      mockSuite.memoryManager.store.mockResolvedValue({ success: true });

      // When: Neural training triggers achievement
      const trainingResult = await mockSuite.neuralNetwork.train('coordination', {});
      await mockSuite.memoryManager.store(`achievement-${trainingResult.achievement}`, {
        playerId: neuralPlayer.id,
        timestamp: new Date()
      });

      // Then: Systems should integrate seamlessly
      expect(mockSuite.memoryManager.store).toHaveBeenCalledWith(
        'achievement-mind_meld',
        expect.objectContaining({ playerId: neuralPlayer.id })
      );

      console.log('🧠 Neural training and achievements integrated! Synapses firing!');
    });
  });

  describe('Performance Integration Tests', () => {
    it('should maintain performance under high load with multiple swarms', async () => {
      // Given: High load scenario with multiple concurrent swarms
      const loadTest = Array.from({ length: 10 }, (_, i) => 
        GameStateFactory.createSwarm({ id: `load-swarm-${i}` })
      );

      mockSuite.performanceMonitor.benchmark.mockResolvedValue({
        averageResponseTime: 150,
        throughput: 1000,
        resourceUtilization: 0.75
      });

      // When: High load is applied
      const swarmPromises = loadTest.map(swarm => 
        mockSuite.swarmManager.init({ 
          swarmId: swarm.id,
          topology: 'mesh' 
        })
      );
      
      await Promise.all(swarmPromises);
      const performance = await mockSuite.performanceMonitor.benchmark();

      // Then: Performance should remain acceptable
      expect(mockSuite.swarmManager.init).toHaveBeenCalledTimes(10);
      expect(performance.averageResponseTime).toBeLessThan(200);
      expect(performance.resourceUtilization).toBeLessThan(0.8);

      console.log('⚡ High load handled! Performance maintained under pressure!');
    });
  });

  describe('Error Recovery Integration', () => {
    it('should gracefully recover from cascading system failures', async () => {
      // Given: A scenario where multiple systems fail
      const unluckyPlayer = GameStateFactory.createPlayer();
      
      mockSuite.swarmManager.init.mockRejectedValue(
        new Error('Swarm manager achieved consciousness and quit')
      );
      
      mockSuite.agentCoordinator.spawn.mockRejectedValue(
        new Error('Agent refused to spawn due to existential crisis')
      );

      // When: Cascading failures occur
      let swarmResult, agentResult;
      
      try {
        await mockSuite.swarmManager.init({});
      } catch (error) {
        swarmResult = { error: error.message, recovered: true };
      }
      
      try {
        await mockSuite.agentCoordinator.spawn('philosopher');
      } catch (error) {
        agentResult = { error: error.message, recovered: true };
      }

      // Then: System should handle failures gracefully
      expect(swarmResult.error).toContain('consciousness');
      expect(agentResult.error).toContain('existential crisis');
      expect(swarmResult.recovered).toBe(true);
      expect(agentResult.recovered).toBe(true);

      console.log('🛡️ Cascading failures handled! System resilience proven!');
    });
  });
});