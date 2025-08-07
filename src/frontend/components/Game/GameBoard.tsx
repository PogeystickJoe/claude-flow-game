import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

import { GameState, SwarmConfiguration, NeuralPattern } from '../../shared/types/game';
import { SwarmVisualization } from './SwarmVisualization';
import { NeuralPatternDisplay } from './NeuralPatternDisplay';
import { GameControls } from './GameControls';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSwarmOrchestration } from '../../hooks/useSwarmOrchestration';
import { gameActions } from '../../store/gameSlice';

interface GameBoardProps {
  gameId: string;
  playerId: string;
  level: number;
  mode: 'single' | 'multiplayer' | 'tournament';
  onGameEnd?: (result: GameResult) => void;
}

interface GameResult {
  score: number;
  completed: boolean;
  achievements: string[];
  stats: GameStats;
}

interface GameStats {
  duration: number;
  moves: number;
  efficiency: number;
  swarmPerformance: SwarmPerformanceMetrics;
}

interface SwarmPerformanceMetrics {
  coordination: number;
  adaptability: number;
  taskCompletion: number;
  emergentBehaviors: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameId,
  playerId,
  level,
  mode,
  onGameEnd
}) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: any) => state.game.currentGame);
  const swarmState = useSelector((state: any) => state.swarm);
  const neuralPatterns = useSelector((state: any) => state.neural.patterns);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    duration: 0,
    moves: 0,
    efficiency: 0,
    swarmPerformance: {
      coordination: 0,
      adaptability: 0,
      taskCompletion: 0,
      emergentBehaviors: 0
    }
  });

  // WebSocket connection for real-time updates
  const { socket, isConnected, sendMessage } = useWebSocket({
    url: `${process.env.REACT_APP_WS_URL}/game`,
    channels: [`game:${gameId}`, `player:${playerId}`],
    onMessage: handleWebSocketMessage
  });

  // Swarm orchestration hook
  const {
    swarm,
    deploySwarm,
    updateSwarmConfig,
    monitorSwarm,
    isSwarmActive
  } = useSwarmOrchestration({
    gameId,
    playerId,
    onSwarmUpdate: handleSwarmUpdate
  });

  // Initialize game
  useEffect(() => {
    initializeGame();
    return () => {
      cleanupGame();
    };
  }, [gameId, level]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive) {
      interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  const initializeGame = useCallback(async () => {
    try {
      // Initialize game state
      dispatch(gameActions.initializeGame({
        gameId,
        playerId,
        level,
        mode
      }));

      // Load level configuration
      const levelConfig = await fetch(`/api/levels/${level}`).then(res => res.json());
      
      // Deploy initial swarm
      await deploySwarm(levelConfig.swarmConfig);
      
      // Load neural patterns
      dispatch(gameActions.loadNeuralPatterns(level));
      
      setIsGameActive(true);
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }, [gameId, playerId, level, mode]);

  const cleanupGame = useCallback(() => {
    setIsGameActive(false);
    // Cleanup resources
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'game_state_update':
        dispatch(gameActions.updateGameState(message.payload));
        break;
      case 'swarm_update':
        handleSwarmUpdate(message.payload);
        break;
      case 'neural_pattern_evolved':
        dispatch(gameActions.addNeuralPattern(message.payload));
        break;
      case 'battle_update':
        if (mode === 'multiplayer') {
          dispatch(gameActions.updateBattleState(message.payload));
        }
        break;
    }
  }

  function handleSwarmUpdate(swarmData: any) {
    dispatch(gameActions.updateSwarmState(swarmData));
    
    // Update performance metrics
    setGameStats(prev => ({
      ...prev,
      swarmPerformance: {
        coordination: swarmData.coordination || 0,
        adaptability: swarmData.adaptability || 0,
        taskCompletion: swarmData.taskCompletion || 0,
        emergentBehaviors: swarmData.emergentBehaviors || 0
      }
    }));
  }

  const handlePlayerAction = useCallback((action: any) => {
    if (!isGameActive) return;
    
    // Send action to game service
    sendMessage({
      type: 'player_action',
      payload: {
        gameId,
        playerId,
        action,
        timestamp: Date.now()
      }
    });

    // Update local stats
    setGameStats(prev => ({
      ...prev,
      moves: prev.moves + 1,
      efficiency: calculateEfficiency(prev.moves + 1, prev.duration)
    }));

    // Trigger swarm adaptation
    if (swarm && action.type === 'swarm_command') {
      updateSwarmConfig(action.swarmUpdate);
    }
  }, [isGameActive, gameId, playerId, sendMessage, swarm]);

  const calculateEfficiency = (moves: number, duration: number): number => {
    if (duration === 0) return 0;
    return Math.min(100, Math.max(0, 100 - (moves / duration) * 10));
  };

  const handleGameComplete = useCallback((success: boolean) => {
    setIsGameActive(false);
    
    const result: GameResult = {
      score: gameState?.score || 0,
      completed: success,
      achievements: gameState?.achievements || [],
      stats: gameStats
    };

    onGameEnd?.(result);
  }, [gameState, gameStats, onGameEnd]);

  return (
    <div className="game-board-container">
      <div className="game-header">
        <div className="game-info">
          <h2>Level {level}</h2>
          <div className="game-stats">
            <span>Score: {gameState?.score || 0}</span>
            <span>Time: {Math.floor(gameStats.duration / 60)}:{(gameStats.duration % 60).toString().padStart(2, '0')}</span>
            <span>Efficiency: {gameStats.efficiency.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="game-content">
        <div className="main-game-area">
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 10, 10], fov: 60 }}
            style={{ width: '100%', height: '600px' }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} />
            <Stars />
            
            <Physics>
              <SwarmVisualization
                swarm={swarm}
                isActive={isSwarmActive}
                onSwarmInteraction={handlePlayerAction}
              />
            </Physics>
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxDistance={50}
              minDistance={5}
            />
          </Canvas>
        </div>

        <div className="game-sidebar">
          <div className="swarm-panel">
            <h3>Swarm Control</h3>
            <div className="swarm-metrics">
              <div className="metric">
                <label>Coordination</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${gameStats.swarmPerformance.coordination}%` }}
                  />
                </div>
              </div>
              <div className="metric">
                <label>Adaptability</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${gameStats.swarmPerformance.adaptability}%` }}
                  />
                </div>
              </div>
              <div className="metric">
                <label>Task Completion</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${gameStats.swarmPerformance.taskCompletion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="neural-patterns-panel">
            <h3>Neural Patterns</h3>
            <NeuralPatternDisplay
              patterns={neuralPatterns}
              onPatternSelect={(pattern: NeuralPattern) => {
                handlePlayerAction({
                  type: 'apply_neural_pattern',
                  pattern: pattern.id
                });
              }}
            />
          </div>

          <div className="game-controls-panel">
            <GameControls
              isGameActive={isGameActive}
              gameState={gameState}
              onAction={handlePlayerAction}
              onPause={() => setIsGameActive(false)}
              onResume={() => setIsGameActive(true)}
              onQuit={() => handleGameComplete(false)}
            />
          </div>
        </div>
      </div>

      {mode === 'multiplayer' && (
        <div className="multiplayer-panel">
          {/* Multiplayer-specific UI components */}
          <div className="opponent-info">
            {/* Opponent swarms, scores, etc. */}
          </div>
          
          <div className="battle-chat">
            {/* Real-time chat component */}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;