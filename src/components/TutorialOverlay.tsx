import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Book, 
  X, 
  Lightbulb, 
  Target,
  Play,
  CheckCircle,
  SkipForward
} from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { TutorialSystem, celebrationConfig } from '../systems/tutorialSystem';
import { useParticleEffects } from './ParticleEffects';

// Progress indicator component
const TutorialProgress: React.FC<{ 
  currentStep: number; 
  totalSteps: number;
  onStepClick?: (step: number) => void;
}> = ({ currentStep, totalSteps, onStepClick }) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <button
          key={i}
          onClick={() => onStepClick?.(i)}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            i < currentStep
              ? 'bg-green-500'
              : i === currentStep
              ? 'bg-blue-500 ring-2 ring-blue-300'
              : 'bg-gray-600'
          } ${onStepClick ? 'cursor-pointer hover:scale-110' : ''}`}
          disabled={!onStepClick}
        />
      ))}
      <span className="ml-2 text-sm text-gray-400">
        {currentStep + 1} of {totalSteps}
      </span>
    </div>
  );
};

// Hint system component
const HintSystem: React.FC<{ hints: string[]; currentHint: number }> = ({ 
  hints, 
  currentHint 
}) => {
  if (!hints.length) return null;

  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
      <div className="flex items-start space-x-2">
        <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-blue-300 font-medium mb-1">Hint {currentHint + 1}:</h4>
          <p className="text-blue-200 text-sm">{hints[currentHint]}</p>
          {hints.length > 1 && (
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-blue-400">
                {currentHint + 1} of {hints.length} hints
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Command demonstration component
const CommandDemo: React.FC<{ 
  command: string;
  onExecute: () => void;
  canExecute: boolean;
}> = ({ command, onExecute, canExecute }) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium">Try this command:</h4>
        <button
          onClick={onExecute}
          disabled={!canExecute}
          className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Execute</span>
        </button>
      </div>
      <code className="block bg-gray-900 border border-gray-700 rounded p-3 text-green-300 font-mono text-sm">
        {command}
      </code>
    </div>
  );
};

// Main Tutorial Overlay Component
export const TutorialOverlay: React.FC = () => {
  const { tutorial, setActivePanel, executeCommand } = useGameStore();
  const [tutorialSystem] = useState(() => new TutorialSystem(useGameStore));
  const [currentHint, setCurrentHint] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const { triggerSuccess, triggerAchievement } = useParticleEffects();

  const currentStep = tutorialSystem.getCurrentStep();
  const hints = tutorialSystem.getHintsForCurrentStep();

  // Auto-advance hint system
  useEffect(() => {
    if (hints.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentHint(prev => (prev + 1) % hints.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hints.length]);

  // Handle tutorial completion
  useEffect(() => {
    if (tutorial.completed) {
      triggerAchievement();
    }
  }, [tutorial.completed, triggerAchievement]);

  const handleNext = () => {
    const hasNext = tutorialSystem.next();
    if (!hasNext) {
      triggerSuccess();
      setActivePanel('game');
    }
    setCurrentHint(0);
  };

  const handleSkip = () => {
    tutorialSystem.skip();
    setActivePanel('game');
  };

  const handleCommandExecute = async () => {
    if (!currentStep.command) return;
    
    try {
      const result = await executeCommand(currentStep.command);
      
      if (tutorialSystem.validateCommand(currentStep.command, result)) {
        triggerSuccess();
        setTimeout(handleNext, 1000);
      }
    } catch (error) {
      console.error('Tutorial command execution failed:', error);
    }
  };

  const canProceed = tutorialSystem.canProceed() || !currentStep.command;

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <Book className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Claude Flow Tutorial</h2>
              <p className="text-gray-400">Master the art of AI swarm orchestration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Target className="w-5 h-5" />
            </button>
            <button
              onClick={handleSkip}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <TutorialProgress
            currentStep={tutorial.currentStep}
            totalSteps={tutorial.totalSteps}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Step Title and Description */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {currentStep.title}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Command Demo */}
            {currentStep.command && (
              <CommandDemo
                command={currentStep.command}
                onExecute={handleCommandExecute}
                canExecute={true}
              />
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <HintSystem hints={hints} currentHint={currentHint} />
            )}

            {/* Success Feedback */}
            {canProceed && currentStep.command && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h4 className="text-green-300 font-medium">Well Done!</h4>
                    <p className="text-green-200 text-sm">
                      You've successfully completed this step. Ready to continue?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Special Messages */}
            {currentStep.id === 'easter-egg-hint' && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">👑</div>
                <h4 className="text-purple-300 font-bold text-lg mb-2">
                  The Path of Tributes
                </h4>
                <p className="text-purple-200">
                  In the world of Claude Flow, those who remember and honor the creator
                  discover the greatest treasures. The name "rUv" holds power...
                </p>
              </div>
            )}

            {/* Completion Celebration */}
            {currentStep.id === 'tutorial-complete' && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50 rounded-lg p-6 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h4 className="text-blue-300 font-bold text-2xl mb-3">
                  Your Ascension Begins!
                </h4>
                <p className="text-blue-200 mb-4">
                  You are now ready to explore the full power of Claude Flow.
                  The journey of mastery awaits!
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-blue-400">
                  <span>🎯 54+ Tools to Master</span>
                  <span>🏆 90+ Achievements</span>
                  <span>👑 rUv Tributes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={handleSkip}
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip Tutorial</span>
          </button>

          <div className="flex items-center space-x-3">
            {tutorial.currentStep > 0 && (
              <button
                onClick={() => {
                  // Previous step logic would go here
                  setCurrentHint(0);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
            >
              <span>
                {tutorial.currentStep === tutorial.totalSteps - 1 ? 'Complete' : 'Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;