import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { GameState, Player, Achievement, Level, SwarmState, GameEvent } from '../types/game';
import { achievementsData } from '../systems/achievementSystem';
import { levelsData } from '../systems/levelSystem';
import { tutorialSteps } from '../systems/tutorialSystem';

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
  setActivePanel: (panel: string) => void;
  updateSettings: (settings: Partial<any>) => void;
  emitEvent: (event: GameEvent) => void;
  
  // Easter Egg System
  checkEasterEgg: (input: string) => void;
  
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