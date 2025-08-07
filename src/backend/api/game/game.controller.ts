import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { GameService } from './game.service';
import { ClaudeFlowService } from '../claude-flow/claude-flow.service';
import { NeuralService } from '../neural/neural.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { User } from '../auth/decorators/user.decorator';
import { ValidationPipe } from '../common/pipes/validation.pipe';

import {
  CreateGameDto,
  UpdateGameDto,
  GameActionDto,
  SwarmCommandDto,
  NeuralPatternDto
} from './dto/game.dto';
import {
  GameState,
  GameResult,
  SwarmConfiguration,
  NeuralPattern
} from '../../shared/types/game';

@ApiTags('game')
@Controller('api/game')
@UseGuards(JwtAuthGuard, RateLimitGuard)
@ApiBearerAuth()
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly claudeFlowService: ClaudeFlowService,
    private readonly neuralService: NeuralService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid game configuration' })
  async createGame(
    @User() user: any,
    @Body(ValidationPipe) createGameDto: CreateGameDto
  ): Promise<GameState> {
    try {
      // Initialize game state
      const gameState = await this.gameService.createGame({
        ...createGameDto,
        playerId: user.id
      });

      // Initialize swarm for the game
      const swarmConfig: SwarmConfiguration = {
        topology: createGameDto.swarmTopology || 'mesh',
        maxAgents: createGameDto.maxAgents || 5,
        agentTypes: createGameDto.agentTypes || [
          { type: 'researcher', capabilities: ['analysis'], specializations: [], powerLevel: 1 },
          { type: 'coder', capabilities: ['implementation'], specializations: [], powerLevel: 1 }
        ],
        coordination: {
          strategy: 'adaptive',
          priority: 'medium',
          timeout: 30000,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000
          }
        },
        neuralPatterns: []
      };

      await this.claudeFlowService.initializeSwarm(gameState.id, swarmConfig);
      
      // Load initial neural patterns
      const initialPatterns = await this.neuralService.getInitialPatterns(
        createGameDto.level
      );
      
      await this.gameService.updateNeuralPatterns(
        gameState.id,
        initialPatterns.map(p => p.id)
      );

      return gameState;
    } catch (error) {
      throw new HttpException(
        `Failed to create game: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game state' })
  @ApiResponse({ status: 200, description: 'Game state retrieved' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGame(
    @User() user: any,
    @Param('id') gameId: string
  ): Promise<GameState> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
    
    // Verify user has access to this game
    if (game.playerId !== user.id && !await this.gameService.hasGameAccess(user.id, gameId)) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    
    return game;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update game state' })
  @ApiResponse({ status: 200, description: 'Game updated successfully' })
  async updateGame(
    @User() user: any,
    @Param('id') gameId: string,
    @Body(ValidationPipe) updateGameDto: UpdateGameDto
  ): Promise<GameState> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    return this.gameService.updateGame(gameId, updateGameDto);
  }

  @Post(':id/action')
  @ApiOperation({ summary: 'Execute game action' })
  @ApiResponse({ status: 200, description: 'Action executed successfully' })
  async executeAction(
    @User() user: any,
    @Param('id') gameId: string,
    @Body(ValidationPipe) actionDto: GameActionDto
  ): Promise<{ success: boolean; result: any }> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    try {
      const result = await this.gameService.executeAction(gameId, actionDto);
      
      // If action involves swarm, coordinate with Claude Flow
      if (actionDto.type.startsWith('swarm_')) {
        await this.claudeFlowService.executeSwarmAction(gameId, actionDto);
      }
      
      // If action triggers neural pattern evolution
      if (actionDto.type === 'neural_evolution') {
        const evolutionResult = await this.neuralService.evolvePattern(
          gameId,
          actionDto.data.patternId
        );
        return { success: true, result: evolutionResult };
      }
      
      return { success: true, result };
    } catch (error) {
      return { success: false, result: { error: error.message } };
    }
  }

  @Post(':id/swarm/deploy')
  @ApiOperation({ summary: 'Deploy swarm configuration' })
  @ApiResponse({ status: 200, description: 'Swarm deployed successfully' })
  async deploySwarm(
    @User() user: any,
    @Param('id') gameId: string,
    @Body(ValidationPipe) swarmCommand: SwarmCommandDto
  ): Promise<{ swarmId: string; status: string }> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    const swarmResult = await this.claudeFlowService.deploySwarm(
      gameId,
      swarmCommand.configuration
    );
    
    // Update game state with swarm info
    await this.gameService.updateSwarmInfo(gameId, swarmResult);
    
    return swarmResult;
  }

  @Get(':id/swarm/status')
  @ApiOperation({ summary: 'Get swarm status' })
  @ApiResponse({ status: 200, description: 'Swarm status retrieved' })
  async getSwarmStatus(
    @User() user: any,
    @Param('id') gameId: string
  ) {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    return this.claudeFlowService.getSwarmStatus(gameId);
  }

  @Post(':id/neural/apply')
  @ApiOperation({ summary: 'Apply neural pattern' })
  @ApiResponse({ status: 200, description: 'Neural pattern applied' })
  async applyNeuralPattern(
    @User() user: any,
    @Param('id') gameId: string,
    @Body(ValidationPipe) patternDto: NeuralPatternDto
  ): Promise<{ applied: boolean; effects: any }> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    const pattern = await this.neuralService.getPattern(patternDto.patternId);
    if (!pattern) {
      throw new HttpException('Neural pattern not found', HttpStatus.NOT_FOUND);
    }
    
    // Apply pattern to game
    const effects = await this.gameService.applyNeuralPattern(gameId, pattern);
    
    // Update swarm with pattern
    await this.claudeFlowService.applyNeuralPattern(gameId, pattern);
    
    return { applied: true, effects };
  }

  @Post(':id/neural/evolve')
  @ApiOperation({ summary: 'Trigger neural pattern evolution' })
  @ApiResponse({ status: 200, description: 'Pattern evolution initiated' })
  async evolveNeuralPattern(
    @User() user: any,
    @Param('id') gameId: string,
    @Body() data: { patternId: string; feedback: any }
  ): Promise<{ evolved: boolean; newPattern?: NeuralPattern }> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    try {
      const evolutionResult = await this.neuralService.evolvePattern(
        data.patternId,
        data.feedback,
        { gameId, context: 'game_evolution' }
      );
      
      if (evolutionResult.success) {
        // Update game with new pattern
        await this.gameService.addNeuralPattern(gameId, evolutionResult.pattern.id);
        
        return { evolved: true, newPattern: evolutionResult.pattern };
      }
      
      return { evolved: false };
    } catch (error) {
      throw new HttpException(
        `Pattern evolution failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get level leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  async getLeaderboard(
    @Param('id') gameId: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0
  ) {
    return this.gameService.getLeaderboard(gameId, { limit, offset });
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete game' })
  @ApiResponse({ status: 200, description: 'Game completed' })
  async completeGame(
    @User() user: any,
    @Param('id') gameId: string,
    @Body() completionData: { score: number; stats: any }
  ): Promise<GameResult> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    try {
      // Finalize game state
      const gameResult = await this.gameService.completeGame(
        gameId,
        completionData
      );
      
      // Train neural patterns based on performance
      await this.neuralService.trainFromGameplay(gameId, gameResult);
      
      // Update player stats
      await this.gameService.updatePlayerStats(user.id, gameResult);
      
      // Cleanup swarm
      await this.claudeFlowService.cleanupSwarm(gameId);
      
      return gameResult;
    } catch (error) {
      throw new HttpException(
        `Failed to complete game: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete game' })
  @ApiResponse({ status: 200, description: 'Game deleted' })
  async deleteGame(
    @User() user: any,
    @Param('id') gameId: string
  ): Promise<{ deleted: boolean }> {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    // Cleanup all related resources
    await this.claudeFlowService.cleanupSwarm(gameId);
    await this.gameService.deleteGame(gameId);
    
    return { deleted: true };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get detailed game statistics' })
  @ApiResponse({ status: 200, description: 'Game statistics retrieved' })
  async getGameStats(
    @User() user: any,
    @Param('id') gameId: string
  ) {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || (game.playerId !== user.id && !await this.gameService.hasGameAccess(user.id, gameId))) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    const [gameStats, swarmStats, neuralStats] = await Promise.all([
      this.gameService.getGameStatistics(gameId),
      this.claudeFlowService.getSwarmStatistics(gameId),
      this.neuralService.getPatternStatistics(gameId)
    ]);
    
    return {
      game: gameStats,
      swarm: swarmStats,
      neural: neuralStats,
      combined: this.gameService.calculateCombinedStats(gameStats, swarmStats, neuralStats)
    };
  }

  @Post(':id/replay')
  @ApiOperation({ summary: 'Generate game replay' })
  @ApiResponse({ status: 200, description: 'Replay generated' })
  @ApiConsumes('multipart/form-data')
  async generateReplay(
    @User() user: any,
    @Param('id') gameId: string,
    @UploadedFile(FileInterceptor('config')) configFile?: Express.Multer.File
  ) {
    const game = await this.gameService.getGame(gameId);
    
    if (!game || game.playerId !== user.id) {
      throw new HttpException('Game not found or access denied', HttpStatus.NOT_FOUND);
    }
    
    const replayConfig = configFile 
      ? JSON.parse(configFile.buffer.toString())
      : { includeSwarmData: true, includeNeuralEvolution: true };
    
    const replay = await this.gameService.generateReplay(gameId, replayConfig);
    
    return {
      replayId: replay.id,
      downloadUrl: `/api/replays/${replay.id}/download`,
      metadata: replay.metadata
    };
  }
}

export default GameController;