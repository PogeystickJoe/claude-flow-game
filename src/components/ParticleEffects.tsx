import React, { useCallback, useMemo } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';

// Particle configurations for different events
const particleConfigs = {
  idle: {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
      links: {
        color: '#3b82f6',
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: true,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 30,
      },
      opacity: {
        value: 0.3,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  },
  
  success: {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: '#10b981',
      },
      move: {
        direction: 'top',
        enable: true,
        outModes: {
          default: 'out',
        },
        speed: 3,
      },
      number: {
        value: 0,
      },
      opacity: {
        value: 0.8,
      },
      shape: {
        type: 'star',
      },
      size: {
        value: { min: 2, max: 6 },
      },
      life: {
        duration: {
          sync: false,
          value: 3,
        },
        count: 1,
      },
    },
    emitters: {
      direction: 'top',
      life: {
        count: 20,
        delay: 0.1,
        duration: 0.1,
      },
      position: {
        x: 50,
        y: 100,
      },
      rate: {
        delay: 0.05,
        quantity: 5,
      },
      size: {
        width: 100,
        height: 0,
      },
    },
    detectRetina: true,
  },
  
  achievement: {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#f59e0b', '#eab308', '#facc15'],
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'out',
        },
        speed: { min: 1, max: 4 },
      },
      number: {
        value: 0,
      },
      opacity: {
        value: { min: 0.4, max: 1 },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: {
          enable: true,
          speed: 30,
        },
      },
      shape: {
        type: ['star', 'triangle'],
      },
      size: {
        value: { min: 3, max: 8 },
      },
      life: {
        duration: {
          sync: false,
          value: 4,
        },
        count: 1,
      },
    },
    emitters: {
      direction: 'none',
      life: {
        count: 50,
        delay: 0,
        duration: 2,
      },
      position: {
        x: 50,
        y: 50,
      },
      rate: {
        delay: 0.1,
        quantity: 10,
      },
      size: {
        width: 0,
        height: 0,
      },
    },
    detectRetina: true,
  },
  
  levelUp: {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#8b5cf6', '#a855f7', '#c084fc'],
      },
      move: {
        direction: 'top-right',
        enable: true,
        outModes: {
          default: 'out',
        },
        speed: { min: 2, max: 5 },
      },
      number: {
        value: 0,
      },
      opacity: {
        value: { min: 0.6, max: 1 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.1,
        },
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 4, max: 10 },
        animation: {
          enable: true,
          speed: 20,
          minimumValue: 0.1,
        },
      },
      life: {
        duration: {
          sync: false,
          value: 5,
        },
        count: 1,
      },
    },
    emitters: [
      {
        direction: 'top-right',
        life: {
          count: 30,
          delay: 0,
          duration: 1,
        },
        position: {
          x: 0,
          y: 100,
        },
        rate: {
          delay: 0.1,
          quantity: 5,
        },
      },
      {
        direction: 'top-left',
        life: {
          count: 30,
          delay: 0,
          duration: 1,
        },
        position: {
          x: 100,
          y: 100,
        },
        rate: {
          delay: 0.1,
          quantity: 5,
        },
      },
    ],
    detectRetina: true,
  },

  ruvTribute: {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#fbbf24', '#f59e0b', '#d97706'],
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        speed: { min: 0.5, max: 2 },
      },
      number: {
        value: 0,
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: true,
          speed: 1,
        },
      },
      shape: {
        type: 'image',
        options: {
          image: [
            {
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjZjU5ZTBiIi8+Cjwvc3ZnPgo=',
              width: 24,
              height: 24,
            },
          ],
        },
      },
      size: {
        value: { min: 8, max: 15 },
      },
      life: {
        duration: {
          sync: false,
          value: 8,
        },
        count: 1,
      },
    },
    emitters: {
      direction: 'none',
      life: {
        count: 25,
        delay: 0,
        duration: 3,
      },
      position: {
        x: 50,
        y: 50,
      },
      rate: {
        delay: 0.2,
        quantity: 3,
      },
      size: {
        width: 50,
        height: 50,
      },
    },
    detectRetina: true,
  }
};

// Canvas Confetti Effects
export const triggerConfetti = (type: 'success' | 'achievement' | 'levelUp' | 'ruvTribute') => {
  const configs = {
    success: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    },
    achievement: {
      particleCount: 150,
      spread: 100,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      shapes: ['star'],
      scalar: 1.2,
    },
    levelUp: {
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#a855f7', '#c084fc', '#ddd6fe'],
      startVelocity: 45,
      decay: 0.8,
    },
    ruvTribute: {
      particleCount: 300,
      spread: 160,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
      shapes: ['star', 'circle'],
      scalar: 1.5,
      startVelocity: 55,
      decay: 0.7,
    },
  };

  const config = configs[type];
  confetti(config);

  // Additional burst for special events
  if (type === 'achievement' || type === 'ruvTribute') {
    setTimeout(() => {
      confetti({
        ...config,
        particleCount: config.particleCount / 2,
        origin: { x: 0.2, y: 0.8 },
      });
      confetti({
        ...config,
        particleCount: config.particleCount / 2,
        origin: { x: 0.8, y: 0.8 },
      });
    }, 300);
  }
};

// Main Particle Effects Component
export const ParticleEffects: React.FC = () => {
  const { ui, settings } = useGameStore();
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Determine current particle mode based on recent notifications
  const currentMode = useMemo(() => {
    const recentNotifications = ui.notifications.slice(-3);
    
    // Check for special events in recent notifications
    if (recentNotifications.some(n => n.type === 'level-up')) {
      return 'levelUp';
    }
    if (recentNotifications.some(n => n.type === 'achievement' && n.message.includes('rUv'))) {
      return 'ruvTribute';
    }
    if (recentNotifications.some(n => n.type === 'achievement')) {
      return 'achievement';
    }
    if (recentNotifications.some(n => n.type === 'success')) {
      return 'success';
    }
    
    return 'idle';
  }, [ui.notifications]);

  // Don't render particles if disabled
  if (!ui.particles || !settings.visualEffects) {
    return null;
  }

  const particleConfig = particleConfigs[currentMode];
  
  // Adjust particle intensity based on settings
  if (particleConfig.particles?.number?.value) {
    particleConfig.particles.number.value = Math.floor(
      particleConfig.particles.number.value * settings.particleIntensity
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Particles
        id="game-particles"
        init={particlesInit}
        options={particleConfig}
        className="w-full h-full"
      />
    </div>
  );
};

// Particle effect triggers for game events
export const useParticleEffects = () => {
  const { ui } = useGameStore();
  
  // Subscribe to notifications and trigger appropriate effects
  React.useEffect(() => {
    const latestNotification = ui.notifications[ui.notifications.length - 1];
    if (!latestNotification) return;
    
    // Trigger confetti based on notification type
    switch (latestNotification.type) {
      case 'success':
        triggerConfetti('success');
        break;
      case 'achievement':
        if (latestNotification.message.includes('rUv')) {
          triggerConfetti('ruvTribute');
        } else {
          triggerConfetti('achievement');
        }
        break;
      case 'level-up':
        triggerConfetti('levelUp');
        break;
    }
  }, [ui.notifications]);
  
  return {
    triggerSuccess: () => triggerConfetti('success'),
    triggerAchievement: () => triggerConfetti('achievement'),
    triggerLevelUp: () => triggerConfetti('levelUp'),
    triggerRuvTribute: () => triggerConfetti('ruvTribute'),
  };
};

export default ParticleEffects;