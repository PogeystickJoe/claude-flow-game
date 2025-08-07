import React from 'react';
import { 
  User, 
  Trophy, 
  Book, 
  Terminal, 
  Settings, 
  Zap,
  Star,
  Target,
  Brain,
  Gift
} from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import SwarmVisualization from './SwarmVisualization';
import CommandSandbox from './CommandSandbox';
import AchievementPanel from './AchievementPanel';
import TutorialOverlay from './TutorialOverlay';
import ParticleEffects from './ParticleEffects';
import NotificationSystem from './NotificationSystem';

// Top Navigation Bar
const TopNavBar: React.FC = () => {
  const { player, ui, setActivePanel, getProgressToNextLevel } = useGameStore();
  const progressToNext = getProgressToNextLevel();

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Player Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">{player.name}</h2>
              <p className="text-sm text-gray-400">Level {player.level}</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="flex items-center space-x-3 min-w-0 flex-1 max-w-md">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">XP</span>
                <span className="text-sm text-gray-300">{player.xp}/{player.xpToNext}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-400">{player.totalXp.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total XP</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1">
          {[
            { id: 'game', label: 'Game', icon: Target },
            { id: 'swarm', label: 'Swarm', icon: Brain },
            { id: 'sandbox', label: 'Sandbox', icon: Terminal },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'tutorial', label: 'Tutorial', icon: Book },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                ui.activePanel === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Quick Stats Panel
const QuickStatsPanel: React.FC = () => {
  const { achievements, sandbox, swarm } = useGameStore();
  
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const successRate = sandbox.history.length > 0 
    ? Math.round((sandbox.history.filter(h => h.success).length / sandbox.history.length) * 100)
    : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-white mb-3 flex items-center">
        <Zap className="w-4 h-4 mr-2 text-yellow-500" />
        Quick Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{unlockedAchievements}</div>
          <div className="text-xs text-gray-300">Achievements</div>
        </div>
        
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{sandbox.history.length}</div>
          <div className="text-xs text-gray-300">Commands</div>
        </div>
        
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{successRate}%</div>
          <div className="text-xs text-gray-300">Success Rate</div>
        </div>
        
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{swarm?.agents?.length || 0}</div>
          <div className="text-xs text-gray-300">Active Agents</div>
        </div>
      </div>
    </div>
  );
};

// Recent Achievements Mini Panel
const RecentAchievements: React.FC = () => {
  const { achievements } = useGameStore();
  
  const recentAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3);

  if (recentAchievements.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center">
          <Gift className="w-4 h-4 mr-2 text-yellow-500" />
          Recent Achievements
        </h3>
        <p className="text-gray-400 text-sm text-center py-4">
          No achievements unlocked yet. Start exploring to earn your first badge!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold text-white mb-3 flex items-center">
        <Gift className="w-4 h-4 mr-2 text-yellow-500" />
        Recent Achievements
      </h3>
      
      <div className="space-y-2">
        {recentAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className="flex items-center space-x-3 p-2 bg-gray-700 rounded"
          >
            <div className="text-lg">{achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm">{achievement.name}</div>
              <div className="text-xs text-gray-400 truncate">{achievement.description}</div>
            </div>
            <div className="text-xs text-yellow-400 font-medium">
              +{achievement.xpReward} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Game Dashboard (Main panel when no specific panel is active)
const GameDashboard: React.FC = () => {
  const { player, swarm, tutorial } = useGameStore();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Claude Flow: The Ascension</h1>
          <p className="opacity-90">
            Master the art of AI swarm orchestration and unlock the secrets of distributed intelligence.
          </p>
          
          {!tutorial.completed && (
            <button 
              className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              onClick={() => useGameStore.getState().setActivePanel('tutorial')}
            >
              Continue Tutorial
            </button>
          )}
        </div>

        {/* Swarm Overview */}
        {swarm ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Swarm</h2>
            <div className="h-64 bg-gray-900 rounded border border-gray-700">
              <SwarmVisualization />
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Active Swarm</h2>
            <p className="text-gray-400 mb-4">
              Initialize your first swarm to begin your journey into distributed AI.
            </p>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => useGameStore.getState().setActivePanel('sandbox')}
            >
              Open Sandbox
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <QuickStatsPanel />
        <RecentAchievements />
        
        {/* Level Progress */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            Level Progress
          </h3>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              Level {player.level}
            </div>
            <div className="text-sm text-gray-400 mb-3">
              {player.xp} / {player.xpToNext} XP to next level
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${useGameStore.getState().getProgressToNextLevel()}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-400">
              Total XP: {player.totalXp.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Game UI Component
export const GameUI: React.FC = () => {
  const { ui, tutorial } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Particle Effects */}
      <ParticleEffects />
      
      {/* Notification System */}
      <NotificationSystem />
      
      {/* Tutorial Overlay */}
      {tutorial.active && <TutorialOverlay />}
      
      {/* Top Navigation */}
      <TopNavBar />
      
      {/* Main Content */}
      <main className="flex-1">
        {ui.activePanel === 'game' && <GameDashboard />}
        {ui.activePanel === 'swarm' && (
          <div className="h-screen-minus-nav">
            <SwarmVisualization />
          </div>
        )}
        {ui.activePanel === 'sandbox' && (
          <div className="p-6 h-screen-minus-nav">
            <CommandSandbox />
          </div>
        )}
        {ui.activePanel === 'achievements' && (
          <div className="p-6">
            <AchievementPanel />
          </div>
        )}
        {ui.activePanel === 'tutorial' && (
          <div className="p-6">
            <TutorialOverlay />
          </div>
        )}
        {ui.activePanel === 'settings' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-white mb-6">Game Settings</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Settings panel coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameUI;