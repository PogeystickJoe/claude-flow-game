import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, History, BookOpen, Zap, Award } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { getTutorialCommands } from '../systems/tutorialSystem';

// Command suggestions based on current level and unlocked tools
const getCommandSuggestions = (level: number): string[] => {
  const basicCommands = [
    'swarm_init({ topology: "mesh", maxAgents: 5 })',
    'agent_spawn({ type: "researcher", capabilities: ["analysis"] })',
    'swarm_status({ verbose: true })',
    'task_orchestrate({ task: "Analyze performance", strategy: "adaptive" })'
  ];
  
  const intermediateCommands = [
    'memory_usage({ action: "store", key: "config", value: "data" })',
    'neural_train({ pattern_type: "coordination", epochs: 20 })',
    'performance_report({ format: "detailed" })'
  ];
  
  const advancedCommands = [
    'github_repo_analyze({ repo: "example/repo", analysis_type: "code_quality" })',
    'workflow_create({ name: "auto-test", steps: ["lint", "test", "build"] })',
    'daa_agent_create({ id: "autonomous", cognitivePattern: "adaptive" })'
  ];
  
  let suggestions = [...basicCommands];
  if (level >= 3) suggestions.push(...intermediateCommands);
  if (level >= 7) suggestions.push(...advancedCommands);
  
  return suggestions;
};

// Command history component
const CommandHistory: React.FC<{ history: any[]; onSelectCommand: (cmd: string) => void }> = ({ 
  history, 
  onSelectCommand 
}) => {
  if (history.length === 0) {
    return (
      <div className="text-gray-400 text-sm p-4 text-center">
        No commands executed yet. Try running your first command!
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {history.slice(-10).reverse().map((entry, index) => (
        <div
          key={index}
          className={`p-3 rounded border-l-4 cursor-pointer hover:bg-gray-800 transition-colors ${
            entry.success 
              ? 'bg-green-900/20 border-green-500' 
              : 'bg-red-900/20 border-red-500'
          }`}
          onClick={() => onSelectCommand(entry.command)}
        >
          <div className="flex items-center justify-between mb-1">
            <code className="text-sm text-blue-300">{entry.command}</code>
            <div className="flex items-center space-x-2">
              {entry.xpGained > 0 && (
                <span className="bg-yellow-500 text-black px-1 py-0.5 rounded text-xs">
                  +{entry.xpGained} XP
                </span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-300">{entry.output}</div>
        </div>
      ))}
    </div>
  );
};

// Command suggestions component
const CommandSuggestions: React.FC<{ 
  suggestions: string[]; 
  onSelectSuggestion: (cmd: string) => void;
  currentLevel: number;
}> = ({ suggestions, onSelectSuggestion, currentLevel }) => {
  const tutorialCommands = getTutorialCommands();
  
  return (
    <div className="space-y-3">
      {/* Tutorial commands */}
      {currentLevel <= 5 && (
        <div>
          <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            Tutorial Commands
          </h4>
          <div className="space-y-1">
            {tutorialCommands.slice(0, 3).map((cmd, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(cmd)}
                className="w-full text-left p-2 bg-blue-900/20 hover:bg-blue-800/40 rounded border border-blue-500/30 transition-colors"
              >
                <code className="text-sm text-blue-300">{cmd}</code>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Level-appropriate suggestions */}
      <div>
        <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-1" />
          Suggested Commands (Level {currentLevel})
        </h4>
        <div className="space-y-1">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="w-full text-left p-2 bg-gray-800/50 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
            >
              <code className="text-sm text-green-300">{suggestion}</code>
            </button>
          ))}
        </div>
      </div>
      
      {/* Easter egg hints */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
        <h4 className="text-sm font-semibold text-purple-400 mb-1 flex items-center">
          <Award className="w-4 h-4 mr-1" />
          Easter Egg Hint
        </h4>
        <p className="text-xs text-purple-300">
          Try including "rUv" in your commands to discover hidden tributes and unlock special achievements!
        </p>
      </div>
    </div>
  );
};

// Main Command Sandbox Component
export const CommandSandbox: React.FC = () => {
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'execute' | 'history' | 'suggestions'>('execute');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    sandbox, 
    player,
    executeCommand,
    settings,
    tutorial
  } = useGameStore();

  // Auto-focus input
  useEffect(() => {
    if (activeTab === 'execute' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return;
    
    setIsExecuting(true);
    
    try {
      // Add dramatic delay for effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await executeCommand(input.trim());
      
      // Tutorial integration
      if (tutorial.active) {
        const tutorialSystem = new (await import('../systems/tutorialSystem')).TutorialSystem(useGameStore);
        if (tutorialSystem.isStepCommand(input)) {
          tutorialSystem.validateCommand(input, result);
        }
      }
      
      // Clear input on success
      if (result.success) {
        setInput('');
      }
      
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecute();
    }
    
    // Command history navigation
    if (e.key === 'ArrowUp' && input === '') {
      e.preventDefault();
      const lastCommand = sandbox.history[sandbox.history.length - 1];
      if (lastCommand) {
        setInput(lastCommand.command);
      }
    }
  };

  const commandSuggestions = getCommandSuggestions(player.level);

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Command Sandbox</h3>
          {settings.realTimeExecution && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">LIVE</span>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1">
          {[
            { id: 'execute', label: 'Execute', icon: Play },
            { id: 'history', label: 'History', icon: History },
            { id: 'suggestions', label: 'Help', icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'execute' && (
          <>
            {/* Command Input */}
            <div className="p-4 border-b border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Claude Flow Command:
              </label>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., swarm_init({ topology: 'mesh', maxAgents: 5 })"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isExecuting}
              />
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-400">
                  Press Ctrl+Enter to execute • Up arrow for last command
                </div>
                <button
                  onClick={handleExecute}
                  disabled={!input.trim() || isExecuting}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div className="flex-1 p-4">
              {sandbox.output ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Output:</div>
                  <div className="bg-gray-800 border border-gray-600 rounded p-3 font-mono text-sm text-green-300">
                    {sandbox.output}
                  </div>
                  {sandbox.errors.length > 0 && (
                    <div className="bg-red-900/20 border border-red-500 rounded p-3 font-mono text-sm text-red-300">
                      {sandbox.errors.join('\n')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Execute a command to see the output</p>
                    <p className="text-sm mt-1">All commands are executed in a safe sandbox environment</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 p-4">
            <CommandHistory 
              history={sandbox.history} 
              onSelectCommand={(cmd) => {
                setInput(cmd);
                setActiveTab('execute');
              }}
            />
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <CommandSuggestions 
              suggestions={commandSuggestions}
              currentLevel={player.level}
              onSelectSuggestion={(cmd) => {
                setInput(cmd);
                setActiveTab('execute');
              }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 flex items-center justify-between">
        <div>
          Sandbox Mode: {settings.realTimeExecution ? 'Live Execution' : 'Safe Simulation'}
        </div>
        <div className="flex items-center space-x-4">
          <span>Commands: {sandbox.history.length}</span>
          <span>Success Rate: {
            sandbox.history.length > 0 
              ? Math.round((sandbox.history.filter(h => h.success).length / sandbox.history.length) * 100)
              : 0
          }%</span>
        </div>
      </div>
    </div>
  );
};

export default CommandSandbox;