import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameState, Level, LevelState, User, TerminalLine } from '@/types';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '@/lib/utils';
import { SupabaseAPI } from '@/lib/api';

interface GameStore extends GameState {
  user: User | null;
  currentLevelData: Level | null;
  levelState: LevelState;
  terminalLines: TerminalLine[];
  isConnected: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  createUser: (username: string) => Promise<boolean>;
  loginUser: (username: string) => Promise<boolean>;
  startLevel: (level: Level) => void;
  endLevel: (success: boolean) => Promise<void>;
  updateScore: (points: number) => void;
  addHint: () => void;
  addWrongCommand: () => void;
  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  clearTerminal: () => void;
  updateLevelState: (updates: Partial<LevelState>) => void;
  resetGame: () => void;
  saveProgress: () => void;
  loadProgress: () => void;
  checkConnection: () => Promise<void>;
}

const initialGameState: GameState = {
  currentLevel: null,
  score: 0,
  startTime: null,
  hintsUsed: 0,
  wrongCommands: 0,
  completedLevels: [],
  isPlaying: false,
};

const initialLevelState: LevelState = {
  unlockedClues: [],
  unlockedTools: [],
  progress: 0,
  hintsUsed: [],
  commandsExecuted: [],
  solved: false,
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector(
    (set, get) => ({
      // Initial state
      ...initialGameState,
      user: null,
      currentLevelData: null,
      levelState: initialLevelState,
      terminalLines: [
        {
          id: generateId(),
          type: 'output',
          content: 'Welcome to DEZECTIVE - Digital Crime Scene Investigation',
          timestamp: Date.now(),
        },
        {
          id: generateId(),
          type: 'output',
          content: 'Type "help" to see available commands',
          timestamp: Date.now() + 1,
        },
      ],
      isConnected: false,

      // Actions
      setUser: (user) => {
        set({ user });
        if (user) {
          saveToLocalStorage('dezective_user', user);
        }
      },

      createUser: async (username) => {
        const user = await SupabaseAPI.createUser(username);
        if (!user) {
          get().addTerminalLine({
            type: 'error',
            content: `Error creating user: Username may already exist`,
          });
          return false;
        }
        set({ user });
        saveToLocalStorage('dezective_user', user);
        get().addTerminalLine({
          type: 'info',
          content: `User created: ${user.username}`,
        });
        return true;
      },

      loginUser: async (username) => {
        const user = await SupabaseAPI.getUserByUsername(username);
        if (!user) {
          get().addTerminalLine({
            type: 'error',
            content: `User not found: ${username}`,
          });
          return false;
        }
        set({ user });
        saveToLocalStorage('dezective_user', user);
        get().addTerminalLine({
          type: 'info',
          content: `Logged in as: ${user.username}`,
        });
        return true;
      },

      startLevel: (level) => {
        const startTime = Date.now();
        set({
          currentLevel: level.id,
          currentLevelData: level,
          startTime,
          isPlaying: true,
          score: 0,
          hintsUsed: 0,
          wrongCommands: 0,
          levelState: {
            ...initialLevelState,
            unlockedClues: [], // All clues start locked
            unlockedTools: [], // All tools start locked
          },
        });

        // Add level start message to terminal
        get().addTerminalLine({
          type: 'info',
          content: `Starting level: ${level.title}`,
        });

        get().addTerminalLine({
          type: 'output',
          content: level.description,
        });

        get().saveProgress();
      },

      endLevel: async (success) => {
        const state = get();
        if (!state.currentLevelData || !state.startTime) return;

        const completionTime = Math.floor((Date.now() - state.startTime) / 1000);
        const levelId = state.currentLevelData.id;

        if (success) {
          // Calculate final score
          const finalScore = calculateLevelScore(
            state.currentLevelData.scoring,
            completionTime,
            state.hintsUsed,
            state.wrongCommands
          );

          // Update completed levels
          const completedLevels = state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId];

          set({
            score: finalScore,
            completedLevels,
            isPlaying: false,
            levelState: { ...state.levelState, solved: true },
          });

          get().addTerminalLine({
            type: 'info',
            content: `Level completed! Final score: ${finalScore}`,
          });

          // Update user total score if user exists
          if (state.user) {
            const updatedUser = {
              ...state.user,
              totalScore: state.user.totalScore + finalScore,
              levelsCompleted: completedLevels.length,
            };
            get().setUser(updatedUser);
          }

          // Submit score to Supabase
          if (state.user?.id) {
            await SupabaseAPI.submitScore(
              state.user.id,
              levelId,
              finalScore,
              completionTime,
              state.hintsUsed,
              state.wrongCommands
            );
          }
        } else {
          set({ isPlaying: false });
          get().addTerminalLine({
            type: 'error',
            content: 'Level failed. Try again!',
          });
        }

        get().saveProgress();
      },

      updateScore: (points) => {
        set((state) => ({ score: state.score + points }));
        get().saveProgress();
      },

      addHint: () => {
        set((state) => ({ hintsUsed: state.hintsUsed + 1 }));
        get().saveProgress();
      },

      addWrongCommand: () => {
        set((state) => ({ wrongCommands: state.wrongCommands + 1 }));
        get().saveProgress();
      },

      addTerminalLine: (line) => {
        const newLine: TerminalLine = {
          id: generateId(),
          timestamp: Date.now(),
          ...line,
        };

        set((state) => {
          const newLines = [...state.terminalLines, newLine];
          // Keep only the last 100 lines to prevent memory issues
          if (newLines.length > 100) {
            return { terminalLines: newLines.slice(-100) };
          }
          return { terminalLines: newLines };
        });
      },

      clearTerminal: () => {
        set({
          terminalLines: [
            {
              id: generateId(),
              type: 'output',
              content: 'Terminal cleared',
              timestamp: Date.now(),
            },
          ],
        });
      },

      updateLevelState: (updates) => {
        set((state) => ({
          levelState: { ...state.levelState, ...updates },
        }));
        get().saveProgress();
      },

      resetGame: () => {
        set({
          ...initialGameState,
          levelState: initialLevelState,
          terminalLines: [
            {
              id: generateId(),
              type: 'output',
              content: 'Game reset. Welcome back, detective!',
              timestamp: Date.now(),
            },
          ],
        });
        get().saveProgress();
      },

      saveProgress: () => {
        const state = get();
        const gameData = {
          gameState: {
            currentLevel: state.currentLevel,
            score: state.score,
            startTime: state.startTime,
            hintsUsed: state.hintsUsed,
            wrongCommands: state.wrongCommands,
            completedLevels: state.completedLevels,
            isPlaying: state.isPlaying,
          },
          levelState: state.levelState,
        };
        saveToLocalStorage('dezective_progress', gameData);
      },

      loadProgress: () => {
        const saved = loadFromLocalStorage('dezective_progress', null) as {
          gameState?: Partial<GameState>;
          levelState?: LevelState;
        } | null;
        const savedUser = loadFromLocalStorage('dezective_user', null) as User | null;

        if (saved?.gameState) {
          set({
            ...saved.gameState,
            levelState: saved.levelState || initialLevelState,
          });
        }

        if (savedUser) {
          set({ user: savedUser });
        }
      },

      checkConnection: async () => {
        const isConnected = await SupabaseAPI.checkDatabaseConnection();
        set({ isConnected });
      },
    })
  )
);

// Helper function to calculate level score
function calculateLevelScore(
  scoring: Level['scoring'],
  completionTime: number,
  hintsUsed: number,
  wrongCommands: number
): number {
  let score = scoring.maxScore;

  // Time bonus (simplified)
  const timeRatio = Math.max(0, 1 - (completionTime / 3600)); // Assume 1 hour max
  score += Math.floor(scoring.timeBonus * timeRatio);

  // Penalties
  score -= hintsUsed * scoring.hintPenalty;
  score -= wrongCommands * scoring.wrongCommandPenalty;

  return Math.max(0, score);
}

// Selector hooks for specific parts of the state
export const useUser = () => useGameStore((state) => state.user);
export const useCurrentLevel = () => useGameStore((state) => state.currentLevelData);
export const useGameState = () => useGameStore((state) => ({
  currentLevel: state.currentLevel,
  score: state.score,
  startTime: state.startTime,
  hintsUsed: state.hintsUsed,
  wrongCommands: state.wrongCommands,
  completedLevels: state.completedLevels,
  isPlaying: state.isPlaying,
}));
export const useLevelState = () => useGameStore((state) => state.levelState);
export const useTerminalLines = () => useGameStore((state) => state.terminalLines);
export const useIsConnected = () => useGameStore((state) => state.isConnected);
