'use client';

import React from 'react';
import { useGameStore } from '../../lib/game-store';
import { levelManager } from '../../lib/level-manager';
import { Terminal } from './Terminal';
import { CluePanel } from './CluePanel';
import { Clue } from '../../types';

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
    updateLevelState,
    addWrongCommand
  } = useGameStore();

  const [currentClues, setCurrentClues] = React.useState<Clue[]>([]);

  React.useEffect(() => {
    if (currentLevelData) {
      setCurrentClues([...currentLevelData.clues]);
    }
  }, [currentLevelData]);

  const handleCommand = (command: string) => {
    if (!currentLevel || !currentLevelData || !isPlaying) {
      addTerminalLine({
        type: 'error',
        content: 'No active level. Use "start <level-id>" to begin.'
      });
      return;
    }

    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add the input to terminal
    addTerminalLine({
      type: 'input',
      content: `$ ${command}`
    });

    // Special commands
    switch (cmd) {
      case 'help':
        handleHelpCommand();
        return;
      case 'clear':
        clearTerminal();
        return;
      case 'quit':
        handleQuitCommand();
        return;
      case 'submit':
        handleSubmitCommand(args.join(' '));
        return;
      case 'hint':
        handleHintCommand();
        return;
      case 'clues':
        handleCluesCommand();
        return;
      case 'progress':
        handleProgressCommand();
        return;
    }

    // Check if command is available in current level
    if (!currentLevelData.environment.availableCommands.includes(cmd)) {
      addTerminalLine({
        type: 'error',
        content: `Command not found: ${cmd}\nType 'help' for available commands.`
      });
      addWrongCommand();
      return;
    }

    // Execute the command through level manager
    try {
      const output = levelManager.executeCommand(cmd, args);
      addTerminalLine({
        type: 'output',
        content: output
      });

      // Check for clue reveals
      const revealedClueIds = levelManager.checkClueReveal(command, currentLevel);
      if (revealedClueIds.length > 0) {
        // Update clues state
        setCurrentClues(prev => 
          prev.map(clue => 
            revealedClueIds.includes(clue.id) 
              ? { ...clue, revealed: true }
              : clue
          )
        );

        // Notify about new clues
        revealedClueIds.forEach(clueId => {
          const clue = currentLevelData.clues.find(c => c.id === clueId);
          if (clue) {
            addTerminalLine({
              type: 'info',
              content: `🔍 New clue discovered: ${clue.title}`
            });
          }
        });
      }

      // Update progress
      const revealedCount = currentClues.filter(c => c.revealed).length + revealedClueIds.length;
      const progress = Math.round((revealedCount / currentLevelData.clues.length) * 100);
      updateLevelState({ progress });

    } catch (error) {
      addTerminalLine({
        type: 'error',
        content: `Error executing command: ${error}`
      });
      addWrongCommand();
    }
  };

  const handleHelpCommand = () => {
    if (!currentLevelData) return;

    const helpText = [
      'Available commands:',
      '',
      'System commands:',
      '  help     - Show this help message',
      '  clear    - Clear the terminal',
      '  quit     - Exit current level',
      '  clues    - Show discovered clues',
      '  progress - Show investigation progress',
      '  hint     - Get a hint (penalty applies)',
      '  submit <answer> - Submit your final answer',
      '',
      'Investigation commands:',
      ...currentLevelData.environment.availableCommands.map(cmd => `  ${cmd.padEnd(8)} - ${getCommandDescription(cmd)}`),
      '',
      `Objective: ${currentLevelData.scenario.objective}`,
    ].join('\n');

    addTerminalLine({
      type: 'info',
      content: helpText
    });
  };

  const handleQuitCommand = () => {
    addTerminalLine({
      type: 'warning',
      content: 'Ending current investigation...'
    });
    endLevel(false);
  };

  const handleSubmitCommand = (answer: string) => {
    if (!currentLevel || !answer.trim()) {
      addTerminalLine({
        type: 'error',
        content: 'Please provide an answer. Usage: submit <your answer>'
      });
      return;
    }

    const isCorrect = levelManager.checkSolution(answer, currentLevel);
    
    if (isCorrect) {
      addTerminalLine({
        type: 'info',
        content: '🎉 Correct! Investigation complete.'
      });
      
      // Calculate final score
      const completionTime = Date.now() - (useGameStore.getState().startTime || 0);
      const score = levelManager.calculateScore(
        currentLevel,
        completionTime / 1000,
        useGameStore.getState().hintsUsed,
        useGameStore.getState().wrongCommands
      );

      addTerminalLine({
        type: 'info',
        content: `Final Score: ${score} points`
      });

      endLevel(true);
    } else {
      addTerminalLine({
        type: 'error',
        content: '❌ Incorrect answer. Keep investigating...'
      });
      addWrongCommand();
    }
  };

  const handleHintCommand = () => {
    if (!currentLevelData) return;

    const unrevealedClues = currentClues.filter(clue => !clue.revealed);
    if (unrevealedClues.length === 0) {
      addTerminalLine({
        type: 'warning',
        content: 'No hints available. All clues have been discovered.'
      });
      return;
    }

    const randomClue = unrevealedClues[Math.floor(Math.random() * unrevealedClues.length)];
    addTerminalLine({
      type: 'warning',
      content: `💡 Hint: ${randomClue.hint}\n(Hint penalty applied to final score)`
    });
  };

  const handleCluesCommand = () => {
    const revealedClues = currentClues.filter(clue => clue.revealed);
    if (revealedClues.length === 0) {
      addTerminalLine({
        type: 'info',
        content: 'No clues discovered yet. Execute investigation commands to find evidence.'
      });
      return;
    }

    const cluesList = revealedClues.map(clue => `• ${clue.title}: ${clue.description}`).join('\n');
    addTerminalLine({
      type: 'info',
      content: `Discovered clues (${revealedClues.length}/${currentClues.length}):\n${cluesList}`
    });
  };

  const handleProgressCommand = () => {
    const revealedCount = currentClues.filter(c => c.revealed).length;
    const progress = Math.round((revealedCount / currentClues.length) * 100);
    
    addTerminalLine({
      type: 'info',
      content: [
        `Investigation Progress: ${progress}%`,
        `Clues Found: ${revealedCount}/${currentClues.length}`,
        `Time Elapsed: ${formatTime(Date.now() - (useGameStore.getState().startTime || 0))}`,
        `Hints Used: ${useGameStore.getState().hintsUsed}`,
        `Wrong Commands: ${useGameStore.getState().wrongCommands}`
      ].join('\n')
    });
  };

  const getCommandDescription = (cmd: string): string => {
    const descriptions: Record<string, string> = {
      'ls': 'List directory contents',
      'cat': 'Display file contents',
      'grep': 'Search text patterns in files',
      'find': 'Search for files and directories',
      'head': 'Display first lines of a file',
      'tail': 'Display last lines of a file',
      'less': 'View file contents page by page',
      'pwd': 'Print working directory',
      'cd': 'Change directory',
      'history': 'Show command history',
      'whoami': 'Show current user',
      'ps': 'Show running processes',
      'netstat': 'Show network connections',
      'last': 'Show last logins',
      'awk': 'Text processing tool',
      'sort': 'Sort lines of text',
      'uniq': 'Remove duplicate lines',
      'wc': 'Count lines, words, characters'
    };
    return descriptions[cmd] || 'System command';
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentLevelData) {
    return (
      <div className={`${className} p-4`}>
        <div className="text-center text-terminal-gray">
          <p className="font-mono">No level loaded</p>
          <p className="text-sm mt-2">Use the level selection to start investigating</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} grid grid-cols-1 lg:grid-cols-3 gap-4`}>
      {/* Terminal - Main interface */}
      <div className="lg:col-span-2">
        <Terminal
          lines={terminalLines}
          onCommand={handleCommand}
          isLoading={false}
        />
      </div>

      {/* Side panel with clues */}
      <div className="space-y-4">
        <CluePanel clues={currentClues} />
        
        {/* Level info */}
        <div className="bg-terminal-bg border border-terminal-green rounded-lg p-4">
          <h3 className="text-terminal-green font-mono text-lg mb-2">
            {currentLevelData.title}
          </h3>
          <p className="text-terminal-gray text-sm mb-3">
            {currentLevelData.description}
          </p>
          <div className="text-xs text-terminal-gray space-y-1">
            <div>Difficulty: <span className="text-terminal-yellow">{currentLevelData.difficulty}</span></div>
            <div>Time Limit: <span className="text-terminal-yellow">{Math.floor(currentLevelData.scenario.timeLimit / 60)} minutes</span></div>
            <div>Max Hints: <span className="text-terminal-yellow">{currentLevelData.scenario.maxHints}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
