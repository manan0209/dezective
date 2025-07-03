'use client';

import { useState, useEffect } from 'react';
import { Terminal } from '@/components/game/Terminal';
import { GameEngine } from '@/components/game/GameEngine';
import { AuthPanel } from '@/components/game/AuthPanel';
import { Leaderboard } from '@/components/game/Leaderboard';
import { useGameStore } from '@/lib/game-store';
import { levelManager } from '@/lib/level-manager';

export default function Home() {
  const { 
    terminalLines, 
    addTerminalLine, 
    clearTerminal,
    user, 
    createUser,
    loginUser,
    loadProgress,
    checkConnection,
    currentLevelData,
    isPlaying,
    startLevel
  } = useGameStore();
  
  const [isLoading, setIsLoading] = useState(false);

  // Load saved progress and check connection on mount
  useEffect(() => {
    loadProgress();
    checkConnection();
  }, [loadProgress, checkConnection]);

  const handleCommand = async (command: string) => {
    // Add the input command to terminal
    addTerminalLine({
      type: 'input',
      content: `$ ${command}`,
    });

    setIsLoading(true);

    // Basic command handling for demo
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing

    const args = command.toLowerCase().split(' ');
    const cmd = args[0];

    switch (cmd) {
      case 'help':
        addTerminalLine({
          type: 'output',
          content: `DEZECTIVE v2.0 - Cybersecurity Investigation Terminal
=====================================

Authentication:
  register <username>  - Create a new agent profile
  login <username>     - Login with existing agent
  whoami              - Display current user info

Game Commands:
  help                - Show this help message
  clear               - Clear the terminal
  levels              - List available investigations
  start <level>       - Start a specific investigation
  quit                - Exit current investigation

Investigation commands (available during levels):
  ls, cat, grep, find, head, tail, pwd, cd, history
  
Type 'levels' to see available investigations.
Type 'register <username>' to create a new agent profile.`,
        });
        break;

      case 'whoami':
        if (user) {
          addTerminalLine({
            type: 'output',
            content: `User Information:
──────────────────
Username: ${user.username}
Total Score: ${user.totalScore}
Levels Completed: ${user.levelsCompleted}
Member Since: ${new Date(user.createdAt).toLocaleDateString()}`,
          });
        } else {
          addTerminalLine({
            type: 'warning',
            content: 'No user logged in. Use "login [username]" to set your identity.',
          });
        }
        break;

      case 'login':
        const username = args[1];
        if (!username) {
          addTerminalLine({
            type: 'error',
            content: 'Usage: login <username>\\nExample: login CyberAgent001',
          });
          break;
        }

        addTerminalLine({
          type: 'info',
          content: 'Authenticating with database...',
        });

        const loginSuccess = await loginUser(username);
        if (!loginSuccess) {
          addTerminalLine({
            type: 'error',
            content: `Agent "${username}" not found. Use "register <username>" to create a new agent.`,
          });
        }
        break;

      case 'register':
        const newUsername = args[1];
        if (!newUsername) {
          addTerminalLine({
            type: 'error',
            content: 'Usage: register <username>\\nExample: register CyberAgent001',
          });
          break;
        }

        addTerminalLine({
          type: 'info',
          content: 'Creating new agent profile...',
        });

        const registerSuccess = await createUser(newUsername);
        if (!registerSuccess) {
          addTerminalLine({
            type: 'error',
            content: `Failed to create agent "${newUsername}". Username may already be taken.`,
          });
        }
        break;

      case 'clear':
        clearTerminal();
        break;

      case 'levels':
        const availableLevels = levelManager.getLevelList();
        const levelList = availableLevels.map((level, index) => 
          `  ${(index + 1).toString().padStart(2, '0')}. ${level.id.padEnd(15)} - ${level.title} [${level.difficulty}]`
        ).join('\n');
        
        addTerminalLine({
          type: 'output',
          content: `Available Investigations:
========================
${levelList}

Usage: start <level-id>
Example: start level-1`,
        });
        break;

      case 'start':
        if (!args[1]) {
          addTerminalLine({
            type: 'error',
            content: 'Usage: start <level-id>\\nUse "levels" to see available investigations.',
          });
          break;
        }

        const levelId = args[1];
        const level = levelManager.getLevel(levelId);
        
        if (!level) {
          addTerminalLine({
            type: 'error',
            content: `Level "${levelId}" not found. Use "levels" to see available investigations.`,
          });
          break;
        }

        if (!user) {
          addTerminalLine({
            type: 'warning',
            content: 'Please login first using "login [username]" before starting an investigation.',
          });
          break;
        }

        // Initialize the level
        if (levelManager.initializeLevel(levelId)) {
          startLevel(level);
          addTerminalLine({
            type: 'info',
            content: `Investigation Started: ${level.title}
${level.scenario.briefing}

Objective: ${level.scenario.objective}
Time Limit: ${Math.floor(level.scenario.timeLimit / 60)} minutes
Max Hints: ${level.scenario.maxHints}

Type 'help' for available commands.`,
          });
        } else {
          addTerminalLine({
            type: 'error',
            content: 'Failed to initialize investigation. Please try again.',
          });
        }
        break;

      case 'quit':
        if (isPlaying) {
          addTerminalLine({
            type: 'warning',
            content: 'Use "quit" within the investigation terminal to exit.',
          });
        } else {
          addTerminalLine({
            type: 'info',
            content: 'No active investigation to quit.',
          });
        }
        break;

      default:
        addTerminalLine({
          type: 'error',
          content: `Command not found: ${cmd}
Type 'help' for available commands.`,
        });
        break;
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-terminal-bg">
      {/* Header */}
      <header className="border-b border-terminal-border p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-terminal-primary font-mono">
            DEZECTIVE
          </h1>
          <p className="text-terminal-secondary text-sm mt-1">
            Cybersecurity Investigation Platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {isPlaying && currentLevelData ? (
          // Show game engine when level is active
          <GameEngine className="h-full" />
        ) : (
          // Show main terminal interface
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Terminal */}
            <div className="lg:col-span-2">
              <Terminal
                lines={terminalLines}
                onCommand={handleCommand}
                isLoading={isLoading}
              />
            </div>

            {/* Side panels */}
            <div className="space-y-6">
              {/* Authentication Panel */}
              <AuthPanel />

              {/* Leaderboard */}
              <Leaderboard />

              {/* System Status */}
              <div className="bg-terminal-bg border border-terminal-border rounded-lg p-4">
                <h2 className="text-terminal-primary font-mono text-lg mb-3">System Status</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-terminal-secondary">Status:</span>
                    <span className="text-terminal-success">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-secondary">Levels:</span>
                    <span className="text-terminal-accent">{levelManager.getAllLevels().length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-secondary">Mode:</span>
                    <span className="text-terminal-accent">
                      {isPlaying ? 'INVESTIGATION' : 'STANDBY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-terminal-border p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-terminal-muted text-sm">
          <p>Dezective - A Hack Club Summer of Making Project</p>
          <p className="mt-1">Built with Next.js, TypeScript, and TailwindCSS</p>
        </div>
      </footer>
    </div>
  );
}
