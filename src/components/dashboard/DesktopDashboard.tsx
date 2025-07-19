'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/game-store';
import { levelManager } from '@/lib/level-manager';
import { SupabaseAPI } from '@/lib/api';
import { SoundManager } from '@/lib/sound-manager';
import { UserProgress, Achievement, LeaderboardEntry, User } from '@/types';
import { Database } from '@/lib/supabase';

type DbScore = Database['public']['Tables']['scores']['Row'];

// Mock achievements data
const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-case', title: 'First Case', description: 'Complete your first investigation', icon: '🔍', unlocked: true },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Complete a level in under 5 minutes', icon: '⚡', unlocked: false },
  { id: 'master-detective', title: 'Master Detective', description: 'Complete all levels', icon: '🕵️', unlocked: false },
];

interface DesktopDashboardProps {
  onStartInvestigation: (levelId: string) => void;
}
export function DesktopDashboard({ onStartInvestigation }: DesktopDashboardProps) {
  const { user } = useGameStore();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePanel, setActivePanel] = useState<'missions' | 'profile' | 'leaderboard' | 'achievements'>('missions');
  
  // Real data state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserProgress | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundManager = SoundManager.getInstance();

  const calculateUserStats = useCallback((scores: DbScore[], user: User) => {
    const completedLevels = scores.map(s => s.level_id);
    const fastestTime = scores.length > 0 ? Math.min(...scores.map(s => s.completion_time)) : 0;
    const perfectRuns = scores.filter(s => s.hints_used === 0 && s.wrong_commands === 0).length;
    
    // Calculate streak (simplified - consecutive days with completed levels)
    const streak = calculateStreak(scores);
    
    return {
      completedLevels,
      totalScore: user.totalScore || 0,
      achievements: ['first-case'], // Mock for now
      lastLogin: new Date().toISOString(),
      level: Math.floor((user.totalScore || 0) / 100) + 1,
      xp: user.totalScore || 0,
      xpToNext: 100 - ((user.totalScore || 0) % 100),
      activeTitle: getTitleFromScore(user.totalScore || 0),
      investigationsCompleted: scores.length,
      streak,
      fastestTime,
      perfectRuns,
      favoriteCategory: 'Digital Forensics', // Could be calculated from level types
    };
  }, []);

  const calculateStreak = (scores: DbScore[]) => {
    // Simplified streak calculation - count unique days with completions
    const uniqueDays = new Set(
      scores.map(s => new Date(s.completed_at).toDateString())
    );
    return uniqueDays.size;
  };

  const getTitleFromScore = (score: number) => {
    if (score >= 5000) return 'Master Detective';
    if (score >= 2500) return 'Senior Investigator';
    if (score >= 1000) return 'Field Agent';
    if (score >= 500) return 'Junior Detective';
    return 'Rookie Agent';
  };

  const calculateAchievements = (stats: UserProgress) => {
    const achievements = [];
    
    if (stats.investigationsCompleted > 0) {
      achievements.push({ 
        id: 'first-case', 
        title: 'First Case', 
        description: 'Complete your first investigation', 
        icon: '🔍', 
        unlocked: true 
      });
    }
    
    if (stats.fastestTime > 0 && stats.fastestTime < 300) { // 5 minutes
      achievements.push({ 
        id: 'speed-demon', 
        title: 'Speed Demon', 
        description: 'Complete a level in under 5 minutes', 
        icon: '⚡', 
        unlocked: true 
      });
    }
    
    if (stats.perfectRuns > 0) {
      achievements.push({ 
        id: 'perfect-score', 
        title: 'Perfect Score', 
        description: 'Complete a level with maximum points', 
        icon: '💯', 
        unlocked: true 
      });
    }
    
    if (stats.streak >= 5) {
      achievements.push({ 
        id: 'streak-master', 
        title: 'Streak Master', 
        description: 'Maintain a 5-day investigation streak', 
        icon: '🔥', 
        unlocked: true 
      });
    }
    
    if (stats.investigationsCompleted >= 5) {
      achievements.push({ 
        id: 'master-detective', 
        title: 'Master Detective', 
        description: 'Complete 5 levels', 
        icon: '🕵️', 
        unlocked: true 
      });
    }

    return achievements;
  };

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch user scores and leaderboard data in parallel
      const [scores, leaderboardRaw] = await Promise.all([
        SupabaseAPI.getUserScores(user.id),
        SupabaseAPI.getGlobalLeaderboard(20)
      ]);
      
      // Map leaderboard data to match our interface
      const leaderboard: LeaderboardEntry[] = leaderboardRaw.map(entry => ({
        username: entry.username,
        totalScore: entry.total_score,
        levelsCompleted: entry.levels_completed,
        rank: entry.rank
      }));
      
      setLeaderboardData(leaderboard);
      
      // Calculate user stats from scores
      const stats = calculateUserStats(scores, user);
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, calculateUserStats]);

  // Update time every second for that authentic feel
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);  }, []);

  // Enable/disable sounds
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled, soundManager]);
  
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, loadUserData]);

  const refreshData = () => {
    if (user?.id) {
      soundManager.playLoadingSequence();
      loadUserData();
    }
  };
  
  // Use real user stats or fallback to mock data
  const userProgress: UserProgress = userStats || {
    completedLevels: user?.completedLevels || [],
    totalScore: user?.totalScore || 0,
    achievements: ['first-case'],
    lastLogin: new Date().toISOString(),
    level: 1,
    xp: user?.totalScore || 0,
    xpToNext: 100 - ((user?.totalScore || 0) % 100),
    activeTitle: getTitleFromScore(user?.totalScore || 0),
    investigationsCompleted: 0,
    streak: 0,
    fastestTime: 0,
    perfectRuns: 0,    favoriteCategory: "Digital Forensics"
  };

  const levels = [levelManager.getLevel()]; // Single level for now

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🕵️</div>
          <h2 className="text-2xl font-bold text-terminal-primary mb-4">Access Restricted</h2>
          <p className="text-gray-400 mb-6">Please authenticate to access the Agent Command Center</p>
          <div className="text-terminal-accent">
            Use the terminal to login: <span className="text-terminal-primary font-mono">login your_username</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Top Navigation Bar */}
      <motion.nav         className="bg-black/80 backdrop-blur-sm border-b border-terminal-primary/30 p-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <motion.h1 
              className="text-3xl font-bold text-terminal-primary font-mono"
              whileHover={{ textShadow: '0 0 20px #00ff00' }}
            >
              DEZECTIVE HQ
            </motion.h1>
            <div className="text-terminal-secondary">
              Agent: <span className="text-terminal-accent">{user?.username || 'Unknown'}</span>
            </div>          </div>
          
          <div className="flex items-center space-x-8 text-sm font-mono">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-terminal-primary/20 hover:bg-terminal-primary/30 border border-terminal-primary/50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className={`text-terminal-primary ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? '⚡' : '🔄'}
              </span>
              <span className="text-terminal-primary text-xs">
                {isLoading ? 'LOADING' : 'REFRESH'}
              </span>
            </button>
                        <button
              onClick={() => {
                soundManager.playClickSound();
                setSoundEnabled(!soundEnabled);
              }}
              className="flex items-center space-x-2 bg-terminal-primary/20 hover:bg-terminal-primary/30 border border-terminal-primary/50 px-3 py-1 rounded-lg transition-colors"
            >
              <span className="text-terminal-primary">
                {soundEnabled ? '🔊' : '🔇'}
              </span>
              <span className="text-terminal-primary text-xs">
                {soundEnabled ? 'SOUND ON' : 'SOUND OFF'}
              </span>
            </button>
            
            <div>
              <span className="text-terminal-muted">LOCAL TIME:</span>
              <span className="text-terminal-primary ml-2">
                {currentTime.toLocaleTimeString()}
              </span>            </div>
            <div>
              <span className="text-terminal-muted">THREAT LEVEL:</span>
              <span className="text-red-500 ml-2 animate-pulse">CRITICAL</span>
            </div>
            <div>
              <span className="text-terminal-muted">STATUS:</span>
              <span className={`ml-2 ${user?.id ? 'text-green-500' : 'text-yellow-500'}`}>
                {user?.id ? 'AUTHENTICATED' : 'GUEST MODE'}
              </span>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          
          {/* Left Sidebar - Navigation */}
          <motion.div 
            className="col-span-3 space-y-4"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* User Profile Card */}
            <div className="bg-black/60 border border-terminal-primary/50 rounded-lg p-6 backdrop-blur-sm">              <div className="text-center mb-4">
                <motion.div 
                  className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-terminal-primary to-terminal-accent rounded-full flex items-center justify-center text-2xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </motion.div>
                <h3 className="text-xl font-bold text-terminal-primary">{user?.username}</h3>
                <p className="text-terminal-accent text-sm">{userProgress.activeTitle}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level {userProgress.level}</span>
                    <span>{userProgress.xp} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-terminal-primary to-terminal-accent h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(userProgress.xp / (userProgress.xp + userProgress.xpToNext)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <div className="text-terminal-primary font-bold">{userProgress.investigationsCompleted}</div>
                    {/* HACK: Quick solution */}
                    <div className="text-gray-400">Cases</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <div className="text-terminal-accent font-bold">{userProgress.streak}</div>
                    <div className="text-gray-400">Streak</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-black/60 border border-terminal-primary/50 rounded-lg backdrop-blur-sm">
              {[
                { id: 'missions', label: 'Active Missions', icon: 'MISSION' },
                { id: 'profile', label: 'Agent Profile', icon: 'PROFILE' },
                { id: 'leaderboard', label: 'Global Ranks', icon: 'RANK' },
                { id: 'achievements', label: 'Achievements', icon: 'BADGE' }
              ].map((item) => (
                <motion.button
                  key={item.id}                  className={`w-full p-4 text-left flex items-center space-x-3 transition-all duration-200 ${
                    activePanel === item.id 
                      ? 'bg-terminal-primary/20 border-r-2 border-terminal-primary text-terminal-primary' 
                      : 'hover:bg-gray-800/50 text-gray-300'
                  }`}
                  onClick={() => {
                    soundManager.playClickSound();
                    setActivePanel(item.id as 'missions' | 'profile' | 'leaderboard' | 'achievements');
                  }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-mono">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content Area */}          <motion.div 
            className="col-span-6 bg-black/60 border border-terminal-primary/50 rounded-lg backdrop-blur-sm overflow-hidden"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {activePanel === 'missions' && (
                <motion.div
                  key="missions"
                  className="p-6 h-full overflow-y-auto"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-terminal-primary mb-6 font-mono">                    🚨 URGENT INVESTIGATIONS
                  </h2>
                  
                  <div className="space-y-4">
                    {levels.map((level) => (
                      <motion.div
                        key={level.id}                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                          selectedLevel === level.id
                            ? 'border-terminal-primary bg-terminal-primary/10 shadow-[0_0_20px_rgba(0,255,0,0.3)]'
                            : 'border-gray-600 hover:border-terminal-accent hover:bg-gray-800/30'
                        }`}
                        onClick={() => setSelectedLevel(level.id)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{level.title}</h3>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="px-2 py-1 bg-blue-600 rounded text-white">
                                {level.category}
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                level.difficulty === 'Beginner' ? 'bg-green-600' :
                                level.difficulty === 'Intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                              }`}>
                                {level.difficulty}
                              </span>
                              <span className="text-gray-400">{level.estimatedTime}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-terminal-accent font-bold text-lg">
                              {level.trendingScore}% HOT
                            </div>
                            <div className="text-xs text-gray-400">Trending</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{level.description}</p>                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-terminal-primary">
                            Rewards: +{level.rewards?.xp || 0} XP, {level.rewards?.badges?.length || 0} badges
                          </div>
                          {selectedLevel === level.id && (
                            <motion.button
                              className="px-6 py-2 bg-terminal-primary text-black font-bold rounded hover:bg-terminal-accent transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundManager.playLevelStartSound();
                                soundManager.playLoadingSequence();
                                onStartInvestigation(level.id);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              START MISSION
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activePanel === 'profile' && (
                <motion.div
                  key="profile"
                  className="p-6 h-full overflow-y-auto"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-terminal-primary mb-6 font-mono">
                    🕵️ AGENT PROFILE
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Agent Details */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-terminal-accent font-bold mb-3">Agent Details</h3>
                          <div className="space-y-2 text-sm">                            <div className="flex justify-between">
                              <span className="text-gray-400">Codename:</span>
                              <span className="text-white">{user?.username}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Rank:</span>
                              <span className="text-terminal-primary">{userProgress.activeTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Level:</span>
                              <span className="text-terminal-accent">{userProgress.level}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total XP:</span>                              <span className="text-yellow-400">{userProgress.xp}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-terminal-accent font-bold mb-3">Investigation Stats</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Cases Solved:</span>
                              <span className="text-green-400">{userProgress.investigationsCompleted}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Current Streak:</span>
                              <span className="text-orange-400">{userProgress.streak}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Perfect Runs:</span>
                              <span className="text-blue-400">{userProgress.perfectRuns}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Best Time:</span>
                              <span className="text-purple-400">{Math.floor(userProgress.fastestTime / 60)}m {userProgress.fastestTime % 60}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-terminal-accent font-bold mb-3">Specialization</h3>
                          <div className="text-center">
                            <div className="text-3xl mb-2">🔬</div>
                            <div className="text-lg font-bold text-terminal-primary">{userProgress.favoriteCategory}</div>
                            <div className="text-sm text-gray-400">Primary Focus</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-terminal-accent font-bold mb-3">Recent Activity</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              <span className="text-gray-300">Completed Level 1</span>
                              <span className="text-gray-500">2h ago</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              <span className="text-gray-300">Earned Achievement</span>
                              <span className="text-gray-500">1d ago</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                              <span className="text-gray-300">Reached Level 12</span>
                              <span className="text-gray-500">3d ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Chart */}
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="text-terminal-accent font-bold mb-3">Skill Development</h3>
                      <div className="space-y-3">
                        {[
                          { skill: 'Digital Forensics', level: 85 },
                          { skill: 'Network Security', level: 70 },
                          { skill: 'Social Engineering', level: 60 },
                          { skill: 'Cryptography', level: 45 }
                        ].map((skill) => (
                          <div key={skill.skill}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{skill.skill}</span>
                              <span className="text-terminal-accent">{skill.level}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div 
                                className="bg-gradient-to-r from-terminal-primary to-terminal-accent h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activePanel === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  className="p-6 h-full overflow-y-auto"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-terminal-primary mb-6 font-mono">
                    🏆 GLOBAL RANKINGS
                  </h2>
                  
                  <div className="space-y-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin text-4xl mb-4">⚡</div>
                        <div className="text-terminal-accent">Loading rankings...</div>
                      </div>
                    ) : (
                      <>
                        {/* Top 3 Podium */}
                        {leaderboardData.length >= 3 && (
                          <div className="bg-gray-800/50 p-6 rounded-lg">
                            <h3 className="text-terminal-accent font-bold mb-4">Elite Agents</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="order-2">
                                <div className="text-4xl mb-2">🥈</div>                                <div className="font-bold text-gray-300">{leaderboardData[1]?.username}</div>
                                <div className="text-terminal-accent">{leaderboardData[1]?.totalScore} XP</div>
                              </div>
                              <div className="order-1 transform scale-110">
                                <div className="text-5xl mb-2">🏆</div>
                                <div className="font-bold text-yellow-400">{leaderboardData[0]?.username}</div>
                                <div className="text-terminal-primary">{leaderboardData[0]?.totalScore} XP</div>
                              </div>
                              <div className="order-3">
                                <div className="text-4xl mb-2">🥉</div>
                                <div className="font-bold text-gray-300">{leaderboardData[2]?.username}</div>
                                <div className="text-terminal-accent">{leaderboardData[2]?.totalScore} XP</div>
                              </div>
                            </div>                          </div>
                        )}
                        
                        {/* Full Leaderboard */}
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-terminal-accent font-bold mb-4">Top Investigators</h3>
                          <div className="space-y-2">
                            {leaderboardData.map((player, index) => {
                              const isCurrentUser = player.username === user?.username;
                              const badges = ['🏆', '🥈', '🥉', '🔥', '⚡', '🎯', '🔍', '💀'];
                              
                              return (
                                <motion.div
                                  key={player.username}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    isCurrentUser ? 'bg-terminal-primary/20 border border-terminal-primary' : 'bg-gray-700/50'
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <div className="flex items-center space-x-3">                                    <span className="text-lg font-bold text-terminal-accent w-8">#{player.rank}</span>
                                    <span className="text-xl">{badges[index] || '🔍'}</span>
                                    <span className={`font-bold ${isCurrentUser ? 'text-terminal-primary' : 'text-white'}`}>
                                      {player.username}
                                    </span>                                    <span className="text-xs text-gray-400">
                                      ({player.levelsCompleted} levels)
                                    </span>
                                  </div>
                                  <span className="text-terminal-accent font-bold">{player.totalScore} XP</span>
                                </motion.div>                              );
                            })}
                          </div>
                          
                          {leaderboardData.length === 0 && !isLoading && (
                            <div className="text-center py-8 text-gray-400">
                              <div className="text-4xl mb-2">🔍</div>
                              <div>No rankings yet. Be the first!</div>
                            </div>                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
              
              {activePanel === 'achievements' && (
                <motion.div
                  key="achievements"
                  className="p-6 h-full overflow-y-auto"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-terminal-primary mb-6 font-mono">
                    🏅 ACHIEVEMENT VAULT
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {calculateAchievements(userProgress).concat([
                      { id: 'code-breaker', title: 'Code Breaker', description: 'Crack 10 encrypted files', icon: '🔓', unlocked: false },
                      { id: 'network-ninja', title: 'Network Ninja', description: 'Complete 5 network investigations', icon: '🌐', unlocked: false },
                      { id: 'time-master', title: 'Time Master', description: 'Complete 3 levels under time limit', icon: '⏰', unlocked: userProgress.investigationsCompleted >= 3 },
                      { id: 'evidence-collector', title: 'Evidence Collector', description: 'Find all hidden clues in a level', icon: '🔎', unlocked: false },
                      { id: 'cyber-legend', title: 'Cyber Legend', description: 'Reach level 50', icon: '👑', unlocked: userProgress.level >= 50 }
                    ]).map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(255,255,0,0.2)]'
                            : 'bg-gray-800/30 border-gray-600/50 grayscale'
                        }`}
                        whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center">
                          <div className={`text-4xl mb-2 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <h3 className={`font-bold mb-1 ${
                            achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${
                            achievement.unlocked ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {achievement.description}
                          </p>
                          {achievement.unlocked && (
                            <motion.div
                              className="mt-2 text-xs text-yellow-500 font-bold"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              UNLOCKED
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Sidebar - Live Feed */}          <motion.div 
            className="col-span-3 space-y-4"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Live Threat Feed */}
            <div className="bg-black/60 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-red-500 font-bold mb-3 font-mono"> LIVE THREATS</h3>              <div className="space-y-2 text-xs">
                <motion.div 
                  className="text-red-400 animate-pulse"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  • GTA VI leak spreading - 2.3M views
                </motion.div>
                <div className="text-yellow-400">                  • Bot network detected - 15K tickets
                </div>
                <div className="text-orange-400">
                  • TikTok algorithm anomaly detected
                </div>
                <div className="text-gray-400">
                  • Crypto exchange under attack
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {/* DEBUG: Remove before production */}
            <div className="bg-black/60 border border-terminal-primary/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-terminal-primary font-bold mb-3 font-mono">QUICK STATS</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Fastest Time:</span>
                  <span className="text-green-400">{Math.floor(userProgress.fastestTime / 60)}m {userProgress.fastestTime % 60}s</span>                </div>
                <div className="flex justify-between">                  <span>Perfect Runs:</span>
                  <span className="text-blue-400">{userProgress.perfectRuns}</span>
                </div>
                <div className="flex justify-between">
                  <span>Favorite:</span>
                  <span className="text-purple-400">{userProgress.favoriteCategory}</span>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-black/60 border border-yellow-500/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-yellow-500 font-bold mb-3 font-mono">RECENT ACHIEVEMENTS</h3>
              <div className="space-y-2">
                {userProgress.achievements.slice(0, 3).map((achievementId) => {
                  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);                  return achievement ? (
                    <motion.div 
                      key={achievement.id}
                      className="flex items-center space-x-2 text-xs p-2 bg-gray-800/50 rounded"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                      <div>
                        <div className="text-yellow-400 font-bold">{achievement.title}</div>
                        <div className="text-gray-400">{achievement.description}</div>
                      </div>
                    </motion.div>
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
