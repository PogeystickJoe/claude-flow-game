/**
 * Claude Flow Auto-Update Client
 * Communicates with the server-side update system
 */

// Browser-compatible EventEmitter implementation
class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, listener: Function): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
    return this;
  }

  off(event: string, listener: Function): this {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) {
      return false;
    }
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    return true;
  }

  once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}

export interface VersionInfo {
  current: string;
  latest: string;
  hasUpdate: boolean;
  newFeatures?: string[];
  lastCheck?: string;
  error?: string;
}

export interface UpdateDialogue {
  phase: 'checking' | 'updating' | 'learning' | 'ready' | 'error';
  message: string;
  progress: number;
  details?: string;
}

export class ClaudeFlowAutoUpdateClient extends EventEmitter {
  private updateServerUrl = 'http://localhost:3456';
  private statusCheckInterval: number | null = null;
  private lastStatus: VersionInfo | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize the auto-update client
   */
  async initialize(): Promise<void> {
    console.log('🚀 Claude Flow Auto-Update Client Initialized');
    
    // Check status immediately
    await this.checkStatus();
    
    // Then check periodically
    this.statusCheckInterval = window.setInterval(() => {
      this.checkStatus();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check update status from server
   */
  async checkStatus(): Promise<VersionInfo> {
    try {
      // Emit checking phase
      this.emitDialogue({
        phase: 'checking',
        message: '🔍 Checking Claude Flow version with server...',
        progress: 20,
        details: 'Connecting to update server...'
      });

      // Fetch status from server
      const response = await fetch(`${this.updateServerUrl}/api/update-status`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const status = await response.json();
      
      // Check if update happened
      if (this.lastStatus && status.currentVersion !== this.lastStatus.current) {
        // Version changed!
        this.emitDialogue({
          phase: 'learning',
          message: `🧠 New version detected: ${status.currentVersion}!`,
          progress: 70,
          details: 'Learning new capabilities...'
        });

        // Fetch new features
        if (status.newFeatures && status.newFeatures.length > 0) {
          this.emit('featuresDiscovered', status.newFeatures);
        }
      }

      // Emit ready phase
      this.emitDialogue({
        phase: 'ready',
        message: `✨ Claude Flow ${status.currentVersion} active!`,
        progress: 100,
        details: status.newFeatures ? `${status.newFeatures.length} features available` : 'All systems ready'
      });

      this.lastStatus = {
        current: status.currentVersion,
        latest: status.latestVersion,
        hasUpdate: status.currentVersion !== status.latestVersion,
        newFeatures: status.newFeatures,
        lastCheck: status.lastCheck
      };

      return this.lastStatus;
    } catch (error) {
      console.warn('Update server not available, reading local status...');
      
      // Try to read from local file
      try {
        const localStatus = await this.readLocalStatus();
        if (localStatus) {
          this.lastStatus = localStatus;
          
          this.emitDialogue({
            phase: 'ready',
            message: `✅ Claude Flow ${localStatus.current} (cached)`,
            progress: 100,
            details: 'Using cached version info'
          });
          
          return localStatus;
        }
      } catch (e) {
        // Fall back to defaults
      }

      // Fallback
      this.emitDialogue({
        phase: 'error',
        message: '⚠️ Update server unavailable',
        progress: 0,
        details: 'Running with cached version'
      });

      return {
        current: 'unknown',
        latest: 'unknown',
        hasUpdate: false
      };
    }
  }

  /**
   * Read local status file
   */
  async readLocalStatus(): Promise<VersionInfo | null> {
    try {
      const response = await fetch('/.claude-flow/update-status.json');
      if (response.ok) {
        const data = await response.json();
        return {
          current: data.currentVersion,
          latest: data.latestVersion,
          hasUpdate: data.currentVersion !== data.latestVersion,
          newFeatures: data.newFeatures,
          lastCheck: data.lastCheck
        };
      }
    } catch (error) {
      console.debug('No local status file available');
    }
    return null;
  }

  /**
   * Force an update check on the server
   */
  async forceUpdate(): Promise<VersionInfo> {
    try {
      const response = await fetch(`${this.updateServerUrl}/api/check-update`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const status = await response.json();
      
      this.lastStatus = {
        current: status.currentVersion,
        latest: status.latestVersion,
        hasUpdate: status.currentVersion !== status.latestVersion,
        newFeatures: status.newFeatures,
        lastCheck: status.lastCheck
      };

      return this.lastStatus;
    } catch (error) {
      console.error('Failed to force update:', error);
      throw error;
    }
  }

  /**
   * Get discovered features from server
   */
  async getFeatures(): Promise<string[]> {
    try {
      const response = await fetch(`${this.updateServerUrl}/api/features`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Could not fetch features:', error);
      return [];
    }
  }

  /**
   * Emit dialogue events for UI
   */
  private emitDialogue(dialogue: UpdateDialogue): void {
    this.emit('dialogue', dialogue);
    
    // Also log to console with style
    const icons = {
      checking: '🔍',
      updating: '⚡',
      learning: '🧠',
      ready: '✨',
      error: '⚠️'
    };
    
    console.log(`${icons[dialogue.phase]} ${dialogue.message}`);
    if (dialogue.details) {
      console.log(`   └─ ${dialogue.details}`);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }
}

// Singleton instance
export const autoUpdater = new ClaudeFlowAutoUpdateClient();

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      autoUpdater.initialize().catch(console.error);
    });
  } else {
    // DOM already loaded
    autoUpdater.initialize().catch(console.error);
  }
}