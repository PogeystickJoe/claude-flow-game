import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { Agent, SwarmState, Particle, VisualizationNode } from '../types/game';

// Agent Node Component
interface AgentNodeProps {
  agent: Agent;
  swarmState: SwarmState;
}

const AgentNode: React.FC<AgentNodeProps> = ({ agent, swarmState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Group>(null);
  
  // Agent colors based on type and status
  const getAgentColor = (agent: Agent): string => {
    const statusColors = {
      idle: '#4ade80',      // green
      busy: '#f59e0b',      // amber
      error: '#ef4444',     // red
      offline: '#6b7280'    // gray
    };
    
    const typeColors = {
      researcher: '#3b82f6',    // blue
      coder: '#8b5cf6',         // purple
      analyst: '#06b6d4',       // cyan
      optimizer: '#f97316',     // orange
      coordinator: '#ec4899'    // pink
    };
    
    return agent.status === 'idle' ? typeColors[agent.type as keyof typeof typeColors] || statusColors.idle : statusColors[agent.status];
  };

  // Pulsing animation for active agents
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const pulseIntensity = agent.status === 'busy' ? 0.3 : 0.1;
      const scale = 1 + Math.sin(time * 3) * pulseIntensity;
      meshRef.current.scale.setScalar(scale);
      
      // Floating animation
      meshRef.current.position.y = agent.position.y + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group position={[agent.position.x, agent.position.y, agent.position.z]}>
      {/* Main agent sphere */}
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial 
          color={getAgentColor(agent)}
          transparent
          opacity={0.8}
          emissive={getAgentColor(agent)}
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      {/* Agent label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.name || agent.type}
      </Text>
      
      {/* Status indicator */}
      <Sphere args={[0.05, 8, 8]} position={[0.25, 0.25, 0]}>
        <meshBasicMaterial color={getAgentColor(agent)} />
      </Sphere>
      
      {/* Performance ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 16]} />
        <meshBasicMaterial 
          color={getAgentColor(agent)} 
          transparent 
          opacity={agent.performance.efficiency} 
        />
      </mesh>
    </group>
  );
};

// Connection Line Component
interface ConnectionProps {
  from: Agent;
  to: Agent;
  strength: number;
}

const Connection: React.FC<ConnectionProps> = ({ from, to, strength }) => {
  const lineRef = useRef<THREE.BufferGeometry>(null);
  
  const points = useMemo(() => [
    new THREE.Vector3(from.position.x, from.position.y, from.position.z),
    new THREE.Vector3(to.position.x, to.position.y, to.position.z)
  ], [from.position, to.position]);

  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.elapsedTime;
      const opacity = 0.3 + Math.sin(time * 2) * 0.2;
      // Update line opacity based on connection strength
    }
  });

  return (
    <Line
      points={points}
      color="#60a5fa"
      lineWidth={strength * 2}
      transparent
      opacity={strength}
    />
  );
};

// Data Flow Particles
interface DataParticleProps {
  particle: Particle;
}

const DataParticle: React.FC<DataParticleProps> = ({ particle }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Update particle position based on velocity
      meshRef.current.position.x += particle.velocity.x * 0.01;
      meshRef.current.position.y += particle.velocity.y * 0.01;
      meshRef.current.position.z += particle.velocity.z * 0.01;
      
      // Fade out over time
      const lifeRatio = particle.life / particle.maxLife;
      meshRef.current.material.opacity = lifeRatio;
      
      // Color based on particle type
      const colors = {
        success: '#10b981',
        data: '#3b82f6',
        energy: '#f59e0b',
        celebration: '#ec4899'
      };
      
      meshRef.current.material.color.set(colors[particle.type] || colors.data);
    }
  });

  return (
    <Sphere 
      ref={meshRef}
      args={[particle.size, 8, 8]}
      position={[particle.position.x, particle.position.y, particle.position.z]}
    >
      <meshBasicMaterial transparent />
    </Sphere>
  );
};

// Topology Grid Background
const TopologyGrid: React.FC<{ topology: string }> = ({ topology }) => {
  const gridRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const getGridPattern = () => {
    switch (topology) {
      case 'mesh':
        return <gridHelper args={[10, 10, '#1f2937', '#374151']} />;
      case 'hierarchical':
        return <gridHelper args={[8, 4, '#1f2937', '#374151']} />;
      case 'ring':
        return (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3, 3.1, 32]} />
            <meshBasicMaterial color="#374151" transparent opacity={0.5} />
          </mesh>
        );
      case 'star':
        return <gridHelper args={[6, 6, '#1f2937', '#374151']} />;
      default:
        return <gridHelper args={[10, 10, '#1f2937', '#374151']} />;
    }
  };

  return <group ref={gridRef}>{getGridPattern()}</group>;
};

// Performance Overlay
const PerformanceOverlay: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <group position={[0, 4, 0]}>
      <Text
        fontSize={0.3}
        color="#10b981"
        anchorX="center"
        position={[0, 1, 0]}
      >
        System Performance
      </Text>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        position={[0, 0.5, 0]}
      >
        {`Efficiency: ${(metrics.throughput * 100).toFixed(1)}%`}
      </Text>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        position={[0, 0.1, 0]}
      >
        {`Load: ${(metrics.systemLoad * 100).toFixed(1)}%`}
      </Text>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        position={[0, -0.3, 0]}
      >
        {`Tasks: ${metrics.completedTasks}/${metrics.totalTasks}`}
      </Text>
    </group>
  );
};

// Main Swarm Visualization Component
export const SwarmVisualization: React.FC = () => {
  const swarm = useGameStore((state) => state.swarm);
  const ui = useGameStore((state) => state.ui);
  
  if (!swarm) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl text-white mb-2">No Active Swarm</h3>
          <p className="text-gray-400">Initialize a swarm to see the visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0f0f23, #1a1a2e)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={ui.animations}
          autoRotateSpeed={0.5}
        />
        
        {/* Background Grid */}
        <TopologyGrid topology={swarm.topology} />
        
        {/* Agents */}
        {swarm.agents.map((agent) => (
          <AgentNode 
            key={agent.id} 
            agent={agent} 
            swarmState={swarm}
          />
        ))}
        
        {/* Connections */}
        {swarm.agents.map((agent) =>
          agent.connections.map((connectionId) => {
            const targetAgent = swarm.agents.find(a => a.id === connectionId);
            return targetAgent ? (
              <Connection
                key={`${agent.id}-${connectionId}`}
                from={agent}
                to={targetAgent}
                strength={0.6}
              />
            ) : null;
          })
        )}
        
        {/* Data Particles */}
        {swarm.visualization.particles.map((particle) => (
          <DataParticle key={particle.id} particle={particle} />
        ))}
        
        {/* Performance Overlay */}
        <PerformanceOverlay metrics={swarm.performance} />
        
        {/* Success Effects */}
        {ui.particles && (
          <group>
            {/* Add celebration particles when achievements are unlocked */}
          </group>
        )}
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white">
        <h3 className="font-bold mb-2">Swarm Status</h3>
        <div className="text-sm space-y-1">
          <div>Topology: <span className="text-blue-400">{swarm.topology}</span></div>
          <div>Agents: <span className="text-green-400">{swarm.agents.length}</span></div>
          <div>Active Tasks: <span className="text-yellow-400">{swarm.tasks.filter(t => t.status === 'in_progress').length}</span></div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 text-white">
        <h3 className="font-bold mb-2">Performance</h3>
        <div className="text-sm space-y-1">
          <div>Efficiency: <span className="text-green-400">{(swarm.performance.throughput * 100).toFixed(1)}%</span></div>
          <div>Load: <span className={swarm.performance.systemLoad > 0.8 ? 'text-red-400' : 'text-blue-400'}>{(swarm.performance.systemLoad * 100).toFixed(1)}%</span></div>
          <div>Latency: <span className="text-purple-400">{swarm.performance.networkLatency.toFixed(0)}ms</span></div>
        </div>
      </div>
    </div>
  );
};

export default SwarmVisualization;