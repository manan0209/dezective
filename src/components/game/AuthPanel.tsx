'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, UserPlus, LogIn, Check, X, Loader2 } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { SupabaseAPI } from '@/lib/api';

interface AuthPanelProps {
  className?: string;
}

export function AuthPanel({ className = '' }: AuthPanelProps) {
  const { user, createUser, loginUser, setUser, isConnected } = useGameStore();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAvailability = async () => {
      if (mode === 'register' && username.length >= 3) {
        setCheckingUsername(true);
        const available = await SupabaseAPI.isUsernameAvailable(username);
        setUsernameAvailable(available);
        setCheckingUsername(false);
      } else {
        setUsernameAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      let success = false;
      if (mode === 'register') {
        success = await createUser(username.trim());
      } else {
        success = await loginUser(username.trim());
      }

      if (success) {
        setUsername('');
      } else {
        setError(mode === 'register' ? 'Failed to create user' : 'User not found');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setError('');
  };

  const isValidUsername = (name: string) => {
    return name.length >= 3 && name.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(name);
  };

  if (user) {
    return (
      <div className={`bg-black/50 border border-green-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-green-400" />
          <h2 className="text-base font-bold text-green-400">Agent Status</h2>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Username:</span>
            <span className="text-green-300 font-medium text-sm">{user.username}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Rank:</span>
            <span className="text-yellow-400 font-bold text-sm">#{user.rank || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Score:</span>
            <span className="text-green-400 font-bold text-sm">{user.totalScore.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Levels Completed:</span>
            <span className="text-green-400 font-bold text-sm">{user.levelsCompleted}/5</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Database:</span>
            <span className={`font-medium text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full mt-3 py-1.5 px-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/50 border border-green-500/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4 text-green-400" />
        <h2 className="text-base font-bold text-green-400">Agent Authentication</h2>
      </div>

      {!isConnected && (
        <div className="mb-3 p-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <div className="text-orange-400 text-xs">
            ⚠️ Database offline. Progress will be saved locally only.
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
            mode === 'login'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
          }`}
        >
          <LogIn className="w-3 h-3 inline mr-1" />
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
            mode === 'register'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
          }`}
        >
          <UserPlus className="w-3 h-3 inline mr-1" />
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="username" className="block text-xs font-medium text-gray-400 mb-1">
            Agent Codename
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your codename..."
              className="w-full px-3 py-1.5 bg-black/50 border border-green-500/30 rounded text-green-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 text-sm"
              disabled={loading}
              maxLength={20}
            />
            {mode === 'register' && username.length >= 3 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {checkingUsername ? (
                  <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                ) : usernameAvailable === true ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : usernameAvailable === false ? (
                  <X className="w-3 h-3 text-red-400" />
                ) : null}
              </div>
            )}
          </div>
          
          {mode === 'register' && username && (
            <div className="mt-1 text-xs">
              {!isValidUsername(username) ? (
                <span className="text-red-400">
                  Username must be 3-20 characters, letters, numbers, _ and - only
                </span>
              ) : usernameAvailable === false ? (
                <span className="text-red-400">Username already taken</span>
              ) : usernameAvailable === true ? (
                <span className="text-green-400">Username available!</span>
              ) : null}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            !username.trim() ||
            !isValidUsername(username) ||
            (mode === 'register' && usernameAvailable !== true)
          }
          className="w-full py-1.5 px-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              {mode === 'register' ? 'Creating Agent...' : 'Logging In...'}
            </>
          ) : (
            <>
              {mode === 'register' ? 'Create Agent' : 'Login'}
            </>
          )}
        </button>
      </form>

      <div className="mt-3 pt-2 border-t border-green-500/20">
        <div className="text-xs text-gray-500 text-center leading-tight">
          {mode === 'register' 
            ? 'Login with your existing agent codename to continue your investigation.'
            : 'Create a unique agent codename to track your progress and compete on leaderboards.' 
          }
        </div>
      </div>
    </div>
  );
}
