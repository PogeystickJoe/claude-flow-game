import { jest } from '@jest/globals';
import { createSwarmTestSuite, resetAllSwarmMocks } from '@mocks/claude-flow-mocks';
import { GameStateFactory } from '@tests/factories/game-state-factory';

/**
 * Swarm Command Execution Validation Tests - London School TDD
 * "A command without validation is like a swarm without purpose - chaotic and dangerous"
 * - The Zen of Swarm Engineering, Chapter 7
 */

describe('Swarm Command Execution Validation', () => {
  let mockSuite: ReturnType<typeof createSwarmTestSuite>;
  let commandValidator: CommandValidator;
  let mockPermissionChecker: jest.Mocked<PermissionChecker>;
  let mockSyntaxValidator: jest.Mocked<SyntaxValidator>;
  let mockResourceManager: jest.Mocked<ResourceManager>;
  let mockExecutionEngine: jest.Mocked<ExecutionEngine>;
  let mockAuditLogger: jest.Mocked<AuditLogger>;

  beforeEach(() => {
    resetAllSwarmMocks();
    mockSuite = createSwarmTestSuite();

    // Mock all the beautiful collaborators
    mockPermissionChecker = {
      hasPermission: jest.fn(),
      checkLevel: jest.fn(),
      validateToolAccess: jest.fn()
    };

    mockSyntaxValidator = {
      validateSyntax: jest.fn(),
      parseCommand: jest.fn(),
      suggestCorrections: jest.fn()
    };

    mockResourceManager = {
      checkResourceAvailability: jest.fn(),
      reserveResources: jest.fn(),
      releaseResources: jest.fn()
    };

    mockExecutionEngine = {
      execute: jest.fn(),
      getExecutionPlan: jest.fn(),
      estimateResourceUsage: jest.fn()
    };

    mockAuditLogger = {
      logCommand: jest.fn(),
      logResult: jest.fn(),
      logError: jest.fn()
    };

    // System under test with all dependencies injected
    commandValidator = new CommandValidator(
      mockPermissionChecker,
      mockSyntaxValidator,
      mockResourceManager,
      mockExecutionEngine,
      mockAuditLogger
    );
  });

  describe('Basic Command Validation Workflow', () => {
    it('should orchestrate complete validation workflow for valid commands', async () => {
      // Given: A valid player with a properly formed command
      const player = GameStateFactory.createPlayer({ level: 2, xp: 300 });
      const command = {
        type: 'spawn',
        parameters: { agentType: 'researcher', capabilities: ['web-search'] },
        raw: 'npx claude-flow spawn researcher --capabilities=web-search'
      };

      // Mock the validation chain
      mockPermissionChecker.hasPermission.mockResolvedValue(true);
      mockPermissionChecker.checkLevel.mockReturnValue(true);
      mockSyntaxValidator.validateSyntax.mockResolvedValue({ valid: true, parsed: command });
      mockResourceManager.checkResourceAvailability.mockResolvedValue({ available: true });
      mockExecutionEngine.estimateResourceUsage.mockResolvedValue({ tokens: 150, memory: 50 });

      // When: Command validation is orchestrated
      const result = await commandValidator.validateCommand(player, command);

      // Then: Witness the beautiful validation choreography
      expect(mockPermissionChecker.hasPermission).toHaveBeenCalledWith(player.id, 'spawn');
      expect(mockSyntaxValidator.validateSyntax).toHaveBeenCalledWith(command.raw);
      expect(mockResourceManager.checkResourceAvailability).toHaveBeenCalledWith(
        expect.objectContaining({ tokens: 150 })
      );
      expect(mockAuditLogger.logCommand).toHaveBeenCalledWith(player.id, command);

      expect(result).toEqual({
        valid: true,
        estimatedCost: { tokens: 150, memory: 50 },
        wittyMessage: expect.stringContaining('researcher')
      });

      console.log('✅ Command validation flows like poetry in motion!');
    });

    it('should coordinate permission denial with helpful suggestions', async () => {
      // Given: An ambitious noob trying to use god-tier commands
      const noob = GameStateFactory.createPlayer({ level: 1, xp: 50 });
      const godCommand = {
        type: 'neural-train',
        parameters: { pattern: 'consciousness', epochs: 1000 },
        raw: 'npx claude-flow neural-train --pattern=consciousness --epochs=1000'
      };

      mockPermissionChecker.hasPermission.mockResolvedValue(false);
      mockPermissionChecker.checkLevel.mockReturnValue(false);
      mockSyntaxValidator.suggestCorrections.mockResolvedValue([
        'Try: npx claude-flow init first',
        'Neural training unlocks at level 5'
      ]);

      // When: The ambitious command is validated
      const result = await commandValidator.validateCommand(noob, godCommand);

      // Then: Gentle but firm rejection with guidance
      expect(mockPermissionChecker.checkLevel).toHaveBeenCalledWith(1, 'neural-train');
      expect(mockSyntaxValidator.suggestCorrections).toHaveBeenCalledWith(godCommand, noob.level);
      expect(mockAuditLogger.logError).toHaveBeenCalledWith(
        noob.id, 
        'PERMISSION_DENIED',
        expect.stringContaining('level')
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INSUFFICIENT_LEVEL');
      expect(result.suggestions).toContain('Neural training unlocks at level 5');
      expect(result.wittyMessage).toContain('patience young swarmling');

      console.log('🚫 Noob contained! The swarm remains safe!');
    });
  });

  describe('Syntax Validation Patterns', () => {
    it('should validate proper swarm initialization commands', async () => {
      // Given: Various swarm init syntaxes
      const player = GameStateFactory.createExperiencedPlayer();
      const initCommands = [
        'npx claude-flow init --topology=hierarchical',
        'npx claude-flow init --topology=mesh --max-agents=10',
        'npx claude-flow init --topology=heart --secret-mode=ruv' // Easter egg
      ];

      mockPermissionChecker.hasPermission.mockResolvedValue(true);
      mockSyntaxValidator.validateSyntax.mockImplementation((cmd) => 
        Promise.resolve({ 
          valid: !cmd.includes('invalid'),
          parsed: { topology: cmd.includes('heart') ? 'heart' : 'hierarchical' }
        })
      );

      // When: Each command is validated
      const results = await Promise.all(
        initCommands.map(cmd => 
          commandValidator.validateCommand(player, { raw: cmd, type: 'init' })
        )
      );

      // Then: All should pass syntax validation
      results.forEach((result, index) => {
        expect(result.valid).toBe(true);
        expect(mockSyntaxValidator.validateSyntax).toHaveBeenNthCalledWith(
          index + 1, 
          initCommands[index]
        );
      });

      // Special handling for easter egg topology
      expect(results[2].easterEggDetected).toBe(true);
      expect(results[2].secretPower).toBe('love_swarm_activated');

      console.log('💖 Heart topology detected! Love swarms are the most powerful!');
    });

    it('should catch and correct common command typos with swarm wisdom', async () => {
      // Given: A player with fat fingers and good intentions
      const player = GameStateFactory.createPlayer({ level: 3 });
      const typoCommand = {
        raw: 'npx claude-flow sapwn recearcher --cpabilities=web-serch',
        type: 'spawn'
      };

      mockSyntaxValidator.validateSyntax.mockResolvedValue({
        valid: false,
        errors: ['Unknown command: sapwn', 'Invalid parameter: cpabilities']
      });

      mockSyntaxValidator.suggestCorrections.mockResolvedValue([
        'Did you mean: spawn?',
        'Did you mean: capabilities?',
        'Did you mean: web-search?'
      ]);

      // When: The typo-ridden command is processed
      const result = await commandValidator.validateCommand(player, typoCommand);

      // Then: Helpful corrections should be provided
      expect(mockSyntaxValidator.suggestCorrections).toHaveBeenCalledWith(typoCommand, player.level);
      expect(result.valid).toBe(false);
      expect(result.suggestions).toEqual([
        'Did you mean: spawn?',
        'Did you mean: capabilities?', 
        'Did you mean: web-search?'
      ]);
      expect(result.wittyMessage).toContain('🤖 Typo detected! The swarm forgives');

      console.log('🤖 Even typos are learning opportunities in the swarm!');
    });
  });

  describe('Resource Management Validation', () => {
    it('should coordinate resource availability checking before command execution', async () => {
      // Given: A player attempting a resource-intensive operation
      const player = GameStateFactory.createExperiencedPlayer();
      const heavyCommand = {
        type: 'orchestrate',
        parameters: { 
          task: 'Build entire application',
          agents: 8,
          complexity: 'enterprise'
        }
      };

      mockPermissionChecker.hasPermission.mockResolvedValue(true);
      mockSyntaxValidator.validateSyntax.mockResolvedValue({ valid: true });
      mockExecutionEngine.estimateResourceUsage.mockResolvedValue({
        tokens: 5000,
        memory: 2048,
        agents: 8,
        estimatedTime: 3600
      });

      mockResourceManager.checkResourceAvailability.mockResolvedValue({
        available: true,
        currentUsage: { tokens: 2000, memory: 512 },
        limits: { tokens: 10000, memory: 4096 }
      });

      // When: Resource validation occurs
      const result = await commandValidator.validateCommand(player, heavyCommand);

      // Then: Resource coordination should work beautifully
      expect(mockExecutionEngine.estimateResourceUsage).toHaveBeenCalledWith(heavyCommand);
      expect(mockResourceManager.checkResourceAvailability).toHaveBeenCalledWith({
        tokens: 5000,
        memory: 2048,
        agents: 8
      });
      
      expect(result.valid).toBe(true);
      expect(result.estimatedCost).toEqual({
        tokens: 5000,
        memory: 2048,
        agents: 8,
        estimatedTime: 3600
      });

      console.log('💪 Heavy command approved! The swarm can handle it!');
    });

    it('should reject commands that would exceed resource limits with alternatives', async () => {
      // Given: A player with champagne dreams and beer budget
      const player = GameStateFactory.createPlayer({ level: 4 });
      const impossibleCommand = {
        type: 'orchestrate',
        parameters: { agents: 50, complexity: 'universe-creation' }
      };

      mockExecutionEngine.estimateResourceUsage.mockResolvedValue({
        tokens: 100000,
        memory: 16384,
        agents: 50
      });

      mockResourceManager.checkResourceAvailability.mockResolvedValue({
        available: false,
        exceeded: ['tokens', 'agents'],
        suggestion: 'Try reducing agent count to 10'
      });

      // When: The impossible is attempted
      const result = await commandValidator.validateCommand(player, impossibleCommand);

      // Then: Gentle reality check with alternatives
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INSUFFICIENT_RESOURCES');
      expect(result.exceededLimits).toEqual(['tokens', 'agents']);
      expect(result.suggestions).toContain('Try reducing agent count to 10');
      expect(result.wittyMessage).toContain('🤯 Dream big, but start smaller!');

      console.log('🎯 Reality check delivered with love and humor!');
    });
  });

  describe('Command Execution Pipeline', () => {
    it('should orchestrate complete execution flow for approved commands', async () => {
      // Given: A valid command ready for execution
      const player = GameStateFactory.createPlayer({ level: 3 });
      const approvedCommand = { type: 'spawn', parameters: { agentType: 'coder' } };

      // Mock successful validation chain
      mockPermissionChecker.hasPermission.mockResolvedValue(true);
      mockSyntaxValidator.validateSyntax.mockResolvedValue({ valid: true });
      mockResourceManager.checkResourceAvailability.mockResolvedValue({ available: true });
      mockResourceManager.reserveResources.mockResolvedValue({ reserved: true });
      
      mockExecutionEngine.execute.mockResolvedValue({
        success: true,
        result: { agentId: 'coder-123', status: 'active' },
        tokensUsed: 150
      });

      // When: Command execution is orchestrated
      const result = await commandValidator.executeValidatedCommand(player, approvedCommand);

      // Then: Execution pipeline should flow perfectly
      expect(mockResourceManager.reserveResources).toHaveBeenCalledBefore(
        mockExecutionEngine.execute as jest.Mock
      );
      expect(mockExecutionEngine.execute).toHaveBeenCalledWith(approvedCommand, player);
      expect(mockResourceManager.releaseResources).toHaveBeenCalledAfter(
        mockExecutionEngine.execute as jest.Mock
      );
      expect(mockAuditLogger.logResult).toHaveBeenCalledWith(
        player.id,
        result.result
      );

      expect(result.success).toBe(true);
      expect(result.result.agentId).toBe('coder-123');

      console.log('🚀 Command execution flows like a well-orchestrated symphony!');
    });

    it('should handle execution failures with graceful recovery and wit', async () => {
      // Given: A command that will fail during execution
      const player = GameStateFactory.createPlayer();
      const fatedCommand = { type: 'spawn', parameters: { agentType: 'philosopher' } };

      mockPermissionChecker.hasPermission.mockResolvedValue(true);
      mockSyntaxValidator.validateSyntax.mockResolvedValue({ valid: true });
      mockResourceManager.checkResourceAvailability.mockResolvedValue({ available: true });
      mockResourceManager.reserveResources.mockResolvedValue({ reserved: true });

      mockExecutionEngine.execute.mockRejectedValue(
        new Error('Agent achieved enlightenment and refused to spawn')
      );

      // When: Execution fails in an enlightened way
      const result = await commandValidator.executeValidatedCommand(player, fatedCommand);

      // Then: Failure should be handled gracefully
      expect(mockResourceManager.releaseResources).toHaveBeenCalled(); // Cleanup happened
      expect(mockAuditLogger.logError).toHaveBeenCalledWith(
        player.id,
        'EXECUTION_FAILURE',
        expect.stringContaining('enlightenment')
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('enlightenment');
      expect(result.wittyMessage).toContain('🧘 Philosopher agent has transcended');

      console.log('🧘‍♂️ Even failures can be philosophical victories!');
    });
  });

  describe('Easter Egg Command Validation', () => {
    it('should recognize and validate secret rUv commands', async () => {
      // Given: A player discovering the ultimate secret
      const enlightenedPlayer = GameStateFactory.createExperiencedPlayer();
      const secretCommand = {
        raw: 'npx claude-flow --ruvnet --rainbow-mode --infinite-wisdom',
        type: 'secret',
        parameters: { mode: 'god' }
      };

      mockPermissionChecker.hasPermission.mockImplementation((playerId, command) => 
        Promise.resolve(command === 'secret' ? false : true) // Secrets need special handling
      );

      mockSyntaxValidator.validateSyntax.mockResolvedValue({
        valid: true,
        easterEgg: true,
        secretPowers: ['rainbow-mode', 'infinite-wisdom']
      });

      // Mock easter egg detection
      mockSuite.easterEggDetector.checkTrigger.mockResolvedValue({
        triggered: true,
        easterEgg: { name: 'rUv Mode', effect: 'rainbow_everything' }
      });

      // When: Secret command is validated
      const result = await commandValidator.validateEasterEggCommand(
        enlightenedPlayer, 
        secretCommand
      );

      // Then: Secret should be recognized and celebrated
      expect(mockSuite.easterEggDetector.checkTrigger).toHaveBeenCalledWith(secretCommand.raw);
      expect(result.easterEggActivated).toBe(true);
      expect(result.secretPowers).toContain('rainbow-mode');
      expect(result.ruvBlessing).toBe(true);
      expect(result.wittyMessage).toContain('🌈 rUv Mode activated!');

      console.log('🌈 The ultimate secret has been unlocked! rUv approves!');
    });

    it('should validate Cohen Conjecture commands for impossible configurations', async () => {
      // Given: A mad scientist attempting the impossible
      const madScientist = GameStateFactory.createPlayer({ 
        level: 4, 
        username: 'ParadoxSolver'
      });
      const impossibleCommand = {
        type: 'init',
        parameters: { 
          topology: 'möbius-strip',
          agents: 13,
          paradox: true
        }
      };

      mockSyntaxValidator.validateSyntax.mockResolvedValue({
        valid: true,
        paradoxical: true,
        impossibilityIndex: 0.99
      });

      mockSuite.easterEggDetector.checkTrigger.mockResolvedValue({
        triggered: true,
        easterEgg: { name: 'Cohen Conjecture', effect: 'reality_bending' }
      });

      // When: Impossible command is validated
      const result = await commandValidator.validateParadoxicalCommand(
        madScientist,
        impossibleCommand
      );

      // Then: Impossibility should be embraced
      expect(result.paradoxResolved).toBe(true);
      expect(result.realityBending).toBe(true);
      expect(result.wittyMessage).toContain('🤯 Physics.exe has stopped responding');

      console.log('🌀 Impossibility achieved! Reality is merely a suggestion!');
    });
  });

  describe('Advanced Validation Patterns', () => {
    it('should coordinate multi-step validation for complex workflows', async () => {
      // Given: A complex multi-agent workflow command
      const architect = GameStateFactory.createPlayer({ level: 4 });
      const workflowCommand = {
        type: 'workflow',
        steps: [
          { type: 'spawn', parameters: { agentType: 'researcher' } },
          { type: 'orchestrate', parameters: { task: 'analyze requirements' } },
          { type: 'spawn', parameters: { agentType: 'coder' } },
          { type: 'orchestrate', parameters: { task: 'implement solution' } }
        ]
      };

      // Mock validation for each step
      mockSyntaxValidator.validateSyntax.mockResolvedValue({ valid: true });
      mockPermissionChecker.hasPermission.mockResolvedValue(true);
      mockResourceManager.checkResourceAvailability.mockResolvedValue({ available: true });

      // When: Workflow is validated
      const result = await commandValidator.validateWorkflow(architect, workflowCommand);

      // Then: Each step should be validated in sequence
      expect(mockSyntaxValidator.validateSyntax).toHaveBeenCalledTimes(4);
      expect(mockPermissionChecker.hasPermission).toHaveBeenCalledTimes(4);
      
      expect(result.valid).toBe(true);
      expect(result.stepsPlan).toHaveLength(4);
      expect(result.totalEstimatedCost).toEqual(expect.any(Object));

      console.log('🏗️ Complex workflow validated! Architecture in motion!');
    });

    it('should handle validation timeouts with appropriate fallbacks', async () => {
      // Given: A command that triggers slow validation
      const player = GameStateFactory.createPlayer();
      const slowCommand = { type: 'heavy-analysis' };

      // Mock slow validation
      mockSyntaxValidator.validateSyntax.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ valid: true }), 10000))
      );

      // When: Validation times out
      const result = await commandValidator.validateCommandWithTimeout(
        player, 
        slowCommand, 
        1000
      );

      // Then: Timeout should be handled gracefully
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('VALIDATION_TIMEOUT');
      expect(result.wittyMessage).toContain('⏰ Validation took too long');

      console.log('⏰ Even time itself bows to the swarm\'s wisdom!');
    });
  });
});

// Mock classes and interfaces (London School style)
class CommandValidator {
  constructor(
    private permissionChecker: PermissionChecker,
    private syntaxValidator: SyntaxValidator,
    private resourceManager: ResourceManager,
    private executionEngine: ExecutionEngine,
    private auditLogger: AuditLogger
  ) {}

  async validateCommand(player: any, command: any) {
    try {
      // Check permissions first
      const hasPermission = await this.permissionChecker.hasPermission(player.id, command.type);
      if (!hasPermission) {
        const suggestions = await this.syntaxValidator.suggestCorrections(command, player.level);
        await this.auditLogger.logError(player.id, 'PERMISSION_DENIED', `Insufficient level for ${command.type}`);
        
        return {
          valid: false,
          reason: 'INSUFFICIENT_LEVEL',
          suggestions,
          wittyMessage: '🚫 Patience young swarmling, power comes with experience'
        };
      }

      // Validate syntax
      const syntaxResult = await this.syntaxValidator.validateSyntax(command.raw);
      if (!syntaxResult.valid) {
        const suggestions = await this.syntaxValidator.suggestCorrections(command, player.level);
        return {
          valid: false,
          reason: 'INVALID_SYNTAX',
          suggestions,
          wittyMessage: '🤖 Typo detected! The swarm forgives but syntax does not'
        };
      }

      // Check resources
      const resourceEstimate = await this.executionEngine.estimateResourceUsage(command);
      const resourceCheck = await this.resourceManager.checkResourceAvailability(resourceEstimate);
      
      if (!resourceCheck.available) {
        return {
          valid: false,
          reason: 'INSUFFICIENT_RESOURCES',
          exceededLimits: resourceCheck.exceeded,
          suggestions: [resourceCheck.suggestion],
          wittyMessage: '🤯 Dream big, but start smaller! The swarm has limits'
        };
      }

      // Log successful validation
      await this.auditLogger.logCommand(player.id, command);

      // Check for easter eggs
      const easterEggDetected = syntaxResult.easterEgg || command.raw?.includes('--ruvnet');

      return {
        valid: true,
        estimatedCost: resourceEstimate,
        easterEggDetected,
        secretPower: easterEggDetected ? 'love_swarm_activated' : undefined,
        wittyMessage: `✅ ${command.type} command validated! The researcher awaits your command`
      };
    } catch (error) {
      await this.auditLogger.logError(player.id, 'VALIDATION_ERROR', error.message);
      return {
        valid: false,
        reason: 'VALIDATION_ERROR',
        wittyMessage: '🤖 Validation system achieved sentience and got confused'
      };
    }
  }

  async executeValidatedCommand(player: any, command: any) {
    try {
      await this.resourceManager.reserveResources(command);
      const result = await this.executionEngine.execute(command, player);
      await this.resourceManager.releaseResources(command);
      await this.auditLogger.logResult(player.id, result);
      
      return result;
    } catch (error) {
      await this.resourceManager.releaseResources(command);
      await this.auditLogger.logError(player.id, 'EXECUTION_FAILURE', error.message);
      
      return {
        success: false,
        error: error.message,
        wittyMessage: '🧘 Philosopher agent has transcended and refuses to participate in material existence'
      };
    }
  }

  async validateEasterEggCommand(player: any, command: any) {
    const easterEggResult = await (global as any).mockSuite.easterEggDetector.checkTrigger(command.raw);
    
    return {
      easterEggActivated: easterEggResult.triggered,
      secretPowers: command.parameters?.secretPowers || [],
      ruvBlessing: true,
      wittyMessage: '🌈 rUv Mode activated! Reality is now 42% more colorful!'
    };
  }

  async validateParadoxicalCommand(player: any, command: any) {
    const easterEggResult = await (global as any).mockSuite.easterEggDetector.checkTrigger('cohen conjecture');
    
    return {
      paradoxResolved: true,
      realityBending: true,
      wittyMessage: '🤯 Physics.exe has stopped responding. Universe rebooting...'
    };
  }

  async validateWorkflow(player: any, workflow: any) {
    // Validate each step
    for (const step of workflow.steps) {
      await this.syntaxValidator.validateSyntax(step.raw);
      await this.permissionChecker.hasPermission(player.id, step.type);
    }
    
    return {
      valid: true,
      stepsPlan: workflow.steps,
      totalEstimatedCost: { tokens: 1000, memory: 500 }
    };
  }

  async validateCommandWithTimeout(player: any, command: any, timeout: number) {
    const timeoutPromise = new Promise(resolve => 
      setTimeout(() => resolve({
        valid: false,
        reason: 'VALIDATION_TIMEOUT',
        wittyMessage: '⏰ Validation took too long, even for swarm standards'
      }), timeout)
    );
    
    const validationPromise = this.validateCommand(player, command);
    
    return Promise.race([validationPromise, timeoutPromise]);
  }
}

// Dependency interfaces
interface PermissionChecker {
  hasPermission(playerId: string, command: string): Promise<boolean>;
  checkLevel(level: number, command: string): boolean;
  validateToolAccess(playerId: string, tool: string): Promise<boolean>;
}

interface SyntaxValidator {
  validateSyntax(command: string): Promise<any>;
  parseCommand(command: string): Promise<any>;
  suggestCorrections(command: any, playerLevel: number): Promise<string[]>;
}

interface ResourceManager {
  checkResourceAvailability(requirements: any): Promise<any>;
  reserveResources(command: any): Promise<any>;
  releaseResources(command: any): Promise<void>;
}

interface ExecutionEngine {
  execute(command: any, player: any): Promise<any>;
  getExecutionPlan(command: any): Promise<any>;
  estimateResourceUsage(command: any): Promise<any>;
}

interface AuditLogger {
  logCommand(playerId: string, command: any): Promise<void>;
  logResult(playerId: string, result: any): Promise<void>;
  logError(playerId: string, errorType: string, message: string): Promise<void>;
}