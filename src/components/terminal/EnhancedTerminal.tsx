'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { TerminalLine } from '@/types';interface EnhancedTerminalProps {lines: TerminalLine[];
  onCommand: (command: string) => void;
  isLoading?: boolean;
  currentPath?: string;
  username?: string;
  serverName?: string;
  levelManager?: typeof import('@/lib/level-manager').levelManager;
}

export function EnhancedTerminal({ 
  lines, 
  onCommand, 
  isLoading = false, 
  currentPath = '/home/hacker',
  username = 'hacker',
  serverName = 'dezective-server',
  levelManager 
}: EnhancedTerminalProps) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [networkActivity, setNetworkActivity] = useState<Array<{id: number, type: string, data: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 600);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Get current working directory from level manager
  const getCurrentPath = () => {
    return levelManager?.getCurrentWorkingDirectory() || currentPath;
  };

  // Simulate network activity
  useEffect(() => {
    const activities = [
      'TCP connection from 192.168.1.100',
      'SSH login attempt detected',
      'Port scan on 6789 detected',
      'File transfer initiated',
      'Firewall rule updated',
      'Network anomaly detected'
    ];

    const interval = setInterval(() => {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      setNetworkActivity(prev => [
        ...prev.slice(-4),
        { id: Date.now(), type: 'info', data: activity }
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const command = input.trim();
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');
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
      // Enhanced tab completion
      const commands = levelManager 
        ? levelManager.getAvailableCommands().concat(['help', 'clear', 'quit'])
        : ['help', 'clear', 'register', 'login', 'whoami', 'start'];
      
      const inputParts = input.trim().split(/\s+/);
      
      if (inputParts.length === 1) {
        const matches = commands.filter((cmd: string) => cmd.startsWith(inputParts[0]));
        if (matches.length === 1) {
          setInput(matches[0] + ' ');
        }
      }
    }
  };

  const getLineIcon = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return '[ERR]';
      case 'warning': return '[WARN]';
      case 'info': return '[INFO]';
      case 'input': return '$';
      default: return '>';
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'input': return 'text-terminal-primary';
      default: return 'text-terminal-secondary';
    }
  };

  return (
    <div className="flex h-full bg-black rounded-lg overflow-hidden border border-terminal-primary/30">
      {/* Main Terminal */}
      <div className="flex-1 flex flex-col">
        {/* Terminal Header */}
        <motion.div 
          className="bg-gray-900 border-b border-terminal-primary/30 p-3 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-terminal-primary font-mono font-bold">
              DEZECTIVE TERMINAL v3.0
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-terminal-muted">
              {username}@{serverName}:{getCurrentPath()}
            </span>
            <motion.div
              className="px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              SECURE CONNECTION
            </motion.div>
          </div>
        </motion.div>

        {/* Terminal Output */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed bg-gradient-to-br from-black via-gray-900 to-black"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(0, 255, 0, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.05) 0%, transparent 50%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.02) 2px, rgba(0, 255, 0, 0.02) 4px)
            `
          }}
        >
          <AnimatePresence initial={false}>
            {lines.map((line, index) => (
              <motion.div
                key={line.id}
                className={`mb-2 flex items-start space-x-2 ${getLineColor(line.type)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="text-terminal-muted text-xs mt-0.5">
                  {new Date(line.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-xs mt-0.5">
                  {getLineIcon(line.type)}
                </span>
                <span className="flex-1 whitespace-pre-wrap">
                  {line.content}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Animation */}
          {isLoading && (
            <motion.div
              className="flex items-center space-x-2 text-terminal-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-2 h-2 bg-terminal-primary rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-terminal-primary rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-terminal-primary rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
              <span>Processing command...</span>
            </motion.div>
          )}
        </div>

        {/* Terminal Input */}
        <motion.div 
          className="border-t border-terminal-primary/30 p-4 bg-gray-900/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <span className="text-terminal-primary font-bold">
              {username}@{serverName}:{getCurrentPath()}$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-terminal-primary font-mono caret-terminal-primary"
              placeholder="Enter command..."
              disabled={isLoading}
              spellCheck={false}
              autoComplete="off"
            />
            {showCursor && (
              <motion.span
                className="w-2 h-5 bg-terminal-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </form>
          
          <div className="mt-2 text-xs text-gray-500">
            Use ↑/↓ for history • Tab for autocomplete • Ctrl+C to cancel
          </div>
        </motion.div>
      </div>

      {/* Side Panel - System Monitor */}
      <motion.div 
        className="w-80 bg-gray-900 border-l border-terminal-primary/30 flex flex-col"
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* System Stats */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-terminal-primary font-bold mb-3 font-mono">SYSTEM MONITOR</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>CPU:</span>
              <motion.span 
                className="text-green-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                23%
              </motion.span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className="text-blue-400">4.2GB / 16GB</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="text-yellow-400">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>Threat Level:</span>
              <motion.span 
                className="text-red-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                HIGH
              </motion.span>
            </div>
          </div>
        </div>

        {/* Network Activity */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-terminal-accent font-bold mb-3 font-mono">NETWORK ACTIVITY</h3>
          <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
            <AnimatePresence>
              {networkActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="text-gray-400 py-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {activity.data}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Command Shortcuts */}
        <div className="p-4 flex-1">
          <h3 className="text-terminal-info font-bold mb-3 font-mono">QUICK COMMANDS</h3>
          <div className="space-y-2">
            {[
              { cmd: 'ls -la', desc: 'List all files' },
              { cmd: 'netstat -tuln', desc: 'Check network ports' },
              { cmd: 'iptables -L', desc: 'View firewall rules' },
              { cmd: 'help', desc: 'Show all commands' }
            ].map((item) => (
              <motion.button
                key={item.cmd}
                className="w-full text-left p-2 rounded bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
                onClick={() => onCommand(item.cmd)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-terminal-primary font-mono text-xs">{item.cmd}</div>
                <div className="text-gray-500 text-xs">{item.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
