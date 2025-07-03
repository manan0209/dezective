'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Clock, Target, RefreshCw } from 'lucide-react';
import { SupabaseAPI } from '@/lib/api';

interface LeaderboardEntry {
  username: string;
  total_score: number;
  levels_completed: number;
  rank: number;
}

interface Score {
  id: string;
  level_id: string;
  score: number;
  completion_time: number;
  hints_used: number;
  wrong_commands: number;
  completed_at: string;
  users?: {
    username: string;
  };
}

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className = '' }: LeaderboardProps) {
  const [globalLeaderboard, setGlobalLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [levelLeaderboards, setLevelLeaderboards] = React.useState<Record<string, Score[]>>({});
  const [activeTab, setActiveTab] = React.useState<'global' | string>('global');
  const [loading, setLoading] = React.useState(true);
  const [showFullLeaderboard, setShowFullLeaderboard] = React.useState(false);

  const levels = [
    { id: 'level-1', name: 'L1' },
    { id: 'level-2', name: 'L2' },
    { id: 'level-3', name: 'L3' },
    { id: 'level-4', name: 'L4' },
    { id: 'level-5', name: 'L5' },
  ];

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      // Load global leaderboard - get all entries
      const global = await SupabaseAPI.getGlobalLeaderboard(1000);
      setGlobalLeaderboard(global);

      // Load level-specific leaderboards - get all entries  
      const levelBoards: Record<string, Score[]> = {};
      for (const level of levels) {
        const scores = await SupabaseAPI.getLevelLeaderboard(level.id, 1000);
        levelBoards[level.id] = scores;
      }
      setLevelLeaderboards(levelBoards);
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadLeaderboards();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`bg-black/50 border border-green-500/30 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-green-400">Loading leaderboards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/50 border border-green-500/30 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-green-400">Leaderboard</h2>
        </div>
        <button
          onClick={loadLeaderboards}
          disabled={loading}
          className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Leaderboards"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-green-500/30 pb-4">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex-1 ${
            activeTab === 'global'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
          }`}
        >
          Global
        </button>
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setActiveTab(level.id)}
            className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === level.id
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
            }`}
          >
            {level.name}
          </button>
        ))}
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-400 pb-2 border-b border-green-500/20">
            <div className="text-center">Rank</div>
            <div>Username</div>
            <div className="text-right">Score</div>
            <div className="text-center">Lvls</div>
          </div>
          <div className={`space-y-2 ${showFullLeaderboard ? 'max-h-64 overflow-y-auto' : ''}`}>
            {(showFullLeaderboard ? globalLeaderboard : globalLeaderboard.slice(0, 3)).map((entry) => (
              <motion.div
                key={`${entry.username}-${entry.rank}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-2 items-center py-2 px-2 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors text-sm"
              >
                <div className="flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="text-green-300 font-medium truncate">{entry.username}</div>
                <div className="text-right text-green-400 font-bold text-xs">{entry.total_score.toLocaleString()}</div>
                <div className="text-center text-gray-400 text-xs">{entry.levels_completed}/5</div>
              </motion.div>
            ))}
          </div>
          
          {/* Show More/Less Button */}
          {globalLeaderboard.length > 3 && (
            <div className="pt-2">
              <button
                onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
                className="w-full py-2 px-4 text-sm text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors border border-green-500/30"
              >
                {showFullLeaderboard ? 'Show Top 3' : `Show All ${globalLeaderboard.length} Players`}
              </button>
            </div>
          )}
          
          {globalLeaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No scores yet. Be the first to complete a level!
            </div>
          )}
        </div>
      )}

      {/* Level-specific Leaderboards */}
      {activeTab !== 'global' && (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-400 pb-2 border-b border-green-500/20">
            <div className="text-center">Rank</div>
            <div className="col-span-2">Username</div>
            <div className="text-right">Score</div>
            <div className="text-center">H</div>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {levelLeaderboards[activeTab]?.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-5 gap-2 items-center py-2 px-2 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors text-sm"
              >
                <div className="flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="text-green-300 font-medium col-span-2 truncate">
                  {(score.users as { username: string } | undefined)?.username || 'Unknown'}
                </div>
                <div className="text-right text-green-400 font-bold text-xs">{score.score.toLocaleString()}</div>
                <div className="text-center text-orange-400 text-xs">
                  {score.hints_used}
                </div>
              </motion.div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No scores for this level yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
