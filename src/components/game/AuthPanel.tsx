'use client';

import { useGameStore } from '@/lib/game-store';
import { useState } from 'react';

export function AuthPanel() {
  const { user, createUser, loginUser } = useGameStore();
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await createUser(username.trim());
      } else {
        await loginUser(username.trim());
      }
    } finally {
      setIsLoading(false);
      setUsername('');
    }
  };

  if (user) {
    return (
      <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4">
        <h3 className="text-lg font-bold text-terminal-primary mb-3 font-mono">
          Agent Status
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-terminal-secondary">Agent:</span>
            <span className="text-terminal-accent font-mono">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-secondary">Score:</span>
            <span className="text-terminal-success">{user.totalScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-secondary">Cases:</span>
            <span className="text-terminal-accent">{user.levelsCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-secondary">Status:</span>
            <span className="text-terminal-success">ACTIVE</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-terminal-border">
          <div className="text-xs text-terminal-muted">
            Member since: {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4">
      <h3 className="text-lg font-bold text-terminal-primary mb-3 font-mono">
        Agent Authentication
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-terminal-secondary text-sm mb-2">
            Agent Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your agent ID"
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text font-mono text-sm focus:outline-none focus:ring-1 focus:ring-terminal-accent"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="flex-1 text-terminal-accent text-sm hover:text-terminal-primary transition-colors"
            disabled={isLoading}
          >
            {isRegistering ? 'Have an account?' : 'New agent?'}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!username.trim() || isLoading}
          className="w-full bg-terminal-accent text-terminal-bg px-4 py-2 rounded font-mono text-sm hover:bg-terminal-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : (isRegistering ? 'Register Agent' : 'Login')}
        </button>
      </form>
      
      <div className="mt-4 text-xs text-terminal-muted">
        <p>💡 New agents: Click &quot;New agent?&quot; then enter a username</p>
        <p>🔐 Returning agents: Enter your existing username</p>
      </div>
    </div>
  );
}
