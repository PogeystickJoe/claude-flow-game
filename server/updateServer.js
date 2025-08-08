/**
 * Claude Flow Auto-Update Server
 * Runs BEFORE the game starts to ensure latest version
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class ClaudeFlowUpdateServer {
  constructor() {
    this.app = express();
    this.port = process.env.UPDATE_SERVER_PORT || 3456;
    this.updateStatus = {
      checking: false,
      updating: false,
      currentVersion: 'unknown',
      latestVersion: 'unknown',
      lastCheck: null,
      newFeatures: []
    };
    
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(cors());
    this.app.use(express.json());

    // Get update status
    this.app.get('/api/update-status', (req, res) => {
      res.json(this.updateStatus);
    });

    // Force update check
    this.app.post('/api/check-update', async (req, res) => {
      try {
        const result = await this.checkAndUpdate();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get discovered features
    this.app.get('/api/features', async (req, res) => {
      try {
        const features = await this.discoverFeatures();
        res.json(features);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async initialize() {
    console.log('🚀 Claude Flow Update Server Initializing...');
    
    // ALWAYS check and update on startup
    await this.checkAndUpdate();
    
    // Start the update API server
    this.app.listen(this.port, () => {
      console.log(`✅ Update server running on port ${this.port}`);
    });
  }

  async checkAndUpdate() {
    if (this.updateStatus.checking || this.updateStatus.updating) {
      console.log('⏳ Update already in progress...');
      return this.updateStatus;
    }

    this.updateStatus.checking = true;
    console.log('🔍 Checking for Claude Flow updates...');

    try {
      // Clear npm cache to ensure fresh check
      console.log('   Clearing npm cache...');
      await execAsync('npm cache clean --force');

      // Get current version
      let currentVersion = 'unknown';
      try {
        const { stdout: currentStdout } = await execAsync('npx claude-flow@alpha --version 2>/dev/null');
        const versionMatch = currentStdout.match(/v?(\d+\.\d+\.\d+(?:-alpha\.\d+)?)/);
        currentVersion = versionMatch ? versionMatch[1] : 'unknown';
      } catch {
        currentVersion = 'not-installed';
      }
      
      console.log(`   Current version: ${currentVersion}`);
      this.updateStatus.currentVersion = currentVersion;

      // Get latest version from npm
      console.log('   Checking npm for latest version...');
      const { stdout: latestStdout } = await execAsync('npm view claude-flow@alpha version');
      const latestVersion = latestStdout.trim();
      
      console.log(`   Latest version: ${latestVersion}`);
      this.updateStatus.latestVersion = latestVersion;

      // ALWAYS update (even if versions match, to ensure fresh download)
      const needsUpdate = true; // Force update every time
      
      if (needsUpdate) {
        this.updateStatus.updating = true;
        console.log(`⚡ Updating Claude Flow to ${latestVersion}...`);
        
        // Use npx with --yes to force latest version
        console.log('   Downloading latest version...');
        await execAsync('npx --yes claude-flow@alpha --version', {
          env: {
            ...process.env,
            npm_config_update_notifier: 'false',
            npm_config_fund: 'false',
            npm_config_audit: 'false'
          }
        });
        
        // Also try to update global installation
        try {
          console.log('   Updating global installation...');
          await execAsync('npm install -g claude-flow@alpha --force', {
            env: {
              ...process.env,
              npm_config_update_notifier: 'false',
              npm_config_fund: 'false',
              npm_config_audit: 'false'
            }
          });
        } catch (e) {
          console.log('   Note: Global update optional, npx is sufficient');
        }
        
        // Verify update
        const { stdout: verifyStdout } = await execAsync('npx claude-flow@alpha --version');
        const verifyMatch = verifyStdout.match(/v?(\d+\.\d+\.\d+(?:-alpha\.\d+)?)/);
        const verifiedVersion = verifyMatch ? verifyMatch[1] : latestVersion;
        
        console.log(`✅ Claude Flow updated to ${verifiedVersion}`);
        this.updateStatus.currentVersion = verifiedVersion;
        
        // Discover new features
        this.updateStatus.newFeatures = await this.discoverFeatures();
        
        this.updateStatus.updating = false;
      } else {
        console.log('✅ Claude Flow is already at the latest version');
      }

      this.updateStatus.checking = false;
      this.updateStatus.lastCheck = new Date().toISOString();
      
      // Save status to file for game to read
      await this.saveStatus();
      
      return this.updateStatus;
    } catch (error) {
      console.error('❌ Update error:', error.message);
      this.updateStatus.checking = false;
      this.updateStatus.updating = false;
      this.updateStatus.error = error.message;
      return this.updateStatus;
    }
  }

  async discoverFeatures() {
    try {
      console.log('🔍 Discovering Claude Flow features...');
      const { stdout } = await execAsync('npx claude-flow@alpha help');
      
      const features = [];
      
      // Extract commands
      const commandMatches = stdout.match(/^\s+(\w+[\w-]*)\s+/gm);
      if (commandMatches) {
        features.push(...commandMatches.map(cmd => cmd.trim()));
      }
      
      // Extract key capabilities
      const capabilities = [
        { pattern: /swarm/gi, name: 'Swarm Orchestration' },
        { pattern: /neural/gi, name: 'Neural Networks' },
        { pattern: /agent/gi, name: 'Agent Management' },
        { pattern: /sparc/gi, name: 'SPARC Methodology' },
        { pattern: /github/gi, name: 'GitHub Integration' },
        { pattern: /memory/gi, name: 'Memory Management' },
        { pattern: /hive[\s-]?mind/gi, name: 'Hive Mind Intelligence' }
      ];
      
      capabilities.forEach(cap => {
        if (cap.pattern.test(stdout)) {
          features.push(cap.name);
        }
      });
      
      console.log(`   Found ${features.length} features`);
      return features.slice(0, 30); // Limit to top 30
    } catch (error) {
      console.error('   Feature discovery failed:', error.message);
      return ['swarm', 'agent', 'neural', 'sparc', 'github', 'memory'];
    }
  }

  async saveStatus() {
    try {
      const statusFile = path.join(__dirname, '..', '.claude-flow', 'update-status.json');
      await fs.mkdir(path.dirname(statusFile), { recursive: true });
      await fs.writeFile(statusFile, JSON.stringify(this.updateStatus, null, 2));
      console.log('💾 Update status saved');
    } catch (error) {
      console.error('Failed to save status:', error.message);
    }
  }
}

// Run the update server
const updateServer = new ClaudeFlowUpdateServer();
updateServer.initialize();

// Export for use in other scripts
module.exports = updateServer;