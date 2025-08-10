import React, { useState } from 'react';
import { Info, ChevronRight, Command, HelpCircle, Code, Layers, GitBranch, Users } from 'lucide-react';

interface CommandExample {
  command: string;
  description: string;
  explanation: string;
  variants?: string[];
}

const commandExamples: Record<string, CommandExample[]> = {
  'Swarm Management': [
    {
      command: 'swarm init mesh',
      description: 'Initialize a mesh topology swarm',
      explanation: 'Creates a fully-connected network where every agent can communicate with every other agent. Best for collaborative tasks.',
      variants: [
        'swarm init hierarchical - Queen-led hierarchy',
        'swarm init ring - Circular communication',
        'swarm init star - Central hub topology'
      ]
    },
    {
      command: 'swarm status',
      description: 'Check current swarm status',
      explanation: 'Shows active agents, pending tasks, and swarm health',
      variants: ['swarm status --verbose']
    }
  ],
  'Agent Operations': [
    {
      command: 'agent spawn researcher',
      description: 'Create a research specialist agent',
      explanation: 'Spawns an agent that analyzes code, searches documentation, and gathers information',
      variants: [
        'agent spawn coder - Code generation specialist',
        'agent spawn tester - Testing specialist',
        'agent spawn reviewer - Code review specialist'
      ]
    },
    {
      command: 'agent list',
      description: 'List all active agents',
      explanation: 'Shows all spawned agents with their status and capabilities'
    }
  ],
  'Task Orchestration': [
    {
      command: 'task orchestrate "Build a REST API"',
      description: 'Distribute a task across the swarm',
      explanation: 'Automatically assigns subtasks to appropriate agents based on their capabilities',
      variants: [
        'task orchestrate "Fix bugs" --priority high',
        'task orchestrate "Write tests" --strategy parallel'
      ]
    }
  ],
  'SPARC Modes': [
    {
      command: 'sparc run spec-pseudocode "Create user auth"',
      description: 'Run specification and pseudocode phase',
      explanation: 'Analyzes requirements and creates algorithm design before implementation'
    },
    {
      command: 'sparc tdd "payment system"',
      description: 'Complete TDD workflow',
      explanation: 'Runs test-driven development: writes tests first, then implementation'
    }
  ]
};

const CommandDifference: React.FC = () => {
  const [selectedComparison, setSelectedComparison] = useState<'swarm' | 'agent' | 'task'>('swarm');
  
  const comparisons = {
    swarm: {
      title: 'Swarm Command Variations',
      items: [
        {
          command: 'swarm',
          description: 'Invalid - needs a subcommand',
          result: '❌ Error: Missing subcommand (init, status, destroy, etc.)'
        },
        {
          command: 'swarm init',
          description: 'Invalid - needs topology',
          result: '❌ Error: Topology required (mesh, hierarchical, ring, star)'
        },
        {
          command: 'swarm init mesh',
          description: 'Valid - creates mesh swarm',
          result: '✅ Creates fully-connected mesh network with default 5 agents'
        },
        {
          command: 'swarm init mesh --agents 10',
          description: 'Valid with options',
          result: '✅ Creates mesh with 10 agents instead of default 5'
        }
      ]
    },
    agent: {
      title: 'Agent Command Variations',
      items: [
        {
          command: 'agent',
          description: 'Invalid - needs action',
          result: '❌ Error: Missing action (spawn, list, metrics, etc.)'
        },
        {
          command: 'agent spawn',
          description: 'Invalid - needs type',
          result: '❌ Error: Agent type required (researcher, coder, tester, etc.)'
        },
        {
          command: 'agent spawn coder',
          description: 'Valid - spawns coder agent',
          result: '✅ Creates a code generation specialist agent'
        },
        {
          command: 'agent spawn coder --name "CodeMaster"',
          description: 'Valid with custom name',
          result: '✅ Creates named coder agent for easier reference'
        }
      ]
    },
    task: {
      title: 'Task Command Variations',
      items: [
        {
          command: 'task',
          description: 'Invalid - needs action',
          result: '❌ Error: Missing action (orchestrate, status, results)'
        },
        {
          command: 'task orchestrate',
          description: 'Invalid - needs task description',
          result: '❌ Error: Task description required in quotes'
        },
        {
          command: 'task orchestrate "Build API"',
          description: 'Valid basic task',
          result: '✅ Distributes task across available agents'
        },
        {
          command: 'task orchestrate "Build API" --strategy parallel',
          description: 'Valid with execution strategy',
          result: '✅ Runs subtasks in parallel for faster completion'
        }
      ]
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <HelpCircle className="w-5 h-5 mr-2 text-yellow-400" />
        Understanding Command Structure
      </h3>
      
      <div className="flex space-x-2 mb-4">
        {Object.keys(comparisons).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedComparison(key as any)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedComparison === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)} Commands
          </button>
        ))}
      </div>
      
      <div className="space-y-3">
        <h4 className="text-md font-medium text-blue-400">
          {comparisons[selectedComparison].title}
        </h4>
        {comparisons[selectedComparison].items.map((item, index) => (
          <div key={index} className="bg-gray-900 rounded p-3 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <code className="text-sm text-green-300 bg-black px-2 py-1 rounded">
                {item.command}
              </code>
              <span className="text-xs text-gray-400">{item.description}</span>
            </div>
            <div className="text-sm text-gray-300">{item.result}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CommandGuide: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Swarm Management');
  const [showComparison, setShowComparison] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Quick Start */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 border border-blue-500">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center">
          <Command className="w-5 h-5 mr-2" />
          Quick Start - Try These Commands!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-black/30 rounded p-2">
            <code className="text-sm text-green-300">swarm init mesh</code>
            <p className="text-xs text-gray-300 mt-1">Start with a mesh network</p>
          </div>
          <div className="bg-black/30 rounded p-2">
            <code className="text-sm text-green-300">agent spawn researcher</code>
            <p className="text-xs text-gray-300 mt-1">Add your first agent</p>
          </div>
          <div className="bg-black/30 rounded p-2">
            <code className="text-sm text-green-300">swarm status</code>
            <p className="text-xs text-gray-300 mt-1">Check your swarm</p>
          </div>
          <div className="bg-black/30 rounded p-2">
            <code className="text-sm text-green-300">task orchestrate "Hello"</code>
            <p className="text-xs text-gray-300 mt-1">Run your first task</p>
          </div>
        </div>
      </div>

      {/* Command Structure Help */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-md font-semibold text-yellow-400 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Why "swarm init mesh" and not just "swarm"?
          </h3>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
        </button>
        {showComparison && (
          <div className="mt-4">
            <CommandDifference />
          </div>
        )}
      </div>

      {/* Command Categories */}
      <div className="space-y-2">
        {Object.entries(commandExamples).map(([category, examples]) => (
          <div key={category} className="bg-gray-800 rounded-lg border border-gray-700">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center">
                {category === 'Swarm Management' && <Layers className="w-5 h-5 mr-2 text-blue-400" />}
                {category === 'Agent Operations' && <Users className="w-5 h-5 mr-2 text-green-400" />}
                {category === 'Task Orchestration' && <GitBranch className="w-5 h-5 mr-2 text-purple-400" />}
                {category === 'SPARC Modes' && <Code className="w-5 h-5 mr-2 text-orange-400" />}
                <h3 className="text-lg font-semibold text-white">{category}</h3>
                <span className="ml-2 text-sm text-gray-400">({examples.length} commands)</span>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedCategory === category ? 'rotate-90' : ''
                }`} 
              />
            </button>
            
            {expandedCategory === category && (
              <div className="px-4 pb-4 space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-sm font-mono bg-black text-green-300 px-2 py-1 rounded">
                        {example.command}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(example.command);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{example.description}</p>
                    <p className="text-xs text-gray-400 italic">{example.explanation}</p>
                    {example.variants && (
                      <div className="mt-2 pt-2 border-t border-gray-800">
                        <p className="text-xs text-gray-500 mb-1">Variations:</p>
                        <div className="space-y-1">
                          {example.variants.map((variant, vIndex) => (
                            <div key={vIndex} className="text-xs text-gray-400">
                              <code className="text-blue-300">{variant.split(' - ')[0]}</code>
                              {variant.includes(' - ') && (
                                <span className="ml-2">{variant.split(' - ')[1]}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pro Tips */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500">
        <h3 className="text-md font-semibold text-purple-300 mb-2">💡 Pro Tips</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• Commands follow the pattern: <code className="text-blue-300">[tool] [action] [target] [options]</code></li>
          <li>• Use quotes for multi-word task descriptions: <code className="text-blue-300">"Build a REST API"</code></li>
          <li>• Chain commands with <code className="text-blue-300">&&</code> for sequential execution</li>
          <li>• Add <code className="text-blue-300">--help</code> to any command for detailed info</li>
          <li>• Press Up arrow in the sandbox to recall your last command</li>
        </ul>
      </div>
    </div>
  );
};

export default CommandGuide;