import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  User, 
  Code, 
  Brain, 
  Zap, 
  Target, 
  Trophy,
  Play,
  Lock,
  Check,
  Star,
  Filter,
  Search,
  Map,
  Clock,
  Award
} from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { WikiTutorialSystem, WikiTutorialModule, AgentProfile, MCPToolProfile } from '../systems/wikiTutorialSystem';
import { DifficultyLevel, WikiCategory } from '../systems/wikiIntegration/interfaces/WikiContent';

interface WikiTutorialHubProps {
  onModuleStart?: (moduleId: string) => void;
  onChallengeStart?: (challengeId: string) => void;
}

interface LearningPathNode {
  module: WikiTutorialModule;
  position: { x: number; y: number };
  connections: string[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
}

interface ProgressData {
  completedModules: string[];
  completedChallenges: string[];
  totalXp: number;
  achievements: string[];
  currentStreak: number;
}

const WikiTutorialHub: React.FC<WikiTutorialHubProps> = ({
  onModuleStart,
  onChallengeStart
}) => {
  const { player, addXp, unlockAchievement } = useGameStore();
  const [tutorialSystem] = useState(() => new WikiTutorialSystem());
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'tools' | 'sparc' | 'neural' | 'benchmarks'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [progressData, setProgressData] = useState<ProgressData>({
    completedModules: [],
    completedChallenges: [],
    totalXp: 0,
    achievements: [],
    currentStreak: 0
  });

  // Load tutorial system data
  const [modules, setModules] = useState<WikiTutorialModule[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [mcpTools, setMCPTools] = useState<MCPToolProfile[]>([]);

  useEffect(() => {
    // Initialize tutorial system
    const loadData = async () => {
      const allModules = tutorialSystem.getAllTutorialModules();
      const allAgents = tutorialSystem.getAllAgentProfiles();
      const allTools = tutorialSystem.getAllMCPTools();
      
      setModules(allModules);
      setAgents(allAgents);
      setMCPTools(allTools);
    };

    loadData();
  }, [tutorialSystem]);

  // Filter and search logic
  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      // Category filter
      if (selectedCategory !== 'all' && module.category !== selectedCategory) {
        return false;
      }
      
      // Difficulty filter
      if (selectedDifficulty !== 'all' && module.difficulty !== selectedDifficulty) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !module.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !module.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [modules, selectedCategory, selectedDifficulty, searchTerm]);

  // Generate learning path visualization
  const learningPath = useMemo(() => {
    const nodes: LearningPathNode[] = [];
    const recommendedModules = tutorialSystem.getRecommendedModules(
      progressData.completedModules,
      player.level <= 5 ? DifficultyLevel.BEGINNER : 
      player.level <= 15 ? DifficultyLevel.INTERMEDIATE :
      player.level <= 25 ? DifficultyLevel.ADVANCED : DifficultyLevel.EXPERT,
      [WikiCategory.GETTING_STARTED, WikiCategory.AGENT_TYPES, WikiCategory.MCP_TOOLS]
    );

    recommendedModules.forEach((module, index) => {
      const angle = (index / recommendedModules.length) * 2 * Math.PI;
      const radius = 200;
      
      nodes.push({
        module,
        position: {
          x: 300 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius
        },
        connections: module.prerequisites,
        unlocked: player.level >= getRequiredLevel(module.difficulty),
        completed: progressData.completedModules.includes(module.id),
        progress: getModuleProgress(module.id)
      });
    });

    return nodes;
  }, [modules, progressData, player.level]);

  const getRequiredLevel = (difficulty: DifficultyLevel): number => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER: return 1;
      case DifficultyLevel.INTERMEDIATE: return 5;
      case DifficultyLevel.ADVANCED: return 15;
      case DifficultyLevel.EXPERT: return 25;
      default: return 1;
    }
  };

  const getModuleProgress = (moduleId: string): number => {
    // Calculate progress based on completed challenges and sections
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const totalChallenges = module.challenges.length;
    const completedChallenges = module.challenges.filter(c => 
      progressData.completedChallenges.includes(c.id)
    ).length;
    
    return totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
  };

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER: return 'text-green-400 border-green-500';
      case DifficultyLevel.INTERMEDIATE: return 'text-blue-400 border-blue-500';
      case DifficultyLevel.ADVANCED: return 'text-purple-400 border-purple-500';
      case DifficultyLevel.EXPERT: return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getCategoryIcon = (category: WikiCategory): React.ReactNode => {
    switch (category) {
      case WikiCategory.GETTING_STARTED: return <BookOpen className="w-5 h-5" />;
      case WikiCategory.AGENT_TYPES: return <User className="w-5 h-5" />;
      case WikiCategory.MCP_TOOLS: return <Code className="w-5 h-5" />;
      case WikiCategory.NEURAL_FEATURES: return <Brain className="w-5 h-5" />;
      case WikiCategory.PERFORMANCE: return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const handleModuleStart = (module: WikiTutorialModule) => {
    if (player.level < getRequiredLevel(module.difficulty)) {
      // Show unlock requirement message
      return;
    }
    
    onModuleStart?.(module.id);
  };

  const handleChallengeStart = (challengeId: string) => {
    onChallengeStart?.(challengeId);
  };

  // Tab content rendering
  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Learning Path Visualization */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Map className="w-6 h-6 mr-2 text-blue-400" />
          Your Learning Path
        </h3>
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
          <svg className="w-full h-full">
            {/* Render connections */}
            {learningPath.map(node => 
              node.connections.map(connectionId => {
                const connectedNode = learningPath.find(n => n.module.id === connectionId);
                if (!connectedNode) return null;
                
                return (
                  <line
                    key={`${node.module.id}-${connectionId}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={connectedNode.position.x}
                    y2={connectedNode.position.y}
                    stroke="#4B5563"
                    strokeWidth="2"
                    strokeDasharray={node.unlocked ? "0" : "5,5"}
                  />
                );
              })
            )}
            
            {/* Render nodes */}
            {learningPath.map(node => (
              <g key={node.module.id}>
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="30"
                  fill={node.completed ? "#10B981" : node.unlocked ? "#3B82F6" : "#6B7280"}
                  stroke={node.unlocked ? "#ffffff" : "#4B5563"}
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleModuleStart(node.module)}
                />
                
                {/* Progress ring */}
                {node.progress > 0 && (
                  <circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r="35"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray={`${(node.progress / 100) * 220} 220`}
                    transform={`rotate(-90 ${node.position.x} ${node.position.y})`}
                  />
                )}
                
                {/* Icon */}
                <foreignObject
                  x={node.position.x - 12}
                  y={node.position.y - 12}
                  width="24"
                  height="24"
                >
                  {getCategoryIcon(node.module.category)}
                </foreignObject>
              </g>
            ))}
          </svg>
          
          {/* Node tooltips */}
          {learningPath.map(node => (
            <div
              key={`tooltip-${node.module.id}`}
              className="absolute bg-gray-700 text-white p-2 rounded shadow-lg pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
              style={{
                left: node.position.x + 40,
                top: node.position.y - 20,
                zIndex: 10
              }}
            >
              <div className="font-semibold">{node.module.title}</div>
              <div className="text-sm text-gray-300">{node.module.difficulty}</div>
              <div className="text-sm text-gray-300">{node.progress.toFixed(0)}% Complete</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{progressData.completedModules.length}</div>
          <div className="text-gray-400">Modules Completed</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{progressData.completedChallenges.length}</div>
          <div className="text-gray-400">Challenges Solved</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{progressData.currentStreak}</div>
          <div className="text-gray-400">Current Streak</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{progressData.achievements.length}</div>
          <div className="text-gray-400">Achievements</div>
        </div>
      </div>

      {/* Recommended Modules */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorialSystem.getRecommendedModules(
            progressData.completedModules,
            player.level <= 5 ? DifficultyLevel.BEGINNER : DifficultyLevel.INTERMEDIATE,
            [WikiCategory.GETTING_STARTED, WikiCategory.AGENT_TYPES]
          ).slice(0, 6).map(module => (
            <ModuleCard
              key={module.id}
              module={module}
              progress={getModuleProgress(module.id)}
              unlocked={player.level >= getRequiredLevel(module.difficulty)}
              onStart={() => handleModuleStart(module)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Agent Mastery</h2>
        <p className="text-gray-400">Learn about all 64 Claude Flow agents and their capabilities</p>
      </div>

      {/* Agent Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {['core-development', 'swarm-coordination', 'github-repository', 'performance-optimization', 'specialized-development'].map(category => (
          <div
            key={category}
            className="bg-gray-800 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-semibold capitalize">
              {category.replace('-', ' ')}
            </div>
            <div className="text-gray-400 text-sm">
              {agents.filter(a => a.category === category).length} agents
            </div>
          </div>
        ))}
      </div>

      {/* Agent List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">All Agents</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.filter(agent => 
            !searchTerm || agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">MCP Tools Mastery</h2>
        <p className="text-gray-400">Master all 87 MCP tools with interactive tutorials</p>
      </div>

      {/* Tool Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {['coordination', 'monitoring', 'neural-features', 'github-integration', 'performance'].map(category => (
          <div
            key={category}
            className="bg-gray-800 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <Code className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-white font-semibold capitalize">
              {category.replace('-', ' ')}
            </div>
            <div className="text-gray-400 text-sm">
              {mcpTools.filter(t => t.category === category).length} tools
            </div>
          </div>
        ))}
      </div>

      {/* Tools List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">All MCP Tools</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mcpTools.filter(tool => 
            !searchTerm || tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(tool => (
            <MCPToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Claude Flow Wiki Tutorial Hub
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Master every aspect of Claude Flow with comprehensive interactive tutorials
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto bg-gray-700 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (progressData.completedModules.length / modules.length) * 100)}%` 
            }}
          />
        </div>
        <p className="text-gray-400 mt-2">
          {progressData.completedModules.length}/{modules.length} modules completed
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center mb-8 bg-gray-800 rounded-lg p-2">
        {[
          { key: 'overview', label: 'Overview', icon: Map },
          { key: 'agents', label: 'Agents (64)', icon: User },
          { key: 'tools', label: 'MCP Tools (87)', icon: Code },
          { key: 'sparc', label: 'SPARC', icon: Target },
          { key: 'neural', label: 'Neural', icon: Brain },
          { key: 'benchmarks', label: 'Benchmarks', icon: Zap }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === 'overview' || activeTab === 'sparc' || activeTab === 'neural') && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as WikiCategory | 'all')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.values(WikiCategory).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-gray-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              {Object.values(DifficultyLevel).map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2 flex-grow">
            <div className="relative flex-grow max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'agents' && renderAgentsTab()}
        {activeTab === 'tools' && renderToolsTab()}
        {activeTab === 'sparc' && (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">SPARC Methodology Tutorials</h3>
            <p className="text-gray-500">Coming soon - Interactive SPARC training modules</p>
          </div>
        )}
        {activeTab === 'neural' && (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">Neural Network Training</h3>
            <p className="text-gray-500">Coming soon - AI-powered coordination simulations</p>
          </div>
        )}
        {activeTab === 'benchmarks' && (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">Performance Benchmarks</h3>
            <p className="text-gray-500">Coming soon - Competitive benchmarking challenges</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components

interface ModuleCardProps {
  module: WikiTutorialModule;
  progress: number;
  unlocked: boolean;
  onStart: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, progress, unlocked, onStart }) => {
  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER: return 'text-green-400 border-green-500';
      case DifficultyLevel.INTERMEDIATE: return 'text-blue-400 border-blue-500';
      case DifficultyLevel.ADVANCED: return 'text-purple-400 border-purple-500';
      case DifficultyLevel.EXPERT: return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getCategoryIcon = (category: WikiCategory): React.ReactNode => {
    switch (category) {
      case WikiCategory.GETTING_STARTED: return <BookOpen className="w-5 h-5" />;
      case WikiCategory.AGENT_TYPES: return <User className="w-5 h-5" />;
      case WikiCategory.MCP_TOOLS: return <Code className="w-5 h-5" />;
      case WikiCategory.NEURAL_FEATURES: return <Brain className="w-5 h-5" />;
      case WikiCategory.PERFORMANCE: return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border-2 transition-all duration-200 ${
      unlocked 
        ? 'border-gray-600 hover:border-blue-500 cursor-pointer hover:scale-105' 
        : 'border-gray-700 opacity-50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getCategoryIcon(module.category)}
          <div className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(module.difficulty)}`}>
            {module.difficulty}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">{module.estimatedDuration}m</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{module.description}</p>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Learning Objectives */}
        <div className="space-y-1">
          {module.learningObjectives.slice(0, 2).map((objective, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm text-gray-400">
              <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>{objective}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-400">{module.xpReward} XP</span>
        </div>
        
        <button
          onClick={onStart}
          disabled={!unlocked}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            unlocked
              ? progress === 100
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : progress > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!unlocked ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Locked</span>
            </>
          ) : progress === 100 ? (
            <>
              <Check className="w-4 h-4" />
              <span>Review</span>
            </>
          ) : progress > 0 ? (
            <>
              <Play className="w-4 h-4" />
              <span>Continue</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface AgentCardProps {
  agent: AgentProfile;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{agent.name}</h4>
          <p className="text-sm text-gray-400 capitalize">{agent.category.replace('-', ' ')}</p>
        </div>
        <User className="w-6 h-6 text-blue-400" />
      </div>
      
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{agent.description}</p>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map(capability => (
            <span
              key={capability}
              className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded"
            >
              {capability}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{agent.challenges.length} challenges</span>
          <span className={`px-2 py-1 rounded ${
            agent.performance.resourceUsage === 'low' ? 'bg-green-900 text-green-300' :
            agent.performance.resourceUsage === 'medium' ? 'bg-yellow-900 text-yellow-300' :
            'bg-red-900 text-red-300'
          }`}>
            {agent.performance.resourceUsage} resource
          </span>
        </div>
      </div>
    </div>
  );
};

interface MCPToolCardProps {
  tool: MCPToolProfile;
}

const MCPToolCard: React.FC<MCPToolCardProps> = ({ tool }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{tool.name}</h4>
          <p className="text-sm text-gray-400 capitalize">{tool.category.replace('-', ' ')}</p>
        </div>
        <Code className="w-6 h-6 text-green-400" />
      </div>
      
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{tool.description}</p>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {tool.parameters.filter(p => p.required).slice(0, 3).map(param => (
            <span
              key={param.name}
              className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded"
            >
              {param.name}*
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{tool.examples.length} examples</span>
          <span>{tool.tutorial.steps.length} tutorial steps</span>
        </div>
      </div>
    </div>
  );
};

export default WikiTutorialHub;