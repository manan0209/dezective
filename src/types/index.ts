// Core game types for Dezectiveexport interface GameState {currentLevel: string | null;
  score: number;
  startTime: number | null;
  hintsUsed: number;
  wrongCommands: number;
  completedLevels: string[];
  isPlaying: boolean;
}

export interface User {
  id: string;  username: string;  totalScore: number;
  levelsCompleted: number;
  completedLevels?: string[];
  createdAt: string;
  rank?: number;
}
export interface UserProgress {
  completedLevels: string[];
  totalScore: number;
  achievements: string[];
  lastLogin: string;
  level: number;
  xp: number;
  xpToNext: number;  activeTitle: string;
  investigationsCompleted: number;
  streak: number;
  fastestTime: number;
  perfectRuns: number;  favoriteCategory: string;
}export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}export interface Score {
  id: string;
  userId: string;
  levelId: string;
  score: number;
  completionTime: number; // in seconds
  hintsUsed: number;
  wrongCommands: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  username: string;
  totalScore: number;
  levelsCompleted: number;  rank: number;
}

// Terminal types
export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'warning' | 'info';  content: string;
  timestamp: number;}

export interface Command {
  name: string;
  description: string;  usage: string;
  aliases?: string[];
  handler: (args: string[]) => Promise<CommandResult>;}
export interface CommandResult {
  success: boolean;
  output: string;
  type: 'output' | 'error' | 'warning' | 'info';
  triggersProgress?: boolean;
  unlockClues?: string[];
  unlockTools?: string[];}

// Level system types
export interface Level {
  id: string;
  title: string;  difficulty: string;
  category: string;  description: string;
  estimatedTime?: string;
  trendingScore?: number;
  scenario: {
    briefing: string;
    objective: string;
    timeLimit: number;
    maxHints: number;
  };
  environment: {
    serverName: string;    osType: string;
    availableCommands: string[];
    fileSystem: Record<string, unknown>;
    specialCommands?: Record<string, {
      output: string | string[];
      action?: string;
    }>;  };
  solution: {
    steps: string[];
    finalAnswer: string;    explanation: string;
  };
  scoring: {
    maxScore: number;
    timeBonus: number;hintPenalty: number;
    wrongCommandPenalty: number;
  };
  rewards?: {
    xp: number;
    badges: string[];
  };
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  hint: string;
  triggerCommands: string[];revealed: boolean;}

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'decoder' | 'hash' | 'metadata' | 'analyzer';
  unlocked: boolean;  unlockCondition?: string;
}
export interface LevelState {
  unlockedClues: string[];
  unlockedTools: string[];
  progress: number; // 0-100
  hintsUsed: string[];
  commandsExecuted: string[];
  solved: boolean;
}

// UI Component types
export interface PanelProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TerminalProps {
  lines: TerminalLine[];
  onCommand: (command: string) => void;
  isLoading?: boolean;
}

export interface ClueViewerProps {
  clue: Clue;
  onClose: () => void;
}export interface ToolProps {  tool: Tool;  onUse: (input: string) => string;
}

// Game engine types
export interface GameEngine {
  currentLevel: Level | null;
  gameState: GameState;
  levelState: LevelState;
  executeCommand: (command: string) => Promise<CommandResult>;
  loadLevel: (levelId: string) => Promise<void>;
  getHint: (hintId: string) => Promise<string>;
  calculateScore: () => number;
  checkVictory: () => boolean;
}

// API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}export interface ScoreSubmission {  levelId: string;
  score: number;
  completionTime: number;
  hintsUsed: number;
  wrongCommands: number;
}

// File system simulation types
export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;  children?: FileSystemNode[];
  metadata?: {    size: number;    modified: string;
    permissions: string;hidden?: boolean;
  };
}

export interface FileSystem {
  root: FileSystemNode;
  currentPath: string[];
  listDirectory: (path?: string[]) => FileSystemNode[];  readFile: (path: string[]) => string | null;
  fileExists: (path: string[]) => boolean;  navigate: (path: string) => boolean;}

// Network simulation types (for advanced levels)
export interface NetworkPacket {id: string;
  source: string;
  destination: string;  protocol: string;
  data: string;
  timestamp: number;
}

export interface NetworkCapture {
  packets: NetworkPacket[];
  duration: number;
  totalBytes: number;
}