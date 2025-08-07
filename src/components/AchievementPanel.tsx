import React, { useState } from 'react';
import { Trophy, Star, Filter, Search, Crown, Gift } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { Achievement, AchievementCategory } from '../types/game';
import { achievementCategories, getAchievementProgress } from '../systems/achievementSystem';

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const progress = getAchievementProgress(achievement);
  const isCompleted = achievement.unlocked;
  const isHidden = achievement.hidden && !isCompleted;

  // Rarity colors
  const rarityColors = {
    common: 'border-gray-500 bg-gray-800',
    rare: 'border-blue-500 bg-blue-900/20',
    epic: 'border-purple-500 bg-purple-900/20',
    legendary: 'border-yellow-500 bg-yellow-900/20',
    'ruv-tribute': 'border-orange-500 bg-gradient-to-br from-orange-900/30 to-red-900/30'
  };

  const textColors = {
    common: 'text-gray-300',
    rare: 'text-blue-300',
    epic: 'text-purple-300',
    legendary: 'text-yellow-300',
    'ruv-tribute': 'text-orange-300'
  };

  if (isHidden) {
    return (
      <div className="border border-gray-600 bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors">
        <div className="text-center">
          <div className="text-2xl mb-2">❓</div>
          <div className="text-gray-400 font-medium">Hidden Achievement</div>
          <div className="text-xs text-gray-500 mt-1">Discover this secret!</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
        rarityColors[achievement.rarity]
      } ${isCompleted ? 'shadow-lg' : 'opacity-75'}`}
      onClick={onClick}
    >
      {/* Achievement Icon & Rarity */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex items-center space-x-1">
          {achievement.rarity === 'ruv-tribute' && <Crown className="w-4 h-4 text-orange-400" />}
          {isCompleted && <Trophy className="w-4 h-4 text-yellow-500" />}
        </div>
      </div>

      {/* Achievement Info */}
      <div className="space-y-2">
        <h3 className={`font-bold text-lg ${textColors[achievement.rarity]}`}>
          {achievement.name}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {achievement.description}
        </p>

        {/* Progress Bar (for incomplete achievements) */}
        {!isCompleted && achievement.maxProgress > 1 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  achievement.rarity === 'ruv-tribute'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                    : achievement.rarity === 'legendary'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : achievement.rarity === 'epic'
                    ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                    : achievement.rarity === 'rare'
                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                    : 'bg-gray-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Completion Info */}
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full ${
            achievement.rarity === 'ruv-tribute'
              ? 'bg-orange-900/50 text-orange-300'
              : achievement.rarity === 'legendary'
              ? 'bg-yellow-900/50 text-yellow-300'
              : achievement.rarity === 'epic'
              ? 'bg-purple-900/50 text-purple-300'
              : achievement.rarity === 'rare'
              ? 'bg-blue-900/50 text-blue-300'
              : 'bg-gray-700 text-gray-300'
          }`}>
            {achievement.rarity}
          </span>
          
          <div className="flex items-center space-x-2">
            {isCompleted && achievement.unlockedAt && (
              <span className="text-green-400">
                {achievement.unlockedAt.toLocaleDateString()}
              </span>
            )}
            <span className="text-yellow-400 font-medium">
              {achievement.xpReward} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Filter Component
const CategoryFilter: React.FC<{
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeCategory === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        All ({categories.length})
      </button>
      
      {Object.entries(achievementCategories).map(([key, label]) => {
        const count = categories.filter(cat => cat === key).length;
        return (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === key
                ? key === 'ruv-tribute'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label} ({count})
          </button>
        );
      })}
    </div>
  );
};

// Stats Overview Component
const StatsOverview: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXp = achievements.reduce((sum, a) => sum + (a.unlocked ? a.xpReward : 0), 0);
  
  const rarityStats = achievements.reduce((stats, a) => {
    if (a.unlocked) {
      stats[a.rarity] = (stats[a.rarity] || 0) + 1;
    }
    return stats;
  }, {} as Record<string, number>);

  const completionRate = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-400">{unlockedCount}</div>
        <div className="text-sm text-gray-400">Unlocked</div>
        <div className="text-xs text-gray-500">of {achievements.length}</div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-yellow-400">{totalXp.toLocaleString()}</div>
        <div className="text-sm text-gray-400">XP Earned</div>
        <div className="text-xs text-gray-500">from achievements</div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-400">{completionRate}%</div>
        <div className="text-sm text-gray-400">Complete</div>
        <div className="text-xs text-gray-500">overall progress</div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-purple-400">{rarityStats['legendary'] || 0}</div>
        <div className="text-sm text-gray-400">Legendary</div>
        <div className="text-xs text-gray-500">achievements</div>
      </div>
    </div>
  );
};

// rUv Tribute Special Section
const RuvTributeSection: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
  const ruvAchievements = achievements.filter(a => a.category === 'ruv-tribute');
  const unlockedRuvCount = ruvAchievements.filter(a => a.unlocked).length;
  
  if (ruvAchievements.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-2 border-orange-500/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-2xl font-bold text-orange-300">rUv Tribute Collection</h3>
              <p className="text-orange-400/80">Honor the creator of Claude Flow</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-300">{unlockedRuvCount}</div>
            <div className="text-sm text-orange-400">of {ruvAchievements.length}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ruvAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
        
        {unlockedRuvCount === ruvAchievements.length && (
          <div className="mt-4 text-center p-4 bg-orange-900/30 rounded border border-orange-400">
            <Gift className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-orange-300 font-bold">
              🎉 Complete rUv Tribute Master! 🎉
            </p>
            <p className="text-orange-400 text-sm">
              You have honored the visionary behind Claude Flow. rUv would be proud!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Achievement Panel Component
export const AchievementPanel: React.FC = () => {
  const { achievements } = useGameStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter achievements based on category and search
  const filteredAchievements = achievements.filter((achievement) => {
    // Category filter
    if (activeCategory !== 'all' && achievement.category !== activeCategory) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort achievements: unlocked first, then by rarity, then by name
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    // Unlocked achievements first
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }
    
    // Then by rarity (rUv tribute first, then legendary, epic, rare, common)
    const rarityOrder = { 'ruv-tribute': 0, legendary: 1, epic: 2, rare: 3, common: 4 };
    const aOrder = rarityOrder[a.rarity];
    const bOrder = rarityOrder[b.rarity];
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Finally by name
    return a.name.localeCompare(b.name);
  });

  const categories = achievements.map(a => a.category);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Achievements</h1>
            <p className="text-gray-400">Track your mastery of Claude Flow</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview achievements={achievements} />

      {/* rUv Tribute Special Section */}
      <RuvTributeSection achievements={achievements} />

      {/* Category Filters */}
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedAchievements.map((achievement) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement}
            onClick={() => {
              // Could open achievement details modal
              console.log('Achievement clicked:', achievement);
            }}
          />
        ))}
      </div>

      {/* No Results Message */}
      {sortedAchievements.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Achievements Found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'No achievements in this category yet'
            }
          </p>
        </div>
      )}

      {/* Easter Egg Hint */}
      <div className="mt-12 text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Pro Tip</h3>
        <p className="text-gray-400">
          Include "rUv" in your commands to unlock hidden tribute achievements and honor 
          the creator of Claude Flow! 🎉
        </p>
      </div>
    </div>
  );
};

export default AchievementPanel;