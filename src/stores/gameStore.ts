import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { GameState, Player, Achievement, Level, SwarmState, GameEvent } from '../types/game';
import { achievementsData } from '../systems/achievementSystem';
import { levelsData } from '../systems/levelSystem';
import { tutorialSteps } from '../systems/tutorialSystem';
import { WikiTutorialModule, WikiTutorialChallenge } from '../systems/wikiTutorialSystem';

interface GameStore extends GameState {
  // Actions
  initializeGame: () => void;
  updatePlayer: (updates: Partial<Player>) => void;
  addXp: (amount: number, source?: string) => void;
  unlockAchievement: (achievementId: string) => void;
  setCurrentLevel: (level: number) => void;
  updateSwarm: (swarm: SwarmState) => void;
  executeCommand: (command: string) => Promise<any>;
  nextTutorialStep: () => void;
  completeTutorial: () => void;
  showNotification: (notification: any) => void;
  dismissNotification: (id: string) => void;
  setActivePanel: (panel: 'game' | 'swarm' | 'sandbox' | 'achievements' | 'tutorial' | 'wiki' | 'settings') => void;
  updateSettings: (settings: Partial<any>) => void;
  emitEvent: (event: GameEvent) => void;
  
  // Easter Egg System
  checkEasterEgg: (input: string) => void;
  
  // Auto-Update System
  integrateNewFeatures: (features: string[]) => void;
  updateClaudeFlowVersion: (version: string) => void;
  
  // Wiki Tutorial System
  startWikiModule: (moduleId: string) => void;
  completeWikiModule: (moduleId: string, score: number) => void;
  startWikiChallenge: (challengeId: string) => void;
  completeWikiChallenge: (challengeId: string, score: number, timeSpent: number) => void;
  updateWikiProgress: (moduleId: string, progress: number) => void;
  getWikiModuleProgress: (moduleId: string) => number;
  getCompletedWikiModules: () => string[];
  getCompletedWikiChallenges: () => string[];
  
  // Computed Values
  getUnlockedAchievements: () => Achievement[];
  getProgressToNextLevel: () => number;
  getCurrentLevelData: () => Level;
}

// Initial state
const createInitialPlayer = (): Player => ({
  id: 'player-1',
  name: 'Claude Flow Apprentice',
  level: 1,
  xp: 0,
  xpToNext: 100,
  totalXp: 0,
  avatar: 'default',
  joinDate: new Date(),
  lastActive: new Date(),
});

const initialState: Omit<GameState, keyof GameStore> = {
  player: createInitialPlayer(),
  achievements: achievementsData,
  claudeFlowVersion: 'unknown',
  discoveredFeatures: [],
  levels: levelsData,
  currentLevel: 1,
  swarm: null,
  tutorial: {
    active: false,
    currentStep: 0,
    totalSteps: tutorialSteps.length,
    stepData: tutorialSteps,
    completed: false,
    skipped: false,
  },
  sandbox: {
    active: false,
    mode: 'practice',
    history: [],
    currentCommand: '',
    output: '',
    errors: [],
  },
  ui: {
    activePanel: 'game',
    notifications: [],
    modals: [],
    theme: 'dark',
    animations: true,
    particles: true,
    sound: true,
  },
  settings: {
    difficulty: 'beginner',
    autoSave: true,
    tutorialEnabled: true,
    particleIntensity: 0.8,
    soundVolume: 0.7,
    musicVolume: 0.5,
    visualEffects: true,
    realTimeExecution: true,
    easterEggsEnabled: true,
  },
  // Wiki Tutorial System State
  wikiProgress: {
    completedModules: [],
    completedChallenges: [],
    moduleProgress: new Map<string, number>(),
    challengeAttempts: new Map<string, number>(),
    totalXpEarned: 0,
    currentStreak: 0,
    bestScores: new Map<string, number>(),
    timeSpent: new Map<string, number>(),
  },
};

// XP calculation system
const calculateXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

const calculateLevel = (totalXp: number): number => {
  let level = 1;
  let requiredXp = 0;
  
  while (requiredXp <= totalXp) {
    requiredXp += calculateXpForLevel(level);
    if (requiredXp <= totalXp) level++;
  }
  
  return level;
};

// Easter Eggs - rUv tribute system
const easterEggs = [
  {
    id: 'ruv-founder',
    trigger: /\bruv\b/i,
    achievement: 'ruv-tribute-founder',
    message: '🎉 You discovered the founder! rUv created this amazing system!'
  },
  {
    id: 'ruv-mode',
    trigger: /ruv.?mode/i,
    achievement: 'ruv-mode-activated',
    message: '⚡ rUv Mode Activated! Maximum power unlocked!'
  },
  {
    id: 'claude-flow',
    trigger: /claude.?flow.*ascension/i,
    achievement: 'ascension-master',
    message: '🚀 The Ascension begins! You understand the true power!'
  },
  {
    id: 'neural-tribute',
    trigger: /neural.*swarm.*ruv/i,
    achievement: 'neural-architect-tribute',
    message: '🧠 Neural tribute to the architect of swarm intelligence!'
  }
];

export const useGameStore = create<GameStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        initializeGame: () => {
          const player = createInitialPlayer();
          set({ player, tutorial: { ...initialState.tutorial, active: true } });
        },

        updatePlayer: (updates) => {
          set((state) => ({
            player: { ...state.player, ...updates, lastActive: new Date() }
          }));
        },

        addXp: (amount, source = 'unknown') => {
          set((state) => {
            const newTotalXp = state.player.totalXp + amount;
            const newLevel = calculateLevel(newTotalXp);
            const levelChanged = newLevel > state.player.level;
            
            const currentLevelXp = newTotalXp - levelsData
              .slice(0, newLevel - 1)
              .reduce((sum, level) => sum + level.xpRequired, 0);
            
            const xpToNext = calculateXpForLevel(newLevel) - currentLevelXp;

            // Level up notification
            if (levelChanged) {
              const newNotification = {
                id: `level-up-${Date.now()}`,
                type: 'level-up' as const,
                title: 'Level Up!',
                message: `Congratulations! You reached level ${newLevel}!`,
                timestamp: new Date(),
                duration: 5000,
              };
              
              // Emit level up event
              get().emitEvent({
                type: 'LEVEL_UP',
                payload: { newLevel, xpGained: amount, source },
                timestamp: new Date()
              });
              
              return {
                player: {
                  ...state.player,
                  totalXp: newTotalXp,
                  xp: currentLevelXp,
                  level: newLevel,
                  xpToNext,
                  lastActive: new Date(),
                },
                ui: {
                  ...state.ui,
                  notifications: [...state.ui.notifications, newNotification],
                },
              };
            }

            // XP gained event
            get().emitEvent({
              type: 'XP_GAINED',
              payload: { amount, source, newTotal: newTotalXp },
              timestamp: new Date()
            });

            return {
              player: {
                ...state.player,
                totalXp: newTotalXp,
                xp: currentLevelXp,
                xpToNext,
                lastActive: new Date(),
              },
            };
          });
        },

        unlockAchievement: (achievementId) => {
          set((state) => {
            const achievement = state.achievements.find(a => a.id === achievementId);
            if (!achievement || achievement.unlocked) return state;

            const unlockedAchievement = {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date(),
              progress: achievement.maxProgress,
            };

            const newNotification = {
              id: `achievement-${Date.now()}`,
              type: 'achievement' as const,
              title: 'Achievement Unlocked!',
              message: `${achievement.name}: ${achievement.description}`,
              timestamp: new Date(),
              duration: 6000,
            };

            // Add XP reward
            get().addXp(achievement.xpReward, `achievement: ${achievement.name}`);
            
            // Emit achievement event
            get().emitEvent({
              type: 'ACHIEVEMENT_UNLOCKED',
              payload: { achievement: unlockedAchievement },
              timestamp: new Date()
            });

            return {
              achievements: state.achievements.map(a => 
                a.id === achievementId ? unlockedAchievement : a
              ),
              ui: {
                ...state.ui,
                notifications: [...state.ui.notifications, newNotification],
              },
            };
          });
        },

        setCurrentLevel: (level) => {
          set({ currentLevel: level });
        },

        updateSwarm: (swarm) => {
          set({ swarm });
        },

        executeCommand: async (command) => {
          // Check for easter eggs first
          get().checkEasterEgg(command);
          
          // Simulate command execution
          const success = Math.random() > 0.1; // 90% success rate
          const xpGained = success ? Math.floor(Math.random() * 20) + 5 : 0;
          
          if (success && xpGained > 0) {
            get().addXp(xpGained, `command: ${command}`);
          }

          const result = {
            command,
            success,
            output: success ? 'Command executed successfully' : 'Command failed',
            xpGained,
            timestamp: new Date(),
          };

          // Add to sandbox history
          set((state) => ({
            sandbox: {
              ...state.sandbox,
              history: [...state.sandbox.history, result],
              output: result.output,
              errors: success ? [] : ['Command execution failed'],
            },
          }));

          // Emit command event
          get().emitEvent({
            type: 'COMMAND_EXECUTED',
            payload: result,
            timestamp: new Date()
          });

          return result;
        },

        nextTutorialStep: () => {
          set((state) => {
            const nextStep = state.tutorial.currentStep + 1;
            if (nextStep >= state.tutorial.totalSteps) {
              return {
                tutorial: {
                  ...state.tutorial,
                  active: false,
                  completed: true,
                  currentStep: nextStep,
                },
              };
            }
            
            return {
              tutorial: {
                ...state.tutorial,
                currentStep: nextStep,
              },
            };
          });
        },

        completeTutorial: () => {
          set((state) => ({
            tutorial: {
              ...state.tutorial,
              active: false,
              completed: true,
            },
          }));
          
          // Unlock tutorial completion achievement
          get().unlockAchievement('tutorial-master');
          get().addXp(100, 'tutorial completion');
        },

        showNotification: (notification) => {
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: [...state.ui.notifications, {
                ...notification,
                id: notification.id || `notification-${Date.now()}`,
                timestamp: notification.timestamp || new Date(),
              }],
            },
          }));
        },

        dismissNotification: (id) => {
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.filter(n => n.id !== id),
            },
          }));
        },

        setActivePanel: (panel) => {
          set((state) => ({
            ui: { ...state.ui, activePanel: panel },
          }));
        },

        updateSettings: (settings) => {
          set((state) => ({
            settings: { ...state.settings, ...settings },
          }));
        },

        emitEvent: (event) => {
          // Event system for achievements and game progression
          console.log('Game Event:', event);
          
          // Check for event-based achievements
          const { achievements } = get();
          achievements.forEach(achievement => {
            if (!achievement.unlocked) {
              // Simple achievement trigger system
              if (event.type === 'COMMAND_EXECUTED' && achievement.id === 'first-command') {
                get().unlockAchievement(achievement.id);
              }
              if (event.type === 'LEVEL_UP' && achievement.id === 'level-5' && event.payload.newLevel >= 5) {
                get().unlockAchievement(achievement.id);
              }
              if (event.type === 'WIKI_MODULE_COMPLETED' && achievement.id === 'wiki-first-module' && event.payload.totalCompleted >= 1) {
                get().unlockAchievement(achievement.id);
              }
              if (event.type === 'WIKI_CHALLENGE_COMPLETED' && achievement.id === 'wiki-challenge-master' && event.payload.totalCompleted >= 25) {
                get().unlockAchievement(achievement.id);
              }
            }
          });
        },

        checkEasterEgg: (input) => {
          if (!get().settings.easterEggsEnabled) return;
          
          easterEggs.forEach(egg => {
            if ((typeof egg.trigger === 'string' ? input.includes(egg.trigger) : egg.trigger.test(input))) {
              const achievement = get().achievements.find(a => a.id === egg.achievement);
              if (achievement && !achievement.unlocked) {
                get().unlockAchievement(egg.achievement);
                get().showNotification({
                  type: 'achievement',
                  title: '🥚 Easter Egg Found!',
                  message: egg.message,
                  duration: 8000,
                });
              }
            }
          });
        },

        // Computed values
        getUnlockedAchievements: () => {
          return get().achievements.filter(a => a.unlocked);
        },

        getProgressToNextLevel: () => {
          const { player } = get();
          const nextLevelXp = calculateXpForLevel(player.level);
          return (player.xp / nextLevelXp) * 100;
        },

        getCurrentLevelData: () => {
          const { currentLevel, levels } = get();
          return levels.find(l => l.id === currentLevel) || levels[0];
        },

        // Wiki Tutorial System Methods
        startWikiModule: (moduleId) => {
          set((state) => ({
            wikiProgress: {
              ...state.wikiProgress,
              moduleProgress: new Map(state.wikiProgress.moduleProgress).set(moduleId, 0)
            }
          }));
          
          get().emitEvent({
            type: 'WIKI_MODULE_STARTED',
            payload: { moduleId },
            timestamp: new Date()
          });
        },

        completeWikiModule: (moduleId, score) => {
          set((state) => {
            const completedModules = [...state.wikiProgress.completedModules];
            if (!completedModules.includes(moduleId)) {
              completedModules.push(moduleId);
            }
            
            const bestScores = new Map(state.wikiProgress.bestScores);
            const currentBest = bestScores.get(moduleId) || 0;
            if (score > currentBest) {
              bestScores.set(moduleId, score);
            }
            
            return {
              wikiProgress: {
                ...state.wikiProgress,
                completedModules,
                moduleProgress: new Map(state.wikiProgress.moduleProgress).set(moduleId, 100),
                bestScores,
                totalXpEarned: state.wikiProgress.totalXpEarned + (score * 10),
                currentStreak: state.wikiProgress.currentStreak + 1
              }
            };
          });
          
          // Award XP for module completion
          get().addXp(score * 10, `wiki module: ${moduleId}`);
          
          // Check for module completion achievements
          const completedCount = get().wikiProgress.completedModules.length;
          if (completedCount === 1) {
            get().unlockAchievement('wiki-first-module');
          } else if (completedCount === 10) {
            get().unlockAchievement('wiki-10-modules');
          } else if (completedCount === 50) {
            get().unlockAchievement('wiki-master');
          }
          
          get().emitEvent({
            type: 'WIKI_MODULE_COMPLETED',
            payload: { moduleId, score, totalCompleted: completedCount },
            timestamp: new Date()
          });
        },

        startWikiChallenge: (challengeId) => {
          set((state) => {
            const challengeAttempts = new Map(state.wikiProgress.challengeAttempts);
            const currentAttempts = challengeAttempts.get(challengeId) || 0;
            challengeAttempts.set(challengeId, currentAttempts + 1);
            
            return {
              wikiProgress: {
                ...state.wikiProgress,
                challengeAttempts
              }
            };
          });
          
          get().emitEvent({
            type: 'WIKI_CHALLENGE_STARTED',
            payload: { challengeId },
            timestamp: new Date()
          });
        },

        completeWikiChallenge: (challengeId, score, timeSpent) => {
          set((state) => {
            const completedChallenges = [...state.wikiProgress.completedChallenges];
            if (!completedChallenges.includes(challengeId)) {
              completedChallenges.push(challengeId);
            }
            
            const bestScores = new Map(state.wikiProgress.bestScores);
            const currentBest = bestScores.get(challengeId) || 0;
            if (score > currentBest) {
              bestScores.set(challengeId, score);
            }
            
            const timeSpentMap = new Map(state.wikiProgress.timeSpent);
            const totalTime = (timeSpentMap.get(challengeId) || 0) + timeSpent;
            timeSpentMap.set(challengeId, totalTime);
            
            return {
              wikiProgress: {
                ...state.wikiProgress,
                completedChallenges,
                bestScores,
                timeSpent: timeSpentMap,
                totalXpEarned: state.wikiProgress.totalXpEarned + (score * 5),
                currentStreak: state.wikiProgress.currentStreak + 1
              }
            };
          });
          
          // Award XP for challenge completion
          get().addXp(score * 5, `wiki challenge: ${challengeId}`);
          
          // Check for challenge completion achievements
          const completedCount = get().wikiProgress.completedChallenges.length;
          if (completedCount === 1) {
            get().unlockAchievement('wiki-first-challenge');
          } else if (completedCount === 25) {
            get().unlockAchievement('wiki-challenge-master');
          }
          
          // Check for perfect scores
          if (score >= 100) {
            get().unlockAchievement('wiki-perfectionist');
          }
          
          get().emitEvent({
            type: 'WIKI_CHALLENGE_COMPLETED',
            payload: { challengeId, score, timeSpent, totalCompleted: completedCount },
            timestamp: new Date()
          });
        },

        updateWikiProgress: (moduleId, progress) => {
          set((state) => ({
            wikiProgress: {
              ...state.wikiProgress,
              moduleProgress: new Map(state.wikiProgress.moduleProgress).set(moduleId, progress)
            }
          }));
        },

        getWikiModuleProgress: (moduleId) => {
          const { wikiProgress } = get();
          return wikiProgress.moduleProgress.get(moduleId) || 0;
        },

        getCompletedWikiModules: () => {
          const { wikiProgress } = get();
          return [...wikiProgress.completedModules];
        },

        getCompletedWikiChallenges: () => {
          const { wikiProgress } = get();
          return [...wikiProgress.completedChallenges];
        },
      }),
      {
        name: 'claude-flow-game-store',
        version: 1,
      }
    )
  )
);

// Auto-dismiss notifications
useGameStore.subscribe(
  (state) => state.ui.notifications,
  (notifications) => {
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        setTimeout(() => {
          useGameStore.getState().dismissNotification(notification.id);
        }, notification.duration);
      }
    });
  }
);