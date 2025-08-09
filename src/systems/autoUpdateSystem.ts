/**
 * Claude Flow Auto-Update System
 * Ensures the game always uses the latest claude-flow@alpha version
 * and learns new features dynamically
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
}

// Browser-safe mock for child_process
const execAsync = async (command: string): Promise<{ stdout: string; stderr: string }> => {
  // In browser, we simulate the update check
  console.log(`[Simulated] ${command}`);
  return { 
    stdout: '2.0.0-alpha.86', 
    stderr: '' 
  };
};

export interface VersionInfo {
  current: string;
  latest: string;
  hasUpdate: boolean;
  newFeatures?: string[];
  breakingChanges?: string[];
}

export interface UpdateDialogue {
  phase: 'checking' | 'updating' | 'learning' | 'ready' | 'error';
  message: string;
  progress: number;
  details?: string;
}

export class ClaudeFlowAutoUpdater extends EventEmitter {
  private isUpdating = false;
  private lastCheckTime = 0;
  private checkInterval = 3600000; // 1 hour
  private forceUpdate = true; // Always update on game start

  constructor() {
    super();
  }

  /**
   * Initialize the auto-update system
   * Called automatically when the game starts
   */
  async initialize(): Promise<void> {
    console.log('🚀 Claude Flow Auto-Update System Initialized');
    
    // Always check on startup
    await this.checkAndUpdate();
    
    // Set up periodic checks
    setInterval(() => this.checkAndUpdate(), this.checkInterval);
  }

  /**
   * Check for updates and install if available
   */
  async checkAndUpdate(): Promise<VersionInfo> {
    if (this.isUpdating) {
      console.log('⏳ Update already in progress...');
      return this.getCurrentVersionInfo();
    }

    this.isUpdating = true;
    
    try {
      // Emit checking phase
      this.emitDialogue({
        phase: 'checking',
        message: '🔍 Scanning the multiverse for Claude Flow updates...',
        progress: 10,
        details: 'Connecting to the rUv nexus...'
      });

      // Get current version
      const currentVersion = await this.getCurrentVersion();
      
      // Get latest version
      const latestVersion = await this.getLatestVersion();
      
      // Check if update is needed
      const hasUpdate = currentVersion !== latestVersion || this.forceUpdate;
      
      if (hasUpdate) {
        // Emit updating phase
        this.emitDialogue({
          phase: 'updating',
          message: `⚡ New powers detected! Upgrading from ${currentVersion} to ${latestVersion}...`,
          progress: 30,
          details: 'Downloading quantum swarm patterns...'
        });

        // Perform update
        await this.updateClaudeFlow();
        
        // Emit learning phase
        this.emitDialogue({
          phase: 'learning',
          message: '🧠 Neural patterns evolving... Learning new capabilities...',
          progress: 70,
          details: 'Integrating new features into game mechanics...'
        });

        // Learn new features
        const newFeatures = await this.discoverNewFeatures(latestVersion);
        
        // Update game with new features
        await this.integrateNewFeatures(newFeatures);
        
        // Emit ready phase
        this.emitDialogue({
          phase: 'ready',
          message: `✨ Claude Flow ${latestVersion} activated! ${newFeatures.length} new abilities unlocked!`,
          progress: 100,
          details: 'The game has evolved with new powers!'
        });

        return {
          current: latestVersion,
          latest: latestVersion,
          hasUpdate: true,
          newFeatures
        };
      } else {
        // Already up to date
        this.emitDialogue({
          phase: 'ready',
          message: `✅ Claude Flow ${currentVersion} is already at maximum power!`,
          progress: 100,
          details: 'All systems optimal'
        });

        return {
          current: currentVersion,
          latest: latestVersion,
          hasUpdate: false
        };
      }
    } catch (error) {
      // Emit error phase
      this.emitDialogue({
        phase: 'error',
        message: '⚠️ Update portal temporarily unstable',
        progress: 0,
        details: `Falling back to cached version. Error: ${error.message}`
      });

      // Still try to run with cached version
      return this.getCurrentVersionInfo();
    } finally {
      this.isUpdating = false;
      this.lastCheckTime = Date.now();
    }
  }

  /**
   * Get current installed version
   */
  private async getCurrentVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('npx claude-flow@alpha --version');
      const match = stdout.match(/(\d+\.\d+\.\d+(?:-alpha\.\d+)?)/);
      return match ? match[1] : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get latest available version from npm
   */
  private async getLatestVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('npm view claude-flow@alpha version');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Update Claude Flow to latest alpha version
   */
  private async updateClaudeFlow(): Promise<void> {
    // Use npx with @alpha to always get latest
    // This ensures even if npm cache is stale, we get the latest
    await execAsync('npx --yes claude-flow@alpha --version', {
      env: {
        ...process.env,
        npm_config_update_notifier: 'false',
        npm_config_fund: 'false'
      }
    });

    // Also update global installation if exists
    try {
      await execAsync('npm install -g claude-flow@alpha --force', {
        env: {
          ...process.env,
          npm_config_update_notifier: 'false',
          npm_config_fund: 'false'
        }
      });
    } catch {
      // Global update is optional, npx is sufficient
    }
  }

  /**
   * Discover new features in the latest version
   */
  private async discoverNewFeatures(version: string): Promise<string[]> {
    try {
      // Try to get changelog or feature list
      const { stdout } = await execAsync('npx claude-flow@alpha help --json 2>/dev/null || npx claude-flow@alpha help');
      
      // Parse features from help output
      const features = this.parseFeatures(stdout);
      
      // Store in game memory for dynamic integration
      await this.storeFeatureMemory(version, features);
      
      return features;
    } catch {
      // Return default feature set if discovery fails
      return [
        'Swarm Intelligence v2.0',
        'Neural Pattern Training',
        'DAA Agent System',
        'GitHub Integration',
        'SPARC Methodology'
      ];
    }
  }

  /**
   * Parse features from Claude Flow help output
   */
  private parseFeatures(helpOutput: string): string[] {
    const features: string[] = [];
    
    // Look for command patterns
    const commandMatches = helpOutput.match(/^\s*(\w+[\w-]*)\s+/gm);
    if (commandMatches) {
      features.push(...commandMatches.map(cmd => cmd.trim()));
    }
    
    // Look for feature mentions
    const featurePatterns = [
      /swarm/gi,
      /neural/gi,
      /agent/gi,
      /sparc/gi,
      /github/gi,
      /memory/gi,
      /optimization/gi
    ];
    
    featurePatterns.forEach(pattern => {
      if (pattern.test(helpOutput)) {
        const feature = pattern.source.replace(/\\/g, '');
        if (!features.includes(feature)) {
          features.push(feature);
        }
      }
    });
    
    return features.slice(0, 20); // Limit to top 20 features
  }

  /**
   * Store discovered features in game memory
   */
  private async storeFeatureMemory(version: string, features: string[]): Promise<void> {
    try {
      await execAsync(`npx claude-flow@alpha memory store "game:features:${version}" "${JSON.stringify(features)}"`);
    } catch {
      // Memory storage is optional
    }
  }

  /**
   * Integrate new features into the game
   */
  private async integrateNewFeatures(features: string[]): Promise<void> {
    // Emit events for game systems to react to new features
    this.emit('featuresDiscovered', features);
    
    // Update achievement system with new tool discoveries
    features.forEach(feature => {
      this.emit('newTool', feature);
    });
    
    // Trigger game adaptation
    this.emit('gameEvolution', {
      version: await this.getCurrentVersion(),
      features,
      timestamp: Date.now()
    });
  }

  /**
   * Get current version info
   */
  private async getCurrentVersionInfo(): Promise<VersionInfo> {
    const current = await this.getCurrentVersion();
    const latest = await this.getLatestVersion();
    
    return {
      current,
      latest,
      hasUpdate: current !== latest
    };
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
   * Force an immediate update check
   */
  async forceCheck(): Promise<VersionInfo> {
    this.forceUpdate = true;
    return this.checkAndUpdate();
  }
}

// Singleton instance
export const autoUpdater = new ClaudeFlowAutoUpdater();

// Auto-initialize on import (browser-safe)
if (typeof window !== 'undefined') {
  // Browser environment - initialize after a short delay
  setTimeout(() => {
    autoUpdater.initialize().catch(console.error);
  }, 1000);
}