'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '@/types';
import { cn } from '@/lib/utils';

interface TerminalProps {
  lines: TerminalLine[];
  onCommand: (command: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function Terminal({ lines, onCommand, isLoading = false, className }: TerminalProps) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount and when clicked
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Global keyboard event listener to auto-focus terminal input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs, textareas, or content editable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }

      // Don't interfere with special keys or key combinations
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'F1' ||
        e.key === 'F2' ||
        e.key === 'F3' ||
        e.key === 'F4' ||
        e.key === 'F5' ||
        e.key === 'F6' ||
        e.key === 'F7' ||
        e.key === 'F8' ||
        e.key === 'F9' ||
        e.key === 'F10' ||
        e.key === 'F11' ||
        e.key === 'F12'
      ) {
        return;
      }

      // Focus the terminal input if it's not already focused
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        
        // If it's a printable character, add it to the input
        if (e.key.length === 1) {
          const currentValue = inputRef.current.value;
          setInput(currentValue + e.key);
          e.preventDefault();
        }
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleGlobalKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Also focus when the terminal container is clicked
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const command = input.trim();
    
    // Add to command history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Clear input
    setInput('');
    
    // Execute command
    onCommand(command);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement command auto-completion
    }
  };

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return 'terminal-error';
      case 'warning':
        return 'terminal-warning';
      case 'info':
        return 'terminal-info';
      case 'input':
        return 'terminal-text';
      default:
        return 'terminal-output';
    }
  };

  const formatLineContent = (line: TerminalLine) => {
    if (line.type === 'input') {
      return `$ ${line.content}`;
    }
    return line.content;
  };

  return (
    <div 
      className={cn('terminal-container w-full h-[600px] flex flex-col', className)}
      onClick={handleContainerClick}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 border-b border-terminal-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-terminal-muted text-sm font-mono">DEZECTIVE TERMINAL v1.0</span>
        <div className="w-16"></div> {/* Spacer for balance */}
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto terminal-scrollbar font-mono text-sm leading-relaxed"
      >
        {lines.map((line) => (
          <div 
            key={line.id} 
            className={cn('mb-1', getLineClass(line.type))}
          >
            <span className="text-terminal-muted text-xs mr-2">
              {new Date(line.timestamp).toLocaleTimeString()}
            </span>
            <span className="whitespace-pre-wrap">
              {formatLineContent(line)}
            </span>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-terminal-primary">
            <div className="terminal-spinner"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <div className="border-t border-terminal-border p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-terminal-primary font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input flex-1"
            placeholder="Type a command..."
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
          />
          <div className="terminal-cursor"></div>
        </form>
        
        {/* Help text */}
        <div className="mt-2 text-terminal-muted text-xs">
          Use ↑/↓ arrows for command history, Tab for auto-complete
        </div>
      </div>
    </div>
  );
}
