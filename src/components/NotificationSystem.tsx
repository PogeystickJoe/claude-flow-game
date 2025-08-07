import React, { useEffect } from 'react';
import { X, Trophy, Star, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { Notification } from '../types/game';

// Individual notification component
interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const { type, title, message, duration } = notification;

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.id, duration, onDismiss]);

  // Get notification styling based on type
  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-900/90 border-green-500',
          icon: CheckCircle,
          iconColor: 'text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-red-900/90 border-red-500',
          icon: AlertCircle,
          iconColor: 'text-red-400',
        };
      case 'achievement':
        return {
          bg: 'bg-yellow-900/90 border-yellow-500',
          icon: Trophy,
          iconColor: 'text-yellow-400',
        };
      case 'level-up':
        return {
          bg: 'bg-purple-900/90 border-purple-500',
          icon: Star,
          iconColor: 'text-purple-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-900/90 border-blue-500',
          icon: Info,
          iconColor: 'text-blue-400',
        };
    }
  };

  const style = getNotificationStyle();
  const IconComponent = style.icon;

  return (
    <div
      className={`${style.bg} border-l-4 rounded-lg shadow-lg backdrop-blur-sm p-4 min-w-80 max-w-md transform transition-all duration-300 ease-out hover:scale-105`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-sm truncate pr-2">
              {title}
            </h4>
            <button
              onClick={() => onDismiss(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-300 text-sm mt-1 leading-relaxed">
            {message}
          </p>

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    onDismiss(notification.id);
                  }}
                  className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white font-medium transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {duration > 0 && (
        <div className="mt-3 w-full bg-black/20 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full ${
              type === 'achievement' ? 'bg-yellow-400' :
              type === 'level-up' ? 'bg-purple-400' :
              type === 'success' ? 'bg-green-400' :
              type === 'error' ? 'bg-red-400' :
              'bg-blue-400'
            } transition-all ease-linear`}
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Special achievement notification with enhanced visuals
const AchievementNotification: React.FC<{ 
  notification: Notification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const isRuvTribute = notification.message.includes('rUv') || notification.message.includes('tribute');
  
  return (
    <div
      className={`${
        isRuvTribute 
          ? 'bg-gradient-to-r from-orange-900/90 to-red-900/90 border-orange-500' 
          : 'bg-gradient-to-r from-yellow-900/90 to-yellow-800/90 border-yellow-500'
      } border-l-4 rounded-lg shadow-2xl backdrop-blur-sm p-6 min-w-96 max-w-lg transform transition-all duration-500 ease-out hover:scale-105 relative overflow-hidden`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      
      <div className="relative z-10">
        <div className="flex items-start space-x-4">
          {/* Enhanced Icon */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isRuvTribute ? 'bg-orange-500/20' : 'bg-yellow-500/20'
            }`}>
              {isRuvTribute ? (
                <div className="text-2xl">👑</div>
              ) : (
                <Trophy className={`w-8 h-8 ${isRuvTribute ? 'text-orange-400' : 'text-yellow-400'}`} />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-white text-lg">
                  {isRuvTribute ? '🎉 rUv Tribute Unlocked!' : '🏆 Achievement Unlocked!'}
                </h4>
                {isRuvTribute && <div className="text-orange-400">👑</div>}
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h5 className={`font-semibold text-xl mt-2 ${
              isRuvTribute ? 'text-orange-300' : 'text-yellow-300'
            }`}>
              {notification.title.replace('Achievement Unlocked!', '')}
            </h5>
            
            <p className="text-gray-200 mt-2 leading-relaxed">
              {notification.message}
            </p>

            {/* Enhanced visual elements */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-1 text-sm ${
                  isRuvTribute ? 'text-orange-300' : 'text-yellow-300'
                }`}>
                  <Zap className="w-4 h-4" />
                  <span>Special Achievement</span>
                </div>
                {isRuvTribute && (
                  <div className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                    LEGENDARY
                  </div>
                )}
              </div>
              <div className="text-right text-sm text-gray-300">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main notification system component
export const NotificationSystem: React.FC = () => {
  const { ui, dismissNotification } = useGameStore();

  return (
    <>
      {/* CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {ui.notifications.map((notification) => (
          <div
            key={notification.id}
            className="animate-in slide-in-from-right duration-300"
          >
            {notification.type === 'achievement' ? (
              <AchievementNotification 
                notification={notification}
                onDismiss={dismissNotification}
              />
            ) : (
              <NotificationItem
                notification={notification}
                onDismiss={dismissNotification}
              />
            )}
          </div>
        ))}
      </div>

      {/* Global notification styles */}
      <style jsx global>{`
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-right {
          animation-name: slideInFromRight;
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .slide-out-to-right {
          animation-name: slideOutToRight;
          animation-duration: 200ms;
        }
        
        @keyframes slideOutToRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
};

// Hook for triggering notifications from other components
export const useNotifications = () => {
  const { showNotification } = useGameStore();

  return {
    showSuccess: (title: string, message: string, duration = 4000) => {
      showNotification({
        type: 'success',
        title,
        message,
        duration,
        timestamp: new Date(),
      });
    },
    
    showError: (title: string, message: string, duration = 6000) => {
      showNotification({
        type: 'error',
        title,
        message,
        duration,
        timestamp: new Date(),
      });
    },
    
    showInfo: (title: string, message: string, duration = 5000) => {
      showNotification({
        type: 'info',
        title,
        message,
        duration,
        timestamp: new Date(),
      });
    },
    
    showAchievement: (title: string, message: string, duration = 8000) => {
      showNotification({
        type: 'achievement',
        title,
        message,
        duration,
        timestamp: new Date(),
      });
    },
    
    showLevelUp: (level: number, duration = 6000) => {
      showNotification({
        type: 'level-up',
        title: 'Level Up!',
        message: `Congratulations! You reached level ${level}!`,
        duration,
        timestamp: new Date(),
      });
    },
  };
};

export default NotificationSystem;