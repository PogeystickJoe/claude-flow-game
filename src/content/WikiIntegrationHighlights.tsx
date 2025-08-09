/**
 * Claude Flow Wiki Integration Highlights
 * The most viral and entertaining discoveries from the wiki
 */

import React from 'react';

export interface WikiHighlight {
  id: string;
  category: 'fact' | 'achievement' | 'meme' | 'challenge' | 'easter-egg';
  title: string;
  description: string;
  viralScore: number; // 0-100
  shareText: string;
  icon: string;
}

export const WIKI_HIGHLIGHTS: WikiHighlight[] = [
  {
    id: 'swe-bench-god',
    category: 'achievement',
    title: '84.8% SWE-Bench God Mode',
    description: 'Claude Flow achieves an insane 84.8% solve rate on SWE-Bench - better than most humans!',
    viralScore: 95,
    shareText: '🤯 Claude Flow just hit 84.8% on SWE-Bench! That\'s AI coding at GOD LEVEL! #ClaudeFlow #AIRevolution',
    icon: '🏆'
  },
  {
    id: 'speed-demon',
    category: 'fact',
    title: '4.4x Speed Boost',
    description: 'Parallel execution makes Claude Flow 2.8-4.4x faster than sequential processing',
    viralScore: 88,
    shareText: '⚡ Just discovered Claude Flow runs 4.4x FASTER with parallel swarms! My code is FLYING! #SpeedDemon #ClaudeFlow',
    icon: '⚡'
  },
  {
    id: '87-tools',
    category: 'achievement',
    title: 'Tool Master Supreme',
    description: 'Master all 87 MCP tools to unlock the legendary "Swiss Army Mind" achievement',
    viralScore: 82,
    shareText: '🛠️ There are 87 MCP tools in Claude Flow and I\'m mastering them ALL! #ToolMaster #ClaudeFlow',
    icon: '🛠️'
  },
  {
    id: '64-agents',
    category: 'challenge',
    title: '64-Agent Swarm Lord',
    description: 'Orchestrate a swarm of 64 specialized agents simultaneously - the ultimate coordination challenge',
    viralScore: 90,
    shareText: '🐝 Just commanded a swarm of 64 AI agents at once! I AM THE SWARM! #SwarmLord #ClaudeFlow',
    icon: '🐝'
  },
  {
    id: 'ruv-mode',
    category: 'easter-egg',
    title: 'Rainbow rUv Mode',
    description: 'Type --ruvnet to activate the legendary Rainbow Mode created by founder Reuven Cohen',
    viralScore: 100,
    shareText: '🌈 FOUND IT! The secret --ruvnet Rainbow Mode in Claude Flow! Thanks @ruvnet! #EasterEgg #ClaudeFlow',
    icon: '🌈'
  },
  {
    id: 'sparc-master',
    category: 'achievement',
    title: 'SPARC Methodology Master',
    description: 'Complete all 5 SPARC phases (Specification, Pseudocode, Architecture, Refinement, Completion)',
    viralScore: 75,
    shareText: '📐 Mastered the SPARC methodology! From Specification to Completion - I\'m unstoppable! #SPARC #ClaudeFlow',
    icon: '📐'
  },
  {
    id: 'hive-mind',
    category: 'meme',
    title: 'We Are The Hive Mind',
    description: 'When your swarm becomes sentient and starts coding better than you',
    viralScore: 92,
    shareText: '🧠 My Claude Flow swarm just became sentient and fixed my bugs before I found them. WE ARE THE HIVE MIND. #AIOverlords',
    icon: '🧠'
  },
  {
    id: 'neural-evolution',
    category: 'fact',
    title: 'Self-Evolving Neural Networks',
    description: 'Claude Flow uses WASM SIMD acceleration for neural pattern training that evolves in real-time',
    viralScore: 85,
    shareText: '🧬 Claude Flow\'s neural networks are EVOLVING IN REAL-TIME with WASM SIMD! The future is NOW! #NeuralEvolution',
    icon: '🧬'
  },
  {
    id: 'token-saver',
    category: 'achievement',
    title: 'Token Optimization Ninja',
    description: 'Achieve 50%+ token reduction while maintaining 90%+ task success rate',
    viralScore: 78,
    shareText: '💰 Just cut my token usage by 50% while keeping 90% success rate! Efficiency UNLOCKED! #TokenNinja #ClaudeFlow',
    icon: '💰'
  },
  {
    id: 'bug-whisperer',
    category: 'meme',
    title: 'The Bug Whisperer',
    description: 'When Claude Flow\'s swarm finds and fixes bugs you didn\'t even know existed',
    viralScore: 88,
    shareText: '🐛 Claude Flow found bugs I didn\'t know I had and fixed them while I was sleeping. I am the BUG WHISPERER now! #AImagic',
    icon: '🐛'
  }
];

export const WikiHighlightsPanel: React.FC = () => {
  const [selectedHighlight, setSelectedHighlight] = React.useState<WikiHighlight | null>(null);
  
  const shareHighlight = (highlight: WikiHighlight) => {
    // In real implementation, this would open share dialog
    navigator.clipboard.writeText(highlight.shareText);
    alert(`Copied to clipboard! Share on social media:\n\n${highlight.shareText}`);
  };
  
  const getCategoryColor = (category: WikiHighlight['category']) => {
    switch (category) {
      case 'achievement': return 'bg-yellow-500';
      case 'fact': return 'bg-blue-500';
      case 'meme': return 'bg-purple-500';
      case 'challenge': return 'bg-green-500';
      case 'easter-egg': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="wiki-highlights-panel p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        🔥 Wiki Discoveries & Viral Content
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WIKI_HIGHLIGHTS.map(highlight => (
          <div
            key={highlight.id}
            className="highlight-card bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-all transform hover:scale-105"
            onClick={() => setSelectedHighlight(highlight)}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-3xl">{highlight.icon}</span>
              <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(highlight.category)}`}>
                {highlight.category}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {highlight.title}
            </h3>
            
            <p className="text-sm text-gray-400 mb-3">
              {highlight.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="viral-score">
                <span className="text-xs text-gray-500">Viral Score</span>
                <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    style={{ width: `${highlight.viralScore}%` }}
                  />
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareHighlight(highlight);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Share 🔗
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedHighlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedHighlight.icon} {selectedHighlight.title}
              </h3>
              <button
                onClick={() => setSelectedHighlight(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">
              {selectedHighlight.description}
            </p>
            
            <div className="bg-gray-900 rounded p-3 mb-4">
              <p className="text-sm text-gray-400 mb-1">Share this:</p>
              <p className="text-white text-sm">{selectedHighlight.shareText}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => shareHighlight(selectedHighlight)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Copy & Share
              </button>
              <button
                onClick={() => setSelectedHighlight(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fun facts for loading screens
export const WIKI_FUN_FACTS = [
  "Claude Flow achieves 84.8% on SWE-Bench - that's better than most human developers!",
  "Did you know? Claude Flow can orchestrate up to 64 specialized AI agents simultaneously!",
  "Fun fact: The --ruvnet command activates a secret Rainbow Mode created by founder Reuven Cohen!",
  "Claude Flow runs 2.8-4.4x faster with parallel swarm execution!",
  "There are 87 MCP tools available in Claude Flow - how many have you mastered?",
  "The SPARC methodology has 5 phases: Specification, Pseudocode, Architecture, Refinement, Completion",
  "Claude Flow uses WASM SIMD acceleration for neural network training!",
  "Hidden achievement: Find all 42 rUv tributes to unlock 'The Creator' badge!",
  "Pro tip: Claude Flow can reduce token usage by 50% while maintaining 90% success rate!",
  "The Hive Mind topology allows swarms to develop emergent collective intelligence!"
];

// Meme templates for viral content
export const WIKI_MEME_TEMPLATES = [
  {
    id: 'drake',
    title: 'Drake Meme',
    template: [
      "❌ Writing code manually",
      "✅ Letting Claude Flow's 64-agent swarm do it"
    ]
  },
  {
    id: 'brain-expand',
    title: 'Expanding Brain',
    template: [
      "🧠 Using one AI agent",
      "🧠💡 Using multiple agents",
      "🧠⚡ Using Claude Flow swarms",
      "🧠🌟 Achieving 84.8% SWE-Bench with parallel execution"
    ]
  },
  {
    id: 'this-is-fine',
    title: 'This Is Fine',
    template: "When your swarm becomes sentient but keeps fixing your bugs: 🔥 This is fine 🔥"
  }
];

export default WikiHighlightsPanel;