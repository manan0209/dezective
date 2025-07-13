'use client';

import { AuthPanel } from '@/components/game/AuthPanel';
import { GameEngine } from '@/components/game/GameEngine';
import { Leaderboard } from '@/components/game/Leaderboard';
import { Terminal } from '@/components/game/Terminal';
import { useGameStore } from '@/lib/game-store';
import { levelManager } from '@/lib/level-manager';
import { useEffect, useState } from 'react';

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
          content: `DEZECTIVE - A HACKER CLUB 
=====================================

Authentication:
  register <username>  - Create a new hacker profile
  login <username>     - Login with existing profile
  whoami              - Display current user info

Commands:
  help                - Show this help message
  clear               - Clear the terminal
  start               - Start the investigation
  quit                - Exit current investigation

Investigation Commands (available during investigation):
  ls [directory]      - List files and directories (explore the system)
  cat <file>          - Read file contents (examine evidence)
  cd <directory>      - Change directory (navigate the file system)
  pwd                 - Show current directory path
  whoami             - Display current user identity
  netstat            - Show network connections (find open ports)
  iptables -L        - Display firewall rules (security analysis)

Pro Tips:
- Start by exploring your home directory with 'ls'
- Read the mission briefing with 'cat mission.txt'
- Check network activity to find security vulnerabilities
- Use firewall commands to secure compromised ports
  
Type 'register <username>' to create a new hacker profile.
Type 'start' to begin the GTA VI leak investigation.`,
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

      case 'start':
        if (!user) {
          addTerminalLine({
            type: 'warning',
            content: 'Please login first using "login [username]" before starting the investigation.',
          });
          break;
        }

        // Get the single level
        const level = levelManager.getLevel();
        
        // Initialize the level
        if (levelManager.initializeLevel()) {
          startLevel(level);
          addTerminalLine({
            type: 'info',
            content: `Investigation Started: ${level.title}`,
          });
          addTerminalLine({
            type: 'output',
            content: level.scenario.briefing,
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-terminal-primary font-mono">
              DEZECTIVE
            </h1>
            <p className="text-terminal-secondary text-sm mt-1">
              Cybersecurity Investigation Platform
            </p>
          </div>
          
          {/* System Status in Header */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-terminal-secondary">Status:</span>
              <span className="text-terminal-success">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-terminal-secondary">Level:</span>
              <span className="text-terminal-accent">
                {isPlaying && currentLevelData
                  ? `${currentLevelData.id.replace('level-', 'Level ')}: ${currentLevelData.title}`
                  : `—`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-terminal-secondary">Mode:</span>
              <span className="text-terminal-accent">
                {isPlaying ? 'INVESTIGATION' : 'STANDBY'}
              </span>
            </div>
          </div>
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
                levelManager={null}
              />
            </div>

            {/* Side panels */}
            <div className="space-y-6">
              {/* Authentication Panel */}
              <AuthPanel />

              {/* Leaderboard */}
              <Leaderboard />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-terminal-border p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-terminal-muted text-sm">
          <p>Dezective - A Hack Club Summer of Making Project</p>
          </div>
      </footer>
    </div>
  );
}
