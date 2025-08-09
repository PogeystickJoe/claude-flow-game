import React, { useState, useEffect } from 'react';
import { autoUpdater, UpdateDialogue as DialogueType } from '../systems/autoUpdateClient';
import '../styles/UpdateDialogue.css';

export const UpdateDialogue: React.FC = () => {
  const [dialogue, setDialogue] = useState<DialogueType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [discoveredFeatures, setDiscoveredFeatures] = useState<string[]>([]);

  useEffect(() => {
    // Listen for update dialogues
    const handleDialogue = (newDialogue: DialogueType) => {
      setDialogue(newDialogue);
      setIsVisible(true);
      
      // Auto-hide when ready (unless error)
      if (newDialogue.phase === 'ready') {
        setTimeout(() => setIsVisible(false), 5000);
      }
    };

    const handleFeatures = (features: string[]) => {
      setDiscoveredFeatures(features);
    };

    autoUpdater.on('dialogue', handleDialogue);
    autoUpdater.on('featuresDiscovered', handleFeatures);

    // Initialize auto-updater
    autoUpdater.initialize();

    return () => {
      autoUpdater.off('dialogue', handleDialogue);
      autoUpdater.off('featuresDiscovered', handleFeatures);
    };
  }, []);

  if (!isVisible || !dialogue) return null;

  const getPhaseIcon = () => {
    switch (dialogue.phase) {
      case 'checking': return '🔍';
      case 'updating': return '⚡';
      case 'learning': return '🧠';
      case 'ready': return '✨';
      case 'error': return '⚠️';
      default: return '🚀';
    }
  };

  const getPhaseColor = () => {
    switch (dialogue.phase) {
      case 'checking': return '#3b82f6';
      case 'updating': return '#8b5cf6';
      case 'learning': return '#10b981';
      case 'ready': return '#22c55e';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="update-dialogue-overlay">
      <div className="update-dialogue-container">
        <div className="update-dialogue-header">
          <span className="update-dialogue-icon">{getPhaseIcon()}</span>
          <h2>Claude Flow Neural Update</h2>
        </div>
        
        <div className="update-dialogue-content">
          <p className="update-dialogue-message">{dialogue.message}</p>
          
          {dialogue.details && (
            <p className="update-dialogue-details">{dialogue.details}</p>
          )}
          
          <div className="update-dialogue-progress">
            <div 
              className="update-dialogue-progress-bar"
              style={{
                width: `${dialogue.progress}%`,
                backgroundColor: getPhaseColor()
              }}
            />
          </div>
          
          {dialogue.phase === 'learning' && (
            <div className="update-dialogue-learning">
              <div className="neural-animation">
                <div className="neuron"></div>
                <div className="neuron"></div>
                <div className="neuron"></div>
                <div className="synapse"></div>
                <div className="synapse"></div>
              </div>
              <p>Evolving game mechanics...</p>
            </div>
          )}
          
          {dialogue.phase === 'ready' && discoveredFeatures.length > 0 && (
            <div className="update-dialogue-features">
              <h3>🎯 New Abilities Unlocked:</h3>
              <div className="feature-grid">
                {discoveredFeatures.slice(0, 6).map((feature, index) => (
                  <div key={index} className="feature-badge">
                    <span className="feature-icon">⚡</span>
                    <span className="feature-name">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {dialogue.phase === 'error' && (
          <button 
            className="update-dialogue-retry"
            onClick={() => autoUpdater.forceCheck()}
          >
            Retry Update
          </button>
        )}
      </div>
    </div>
  );
};