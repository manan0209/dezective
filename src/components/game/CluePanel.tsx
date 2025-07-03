'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lightbulb, Lock } from 'lucide-react';
import { Clue } from '../../types';

interface CluePanelProps {
  clues: Clue[];
  className?: string;
}

export function CluePanel({ clues, className = '' }: CluePanelProps) {
  const [expandedClue, setExpandedClue] = React.useState<string | null>(null);

  const toggleClue = (clueId: string) => {
    setExpandedClue(expandedClue === clueId ? null : clueId);
  };

  const revealedClues = clues.filter(clue => clue.revealed);
  const hiddenClues = clues.filter(clue => !clue.revealed);

  return (
    <div className={`bg-terminal-bg border border-terminal-green rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-terminal-green" />
        <h2 className="text-terminal-green font-mono text-lg">Evidence Board</h2>
        <span className="text-terminal-gray text-sm">
          ({revealedClues.length}/{clues.length})
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {revealedClues.map((clue) => (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-terminal-green/30 rounded bg-terminal-bg/50"
            >
              <button
                onClick={() => toggleClue(clue.id)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-terminal-green/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-terminal-yellow" />
                  <span className="text-terminal-green font-mono text-sm">
                    {clue.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-gray text-xs">
                    {expandedClue === clue.id ? 'Hide' : 'Show'}
                  </span>
                  {expandedClue === clue.id ? (
                    <EyeOff className="w-4 h-4 text-terminal-gray" />
                  ) : (
                    <Eye className="w-4 h-4 text-terminal-gray" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedClue === clue.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-terminal-green/30"
                  >
                    <div className="p-3 space-y-2">
                      <p className="text-terminal-gray text-sm leading-relaxed">
                        {clue.description}
                      </p>
                      <div className="bg-terminal-bg border border-terminal-yellow/30 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Lightbulb className="w-3 h-3 text-terminal-yellow" />
                          <span className="text-terminal-yellow text-xs font-mono">HINT</span>
                        </div>
                        <p className="text-terminal-yellow text-xs font-mono">
                          {clue.hint}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hidden clues indicator */}
        {hiddenClues.length > 0 && (
          <div className="border border-terminal-gray/30 rounded bg-terminal-bg/30">
            <div className="p-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-terminal-gray" />
              <span className="text-terminal-gray font-mono text-sm">
                {hiddenClues.length} clue{hiddenClues.length > 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        )}

        {/* No clues message */}
        {clues.length === 0 && (
          <div className="text-center py-8">
            <Lock className="w-8 h-8 text-terminal-gray mx-auto mb-2" />
            <p className="text-terminal-gray font-mono text-sm">
              No evidence found yet
            </p>
            <p className="text-terminal-gray/70 font-mono text-xs mt-1">
              Execute commands to discover clues
            </p>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {clues.length > 0 && (
        <div className="mt-4 pt-3 border-t border-terminal-green/30">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-terminal-gray">Investigation Progress</span>
            <span className="text-terminal-green">
              {Math.round((revealedClues.length / clues.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-terminal-bg border border-terminal-green/30 rounded-full h-2">
            <motion.div
              className="bg-terminal-green h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(revealedClues.length / clues.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
