'use client';

import React from 'react';
import { useGameStore } from '../../lib/game-store';
import { levelManager } from '../../lib/level-manager';
import { Terminal } from './Terminal';

interface GameEngineProps {
  className?: string;
}

export function GameEngine({ className = '' }: GameEngineProps) {
  const {
    currentLevel,
    currentLevelData,
    terminalLines,
    isPlaying,
    endLevel,
    addTerminalLine,
    clearTerminal,
    addWrongCommand
  } = useGameStore();

  const handleCommand = (command: string) => {
    if (!currentLevel || !currentLevelData || !isPlaying) {
      addTerminalLine({
        type: 'error',
        content: 'No active investigation. Use "start" to begin.'
      });
      return;
    }

    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add the input to terminal
    addTerminalLine({
      type: 'input',
      content: `hacker@server:${levelManager.getCurrentWorkingDirectory()}$ ${command}`
    });

    // Handle special commands
    if (cmd === 'quit') {
      addTerminalLine({
        type: 'info',
        content: 'Investigation terminated.'
      });
      endLevel(false);
      return;
    }

    if (cmd === 'clear') {
      clearTerminal();
      return;
    }

    // Check if command is available
    if (!currentLevelData.environment.availableCommands.includes(cmd)) {
      addTerminalLine({
        type: 'error',
        content: `Command not found: ${cmd}\nType 'help' for available commands.`
      });
      addWrongCommand();
      return;
    }

    try {
      // Execute the command
      const output = levelManager.executeCommand(cmd, args);
      
      if (output) {
        addTerminalLine({
          type: 'output',
          content: output
        });
      }

      // Check if level is complete
      if (levelManager.isLevelComplete()) {
        setTimeout(() => {
          addTerminalLine({
            type: 'info',
            content: '\nMission Accomplished!'
          });
          addTerminalLine({
            type: 'info',
            content: 'You have successfully identified and secured the GTA VI leak source!'
          });
          endLevel(true);
        }, 1000);
      }

    } catch (err) {
      console.error('Command execution error:', err);
      addTerminalLine({
        type: 'error',
        content: 'An error occurred while executing the command.'
      });
      addWrongCommand();
    }
  };

  if (!isPlaying || !currentLevelData) {
    return null;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 min-h-0">
        <Terminal 
          lines={terminalLines} 
          onCommand={handleCommand}
          levelManager={levelManager}
        />
      </div>
    </div>
  );
}
