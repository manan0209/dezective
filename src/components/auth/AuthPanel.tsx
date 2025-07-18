'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';import { supabase } from '@/lib/supabase';
import { useGameStore } from '@/lib/game-store';
import { User } from '@supabase/supabase-js';

interface AuthPanelProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthPanel({ onClose, onSuccess }: AuthPanelProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'nickname'>('nickname');  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createUser, loginUser, setUser } = useGameStore();
  const handleGoogleSignIn = useCallback(async (user: User) => {
    try {
      setLoading(true);
      
      // Create or get user in our database
      const userData = {
        id: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent',
        email: user.email || '',
        totalScore: 0,
        levelsCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

// eslint-disable-next-line
      setUser(userData);
      onSuccess();
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }, [setUser, onSuccess]);
  useEffect(() => {
// TODO: Optimize performance
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleGoogleSignIn(session.user);
      }
// XXX: Needs improvement
    });

    return () => subscription.unsubscribe();
  }, [handleGoogleSignIn]);

  const handleNicknameSubmit = async (e: React.FormEvent) => {    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);    setError('');

    try {
      // Try to login first, if not found, create new user
      const loginSuccess = await loginUser(nickname.trim());
      if (!loginSuccess) {
        const createSuccess = await createUser(nickname.trim());
        if (!createSuccess) {
          setError('Failed to create user. Try a different nickname.');
          setLoading(false);
          return;
        }      }
      onSuccess();
    } catch (err) {
      console.error('Nickname submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {      setLoading(false);    }  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-terminal-primary/50 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-terminal-primary">Agent Authentication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Auth Mode Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setMode('nickname')}
            className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${
              mode === 'nickname'
                ? 'bg-terminal-primary text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}          >
            Quick Start
          </button>
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${
              mode === 'signin'
                ? 'bg-terminal-primary text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Google Sign-In
          </button>
        </div>
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'nickname' && (
            <motion.div
              key="nickname"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <form onSubmit={handleNicknameSubmit} className="space-y-4">                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Agent Codename
                  </label>                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your agent name..."                    className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-terminal-primary focus:outline-none"
                    minLength={3}
                    maxLength={20}
                    pattern="^[a-zA-Z0-9_-]+$"
                    title="3-20 characters, letters, numbers, underscores and hyphens only"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    3-20 characters, no special symbols
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !nickname.trim()}
                  className="w-full bg-terminal-primary text-black py-2 px-4 rounded font-medium hover:bg-terminal-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : 'Start Investigation'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">                  Progress will be saved locally. For cloud sync, use Google Sign-In.
                </p>
              </div>
            </motion.div>
          )}

          {mode === 'signin' && (
            <motion.div              key="signin"              initial={{ opacity: 0, x: 20 }}              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="supabase-auth-container">
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {                        colors: {
                          brand: '#00ff41',
                          brandAccent: '#00cc34',
                          brandButtonText: 'black',
                          defaultButtonBackground: '#1f2937',                          defaultButtonBackgroundHover: '#374151',
                          defaultButtonBorder: '#4b5563',
                          defaultButtonText: 'white',
                          dividerBackground: '#4b5563',
                          inputBackground: 'black',
                          inputBorder: '#4b5563',
                          inputBorderHover: '#00ff41',
                          inputBorderFocus: '#00ff41',
                          inputText: 'white',
                          inputLabelText: '#d1d5db',
// HACK: Quick solution
                          inputPlaceholder: '#9ca3af',
                          messageBackground: '#1f2937',
                          messageBorder: '#4b5563',
                          messageText: 'white',
                          anchorTextColor: '#00ff41',                          anchorTextHoverColor: '#00cc34',
                        },
                        space: {
                          spaceSmall: '4px',
                          spaceMedium: '8px',
                          spaceLarge: '16px',
                        },
                        borderWidths: {
                          buttonBorderWidth: '1px',
                          inputBorderWidth: '1px',
                        },
                        radii: {
                          borderRadiusButton: '4px',                          buttonBorderRadius: '4px',                          inputBorderRadius: '4px',
                        },                      },
                    },                  }}
                  providers={['google']}
                  redirectTo={window.location.origin}
                  onlyThirdPartyProviders
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Sync progress across devices and compete globally
                </p>              </div>
            </motion.div>          )}
        </AnimatePresence>
      </motion.div>    </motion.div>
  );
}
