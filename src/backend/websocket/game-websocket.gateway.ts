import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GameService } from '../api/game/game.service';
import { ClaudeFlowService } from '../api/claude-flow/claude-flow.service';
import { NeuralService } from '../api/neural/neural.service';
import { RedisService } from '../services/redis.service';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

import {
  GameEvent,
  GameState,
  WebSocketMessage,
  BattleUpdate,
  SwarmUpdate,
  NeuralPatternUpdate
} from '../../shared/types/game';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  gameId?: string;
  battleId?: string;
  spectating?: string[];
}

interface GameRoom {
  id: string;
  players: Set<string>;
  spectators: Set<string>;
  gameState: GameState;
  lastUpdate: Date;
}

interface BattleRoom {
  id: string;
  participants: Set<string>;
  spectators: Set<string>;
  battleState: any;
  lastUpdate: Date;
}

@Injectable()
@WebSocketGateway({
  port: parseInt(process.env.WS_PORT) || 3001,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  namespace: '/game'
})
export class GameWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameWebSocketGateway.name);
  private gameRooms: Map<string, GameRoom> = new Map();
  private battleRooms: Map<string, BattleRoom> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
    private readonly claudeFlowService: ClaudeFlowService,
    private readonly neuralService: NeuralService,
    private readonly redisService: RedisService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    
    // Set up periodic cleanup
    setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000); // Every 5 minutes
    
    // Set up Redis subscribers for distributed events
    this.setupRedisSubscribers();
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      
      // Track user connections
      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)?.add(client.id);
      this.socketUsers.set(client.id, payload.sub);

      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
      
      // Send connection confirmation
      client.emit('connection_established', {
        socketId: client.id,
        userId: payload.sub,
        timestamp: new Date()
      });
      
    } catch (error) {
      this.logger.error(`Connection failed for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.socketUsers.get(client.id);
    
    if (userId) {
      // Remove from user socket tracking
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
      this.socketUsers.delete(client.id);
      
      // Leave all rooms
      if (client.gameId) {
        this.leaveGameRoom(client, client.gameId);
      }
      if (client.battleId) {
        this.leaveBattleRoom(client, client.battleId);
      }
      
      // Stop spectating
      client.spectating?.forEach(roomId => {
        this.stopSpectating(client, roomId);
      });
    }
    
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const token = client.handshake.auth?.token || 
                  client.handshake.headers?.authorization?.replace('Bearer ', '');
    return token;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join_game')
  async handleJoinGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string }
  ) {
    try {
      const { gameId } = data;
      
      // Verify user has access to this game
      const game = await this.gameService.getGame(gameId);
      if (!game || (game.playerId !== client.userId && 
                   !await this.gameService.hasGameAccess(client.userId!, gameId))) {
        client.emit('error', { message: 'Access denied to game' });
        return;
      }
      
      // Join game room
      await this.joinGameRoom(client, gameId);
      
      // Send current game state
      client.emit('game_state_update', {
        type: 'full_state',
        gameState: game,
        timestamp: new Date()
      });
      
      // Get swarm status if available
      if (game.swarmId) {
        try {
          const swarmStatus = await this.claudeFlowService.getSwarmStatus(gameId);
          client.emit('swarm_update', {
            type: 'status',
            swarmId: game.swarmId,
            status: swarmStatus,
            timestamp: new Date()
          });
        } catch (error) {
          this.logger.warn(`Failed to get swarm status for game ${gameId}:`, error);
        }
      }
      
    } catch (error) {
      this.logger.error(`Error joining game:`, error);
      client.emit('error', { message: 'Failed to join game' });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leave_game')
  handleLeaveGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string }
  ) {
    this.leaveGameRoom(client, data.gameId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join_battle')
  async handleJoinBattle(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { battleId: string }
  ) {
    try {
      const { battleId } = data;
      
      // Verify user can join this battle
      const hasAccess = await this.gameService.canJoinBattle(client.userId!, battleId);
      if (!hasAccess) {
        client.emit('error', { message: 'Cannot join this battle' });
        return;
      }
      
      await this.joinBattleRoom(client, battleId);
      
      // Send current battle state
      const battleState = await this.gameService.getBattleState(battleId);
      client.emit('battle_update', {
        type: 'full_state',
        battleState,
        timestamp: new Date()
      });
      
    } catch (error) {
      this.logger.error(`Error joining battle:`, error);
      client.emit('error', { message: 'Failed to join battle' });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('spectate')
  async handleSpectate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; roomType: 'game' | 'battle' }
  ) {
    try {
      const { roomId, roomType } = data;
      
      if (roomType === 'game') {
        await this.startSpectatingGame(client, roomId);
      } else if (roomType === 'battle') {
        await this.startSpectatingBattle(client, roomId);
      }
      
    } catch (error) {
      this.logger.error(`Error spectating:`, error);
      client.emit('error', { message: 'Failed to start spectating' });
    }
  }

  @UseGuards(WsAuthGuard, RateLimitGuard)
  @SubscribeMessage('game_action')
  async handleGameAction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameId: string; action: any }
  ) {
    try {
      const { gameId, action } = data;
      
      // Verify user owns the game
      const game = await this.gameService.getGame(gameId);
      if (!game || game.playerId !== client.userId) {
        client.emit('error', { message: 'Cannot perform action on this game' });
        return;
      }
      
      // Execute action
      const result = await this.gameService.executeAction(gameId, {
        type: action.type,
        data: action.data,
        playerId: client.userId!,
        timestamp: new Date()
      });
      
      // Broadcast game state update to room
      const gameRoom = this.gameRooms.get(gameId);
      if (gameRoom) {
        this.server.to(`game:${gameId}`).emit('game_state_update', {
          type: 'action_result',
          action,
          result,
          timestamp: new Date()
        });
      }
      
      // Handle special actions
      if (action.type.startsWith('swarm_')) {
        await this.handleSwarmAction(gameId, action, client);
      }
      
      if (action.type === 'neural_pattern_apply') {
        await this.handleNeuralPatternAction(gameId, action, client);
      }
      
    } catch (error) {
      this.logger.error(`Error executing game action:`, error);
      client.emit('action_failed', { 
        action: data.action,
        error: error.message 
      });
    }
  }

  @UseGuards(WsAuthGuard, RateLimitGuard)
  @SubscribeMessage('battle_action')
  async handleBattleAction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { battleId: string; action: any }
  ) {
    try {
      const { battleId, action } = data;
      
      // Verify user is participant in battle
      const canAct = await this.gameService.canActInBattle(client.userId!, battleId);
      if (!canAct) {
        client.emit('error', { message: 'Cannot perform action in this battle' });
        return;
      }
      
      // Execute battle action
      const result = await this.gameService.executeBattleAction(battleId, {
        ...action,
        playerId: client.userId!,
        timestamp: new Date()
      });
      
      // Broadcast to battle room
      this.server.to(`battle:${battleId}`).emit('battle_update', {
        type: 'action_result',
        action,
        result,
        timestamp: new Date()
      });
      
    } catch (error) {
      this.logger.error(`Error executing battle action:`, error);
      client.emit('action_failed', {
        action: data.action,
        error: error.message
      });
    }
  }

  @UseGuards(WsAuthGuard, RateLimitGuard)
  @SubscribeMessage('chat_message')
  async handleChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; roomType: string; message: string }
  ) {
    try {
      const { roomId, roomType, message } = data;
      
      // Validate and sanitize message
      const sanitizedMessage = this.sanitizeMessage(message);
      if (!sanitizedMessage) {
        return;
      }
      
      // Get user info
      const user = await this.gameService.getUserInfo(client.userId!);
      
      const chatMessage = {
        id: `msg_${Date.now()}_${client.id}`,
        userId: client.userId,
        username: user.username,
        message: sanitizedMessage,
        timestamp: new Date()
      };
      
      // Broadcast to appropriate room
      this.server.to(`${roomType}:${roomId}`).emit('chat_message', chatMessage);
      
      // Store in Redis for chat history
      await this.redisService.lpush(
        `chat:${roomType}:${roomId}`,
        JSON.stringify(chatMessage)
      );
      await this.redisService.ltrim(`chat:${roomType}:${roomId}`, 0, 99); // Keep last 100 messages
      
    } catch (error) {
      this.logger.error(`Error handling chat message:`, error);
    }
  }

  // Room management methods
  private async joinGameRoom(client: AuthenticatedSocket, gameId: string) {
    client.join(`game:${gameId}`);
    client.gameId = gameId;
    
    if (!this.gameRooms.has(gameId)) {
      const gameState = await this.gameService.getGame(gameId);
      this.gameRooms.set(gameId, {
        id: gameId,
        players: new Set(),
        spectators: new Set(),
        gameState,
        lastUpdate: new Date()
      });
    }
    
    const room = this.gameRooms.get(gameId)!;
    room.players.add(client.userId!);
    
    this.logger.log(`User ${client.userId} joined game room ${gameId}`);
  }

  private leaveGameRoom(client: AuthenticatedSocket, gameId: string) {
    client.leave(`game:${gameId}`);
    client.gameId = undefined;
    
    const room = this.gameRooms.get(gameId);
    if (room) {
      room.players.delete(client.userId!);
      room.spectators.delete(client.userId!);
      
      if (room.players.size === 0 && room.spectators.size === 0) {
        this.gameRooms.delete(gameId);
      }
    }
    
    this.logger.log(`User ${client.userId} left game room ${gameId}`);
  }

  private async joinBattleRoom(client: AuthenticatedSocket, battleId: string) {
    client.join(`battle:${battleId}`);
    client.battleId = battleId;
    
    if (!this.battleRooms.has(battleId)) {
      const battleState = await this.gameService.getBattleState(battleId);
      this.battleRooms.set(battleId, {
        id: battleId,
        participants: new Set(),
        spectators: new Set(),
        battleState,
        lastUpdate: new Date()
      });
    }
    
    const room = this.battleRooms.get(battleId)!;
    room.participants.add(client.userId!);
    
    this.logger.log(`User ${client.userId} joined battle room ${battleId}`);
  }

  private leaveBattleRoom(client: AuthenticatedSocket, battleId: string) {
    client.leave(`battle:${battleId}`);
    client.battleId = undefined;
    
    const room = this.battleRooms.get(battleId);
    if (room) {
      room.participants.delete(client.userId!);
      room.spectators.delete(client.userId!);
      
      if (room.participants.size === 0 && room.spectators.size === 0) {
        this.battleRooms.delete(battleId);
      }
    }
    
    this.logger.log(`User ${client.userId} left battle room ${battleId}`);
  }

  private async startSpectatingGame(client: AuthenticatedSocket, gameId: string) {
    // Verify game allows spectators
    const game = await this.gameService.getGame(gameId);
    if (!game || !game.allowSpectators) {
      throw new Error('Spectating not allowed for this game');
    }
    
    client.join(`game:${gameId}`);
    if (!client.spectating) {
      client.spectating = [];
    }
    client.spectating.push(gameId);
    
    const room = this.gameRooms.get(gameId);
    if (room) {
      room.spectators.add(client.userId!);
    }
  }

  private async startSpectatingBattle(client: AuthenticatedSocket, battleId: string) {
    // Verify battle allows spectators
    const battle = await this.gameService.getBattleInfo(battleId);
    if (!battle || !battle.allowSpectators) {
      throw new Error('Spectating not allowed for this battle');
    }
    
    client.join(`battle:${battleId}`);
    if (!client.spectating) {
      client.spectating = [];
    }
    client.spectating.push(battleId);
    
    const room = this.battleRooms.get(battleId);
    if (room) {
      room.spectators.add(client.userId!);
    }
  }

  private stopSpectating(client: AuthenticatedSocket, roomId: string) {
    const [roomType] = roomId.split(':');
    client.leave(`${roomType}:${roomId}`);
    
    if (client.spectating) {
      const index = client.spectating.indexOf(roomId);
      if (index > -1) {
        client.spectating.splice(index, 1);
      }
    }
  }

  // Special action handlers
  private async handleSwarmAction(gameId: string, action: any, client: AuthenticatedSocket) {
    try {
      const swarmUpdate = await this.claudeFlowService.executeSwarmAction(gameId, action);
      
      // Broadcast swarm update to game room
      this.server.to(`game:${gameId}`).emit('swarm_update', {
        type: 'action_result',
        swarmId: swarmUpdate.swarmId,
        action,
        update: swarmUpdate,
        timestamp: new Date()
      });
      
    } catch (error) {
      this.logger.error(`Swarm action failed:`, error);
      client.emit('swarm_action_failed', { action, error: error.message });
    }
  }

  private async handleNeuralPatternAction(gameId: string, action: any, client: AuthenticatedSocket) {
    try {
      const patternResult = await this.neuralService.applyPatternToGame(gameId, action.patternId);
      
      // Broadcast pattern update to game room
      this.server.to(`game:${gameId}`).emit('neural_pattern_update', {
        type: 'applied',
        patternId: action.patternId,
        result: patternResult,
        timestamp: new Date()
      });
      
    } catch (error) {
      this.logger.error(`Neural pattern action failed:`, error);
      client.emit('neural_action_failed', { action, error: error.message });
    }
  }

  // Utility methods
  private sanitizeMessage(message: string): string | null {
    if (!message || typeof message !== 'string') {
      return null;
    }
    
    // Basic sanitization
    const sanitized = message.trim().slice(0, 500); // Max 500 chars
    
    // Check for profanity or spam patterns
    if (this.containsProfanity(sanitized) || this.isSpam(sanitized)) {
      return null;
    }
    
    return sanitized;
  }

  private containsProfanity(message: string): boolean {
    // Implement profanity filter
    // This is a simple example - use a proper library in production
    const profanityWords = ['badword1', 'badword2']; // Add actual profanity list
    return profanityWords.some(word => message.toLowerCase().includes(word));
  }

  private isSpam(message: string): boolean {
    // Basic spam detection
    const repeatedChars = /(.)\1{10,}/.test(message);
    const allCaps = message.length > 10 && message === message.toUpperCase();
    return repeatedChars || allCaps;
  }

  private cleanupInactiveRooms() {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30 minutes
    
    // Cleanup game rooms
    for (const [gameId, room] of this.gameRooms.entries()) {
      if (room.players.size === 0 && room.spectators.size === 0 &&
          now.getTime() - room.lastUpdate.getTime() > timeout) {
        this.gameRooms.delete(gameId);
        this.logger.log(`Cleaned up inactive game room: ${gameId}`);
      }
    }
    
    // Cleanup battle rooms
    for (const [battleId, room] of this.battleRooms.entries()) {
      if (room.participants.size === 0 && room.spectators.size === 0 &&
          now.getTime() - room.lastUpdate.getTime() > timeout) {
        this.battleRooms.delete(battleId);
        this.logger.log(`Cleaned up inactive battle room: ${battleId}`);
      }
    }
  }

  private setupRedisSubscribers() {
    // Subscribe to distributed events
    this.redisService.subscribe('game_events', (message) => {
      const event = JSON.parse(message);
      this.handleDistributedGameEvent(event);
    });
    
    this.redisService.subscribe('battle_events', (message) => {
      const event = JSON.parse(message);
      this.handleDistributedBattleEvent(event);
    });
    
    this.redisService.subscribe('neural_events', (message) => {
      const event = JSON.parse(message);
      this.handleDistributedNeuralEvent(event);
    });
  }

  private handleDistributedGameEvent(event: any) {
    // Handle events from other instances
    this.server.to(`game:${event.gameId}`).emit('game_state_update', event);
  }

  private handleDistributedBattleEvent(event: any) {
    // Handle battle events from other instances
    this.server.to(`battle:${event.battleId}`).emit('battle_update', event);
  }

  private handleDistributedNeuralEvent(event: any) {
    // Handle neural pattern events from other instances
    this.server.emit('neural_pattern_update', event);
  }

  // Public methods for external services to broadcast events
  public broadcastGameUpdate(gameId: string, update: any) {
    this.server.to(`game:${gameId}`).emit('game_state_update', update);
  }

  public broadcastBattleUpdate(battleId: string, update: any) {
    this.server.to(`battle:${battleId}`).emit('battle_update', update);
  }

  public broadcastSwarmUpdate(gameId: string, swarmUpdate: SwarmUpdate) {
    this.server.to(`game:${gameId}`).emit('swarm_update', swarmUpdate);
  }

  public broadcastNeuralUpdate(patternUpdate: NeuralPatternUpdate) {
    this.server.emit('neural_pattern_update', patternUpdate);
  }

  public notifyUser(userId: string, notification: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }
}

export default GameWebSocketGateway;