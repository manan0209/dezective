'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Clock, Target } from 'lucide-react';
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

  const levels = [
    { id: 'level-1', name: 'Missing Email' },
    { id: 'level-2', name: 'Database Breach' },
    { id: 'level-3', name: 'Social Engineering' },
    { id: 'level-4', name: 'Network Intrusion' },
    { id: 'level-5', name: 'Advanced Persistent Threat' },
  ];

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      // Load global leaderboard
      const global = await SupabaseAPI.getGlobalLeaderboard(50);
      setGlobalLeaderboard(global);

      // Load level-specific leaderboards
      const levelBoards: Record<string, Score[]> = {};
      for (const level of levels) {
        const scores = await SupabaseAPI.getLevelLeaderboard(level.id, 10);
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
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-green-400">Leaderboard</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-green-500/30 pb-4">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 pb-2 border-b border-green-500/20">
            <div>Rank</div>
            <div>Username</div>
            <div className="text-right">Score</div>
            <div className="text-right">Levels</div>
          </div>
          {globalLeaderboard.map((entry) => (
            <motion.div
              key={`${entry.username}-${entry.rank}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 gap-4 items-center py-2 px-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getRankIcon(entry.rank)}
              </div>
              <div className="text-green-300 font-medium">{entry.username}</div>
              <div className="text-right text-green-400 font-bold">{entry.total_score.toLocaleString()}</div>
              <div className="text-right text-gray-400">{entry.levels_completed}/5</div>
            </motion.div>
          ))}
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
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-400 pb-2 border-b border-green-500/20">
            <div>Rank</div>
            <div>Username</div>
            <div className="text-right">Score</div>
            <div className="text-right">Time</div>
            <div className="text-right">Hints</div>
          </div>
          {levelLeaderboards[activeTab]?.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-5 gap-4 items-center py-2 px-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getRankIcon(index + 1)}
              </div>
              <div className="text-green-300 font-medium">
                {(score.users as { username: string } | undefined)?.username || 'Unknown'}
              </div>
              <div className="text-right text-green-400 font-bold">{score.score.toLocaleString()}</div>
              <div className="text-right text-gray-400 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(score.completion_time)}
              </div>
              <div className="text-right text-orange-400 flex items-center justify-end gap-1">
                <Target className="w-3 h-3" />
                {score.hints_used}
              </div>
            </motion.div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              No scores for this level yet.
            </div>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t border-green-500/20">
        <button
          onClick={loadLeaderboards}
          className="w-full py-2 px-4 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
        >
          Refresh Leaderboards
        </button>
      </div>
    </div>
  );
}
