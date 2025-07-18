'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EpicLandingPage } from '@/components/landing/EpicLandingPage';
import { DesktopDashboard } from '@/components/dashboard/DesktopDashboard';
import { EnhancedTerminal } from '@/components/terminal/EnhancedTerminal';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { MatrixRain, ParticleSystem } from '@/components/effects/VisualEffects';
import { SoundEffects, useSounds } from '@/lib/sound-manager';
import { useGameStore, useTerminalLines, useUser } from '@/lib/game-store';
import { levelManager } from '@/lib/level-manager';

type GameState = 'landing' | 'auth' | 'dashboard' | 'terminal' | 'mission';

interface GameOrchestratorProps {
  className?: string;
}

export function GameOrchestrator({ className }: GameOrchestratorProps) {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [showEffects, setShowEffects] = useState(true);
  const [currentMission, setCurrentMission] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  
  const terminalLines = useTerminalLines();
  const currentUser = useUser();
  const { 
    addTerminalLine,
    clearTerminal,
    checkConnection,
    loadProgress
  } = useGameStore();

  const sounds = useSounds();

  useEffect(() => {
    // Initialize game connection and load progress
    checkConnection();
    loadProgress();
    
    // Play ambient sounds
    const ambientInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        sounds.playKeypressSound();
      }
    }, 5000);

    return () => clearInterval(ambientInterval);
  }, [sounds, checkConnection, loadProgress]);

  const handleLandingComplete = () => {
    sounds.playSuccessSound();
    
    // Check if user is already logged in
    if (currentUser) {
      setGameState('dashboard');
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    sounds.playSuccessSound();
    setShowAuth(false);
    setGameState('dashboard');
  };

  const handleStartMission = (missionId: string) => {
    sounds.playHackSound();
    
    // Load the specific level
    if (levelManager.loadLevel(missionId)) {
      setCurrentMission(missionId);
      setGameState('terminal');
      
      // Clear terminal and add welcome message
      clearTerminal();
      
      const level = levelManager.getLevel();
      if (level) {
        addTerminalLine({
          type: 'info',
          content: `=== DEZECTIVE TERMINAL v3.0 ===`
        });
        
        addTerminalLine({
          type: 'info',
          content: `Mission: ${level.title}`
        });
        
        addTerminalLine({
          type: 'info',
          content: `Difficulty: ${level.difficulty} | Category: ${level.category}`
        });
        
        addTerminalLine({
          type: 'info',
          content: `Time Limit: ${Math.floor(level.scenario.timeLimit / 60)} minutes | Hints Available: ${level.scenario.maxHints}`
        });
        
        addTerminalLine({
          type: 'info',
          content: '─'.repeat(50)
        });
        
        addTerminalLine({
          type: 'info',
          content: '💡 TIP: Start by reading your mission briefing with: cat mission.txt'
        });
        
        addTerminalLine({
          type: 'info',
          content: '💡 TIP: Use "help" to see all available investigation commands'
        });
        
        addTerminalLine({
          type: 'info',
          content: '─'.repeat(50)
        });
      }
    }
  };

  const handleBackToDashboard = () => {
    sounds.playCommandSound();
    setGameState('dashboard');
    setCurrentMission(null);
  };

  const handleTerminalCommand = (command: string) => {
    sounds.playCommandSound();
    
    // Handle special UI commands first
    if (command === 'dashboard' || command === 'menu') {
      handleBackToDashboard();
      return;
    }

    if (command === 'clear') {
      clearTerminal();
      return;
    }

    // Add input line
    addTerminalLine({
      type: 'input',
      content: `detective@detective-workstation:${levelManager.getCurrentWorkingDirectory()}$ ${command}`
    });

    try {
      // Parse command and arguments
      const parts = command.trim().split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      // Execute command through level manager
      const output = levelManager.executeCommand(cmd, args);
      
      if (output) {
        // Determine output type based on content
        let outputType: 'output' | 'error' | 'warning' | 'info' = 'output';
        
        if (output.includes('not found') || output.includes('No such file') || output.includes('permission denied')) {
          outputType = 'error';
        } else if (output.includes('WARNING') || output.includes('ALERT')) {
          outputType = 'warning';
        } else if (output.includes('INFO') || output.includes('HINT')) {
          outputType = 'info';
        }

        addTerminalLine({
          type: outputType,
          content: output
        });

        // Check for mission completion
        if (levelManager.isLevelComplete()) {
          setTimeout(() => {
            addTerminalLine({
              type: 'info',
              content: '🎉 MISSION COMPLETE! 🎉'
            });
            
            addTerminalLine({
              type: 'info',
              content: 'Type "dashboard" to return to the main menu and claim your rewards.'
            });
            
            sounds.playSuccessSound();
          }, 500);
        }

        // Show investigation progress hints
        const progress = levelManager.getInvestigationProgress();
        if (progress.nextHint && Math.random() < 0.3) { // 30% chance to show hint
          setTimeout(() => {
            addTerminalLine({
              type: 'info',
              content: `💡 HINT: ${progress.nextHint}`
            });
          }, 1000);
        }

      }
    } catch (error) {
      addTerminalLine({
        type: 'error',
        content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  return (
    <SoundEffects>
      <div className={`relative h-screen overflow-hidden bg-black ${className}`}>
        {/* Background Effects */}
        {showEffects && (
          <div className="absolute inset-0 z-0">
            <MatrixRain />
            <ParticleSystem />
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 h-full">
          <AnimatePresence mode="wait">
            {gameState === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                <EpicLandingPage onEnter={handleLandingComplete} />
              </motion.div>
            )}

            {gameState === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="h-full"
              >
                <DesktopDashboard onStartInvestigation={handleStartMission} />
              </motion.div>
            )}

            {gameState === 'terminal' && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.4 }}
                className="h-full p-6"
              >
                <div className="h-full flex flex-col">
                  {/* Terminal Header */}
                  <motion.div 
                    className="mb-4 flex justify-between items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-4">
                      <h1 className="text-2xl font-bold text-terminal-primary font-mono">
                        ACTIVE MISSION: {currentMission?.toUpperCase()}
                      </h1>                    <motion.div
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 text-sm"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      LIVE
                    </motion.div>
                    </div>
                    
                    <motion.button
                      onClick={handleBackToDashboard}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-terminal-primary rounded border border-terminal-primary/30 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ← Back to Dashboard
                    </motion.button>
                  </motion.div>

                  {/* Enhanced Terminal */}
                  <div className="flex-1">
                    <EnhancedTerminal
                      lines={terminalLines}
                      onCommand={handleTerminalCommand}
                      isLoading={false}
                      currentPath="/home/hacker/missions"
                      username={currentUser?.username || 'hacker'}
                      serverName="dezective-terminal"
                      levelManager={levelManager}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global UI Controls */}
        <motion.div 
          className="absolute top-4 right-4 z-50 flex space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={() => setShowEffects(!showEffects)}
            className="p-2 bg-gray-900/80 hover:bg-gray-800/80 text-terminal-primary rounded border border-terminal-primary/30 backdrop-blur-sm transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={showEffects ? 'Disable Effects' : 'Enable Effects'}
          >
            {showEffects ? 'FX' : 'OFF'}
          </motion.button>
          
          <motion.button
            onClick={() => sounds.setEnabled(!sounds.isEnabled())}
            className="p-2 bg-gray-900/80 hover:bg-gray-800/80 text-terminal-primary rounded border border-terminal-primary/30 backdrop-blur-sm transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={sounds.isEnabled() ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {sounds.isEnabled() ? 'SND' : 'MUTE'}
          </motion.button>
        </motion.div>

        {/* Achievement Notifications */}
        <div className="absolute bottom-4 right-4 z-50 space-y-2">
          {/* Achievement notifications would go here */}
        </div>

        {/* Performance Stats (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            className="absolute bottom-4 left-4 z-50 text-xs text-gray-500 font-mono bg-black/50 p-2 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <div>State: {gameState}</div>
            <div>Mission: {currentMission || 'None'}</div>
            <div>Effects: {showEffects ? 'On' : 'Off'}</div>
            <div>Sound: {sounds.isEnabled() ? 'On' : 'Off'}</div>
          </motion.div>
        )}

        {/* Authentication Panel */}
        {showAuth && (
          <AuthPanel
            onClose={() => setShowAuth(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </SoundEffects>
  );
}
