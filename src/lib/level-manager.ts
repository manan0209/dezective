import { Level } from '../types';

// File system types
interface FileSystemEntry {
  type: 'file' | 'directory';
  content?: string | string[];
  children?: Record<string, FileSystemEntry>;
}

// Import level data
import level1Data from '../data/levels/level-1.json';
import level2Data from '../data/levels/level-2.json';
import level3Data from '../data/levels/level-3.json';
import level4Data from '../data/levels/level-4.json';
import level5Data from '../data/levels/level-5.json';

class LevelManager {
  private levels: Map<string, Level> = new Map();
  private currentFileSystem: Record<string, FileSystemEntry> = {};

  constructor() {
    this.loadLevels();
  }

  private loadLevels() {
    // Load all available levels
    this.levels.set('level-1', level1Data as Level);
    this.levels.set('level-2', level2Data as Level);
    this.levels.set('level-3', level3Data as Level);
    this.levels.set('level-4', level4Data as Level);
    this.levels.set('level-5', level5Data as Level);
  }

  getLevel(levelId: string): Level | null {
    return this.levels.get(levelId) || null;
  }

  getAllLevels(): Level[] {
    return Array.from(this.levels.values());
  }

  getLevelList(): Array<{ id: string; title: string; difficulty: string }> {
    return Array.from(this.levels.values()).map(level => ({
      id: level.id,
      title: level.title,
      difficulty: level.difficulty
    }));
  }

  initializeLevel(levelId: string): boolean {
    const level = this.getLevel(levelId);
    if (!level) return false;

    // Initialize the file system for this level
    this.currentFileSystem = { ...level.environment.fileSystem } as Record<string, FileSystemEntry>;
    return true;
  }

  executeCommand(command: string, args: string[]): string {
    switch (command) {
      case 'ls':
        return this.handleLs(args);
      case 'cat':
        return this.handleCat(args);
      case 'grep':
        return this.handleGrep(args);
      case 'find':
        return this.handleFind(args);
      case 'head':
        return this.handleHead(args);
      case 'tail':
        return this.handleTail(args);
      case 'pwd':
        return '/home/detective';
      case 'whoami':
        return 'detective';
      case 'cd':
        return this.handleCd(args);
      default:
        return `Command not found: ${command}`;
    }
  }

  private handleLs(args: string[]): string {
    const path = args[0] || '/';
    const entries = Object.keys(this.currentFileSystem)
      .filter(key => key.startsWith(path === '/' ? '' : path))
      .map(key => {
        const relativePath = path === '/' ? key : key.replace(path, '');
        return relativePath.split('/').filter(Boolean)[0];
      })
      .filter((value, index, self) => self.indexOf(value) === index);

    return entries.length > 0 ? entries.join('\n') : `ls: cannot access '${path}': No such file or directory`;
  }

  private handleCat(args: string[]): string {
    if (args.length === 0) {
      return 'cat: missing file operand';
    }

    const filePath = args[0];
    const file = this.currentFileSystem[filePath];

    if (!file) {
      return `cat: ${filePath}: No such file or directory`;
    }

    if (file.type !== 'file') {
      return `cat: ${filePath}: Is a directory`;
    }

    return Array.isArray(file.content) ? file.content.join('\n') : (file.content || '');
  }

  private handleGrep(args: string[]): string {
    if (args.length < 2) {
      return 'grep: missing pattern or file';
    }

    const pattern = args[0];
    const filePath = args[1];
    const file = this.currentFileSystem[filePath];

    if (!file) {
      return `grep: ${filePath}: No such file or directory`;
    }

    const content = Array.isArray(file.content) ? file.content : [file.content || ''];
    const matches = content.filter((line: string | undefined): line is string => 
      typeof line === 'string' && line.toLowerCase().includes(pattern.toLowerCase())
    );

    return matches.length > 0 ? matches.join('\n') : '';
  }

  private handleFind(args: string[]): string {
    const nameFlag = args.indexOf('-name');
    
    if (nameFlag !== -1 && args[nameFlag + 1]) {
      const pattern = args[nameFlag + 1].replace(/['"]/g, '');
      const matches = Object.keys(this.currentFileSystem)
        .filter(path => path.includes(pattern));
      return matches.join('\n');
    }

    // Simple find - list all files
    return Object.keys(this.currentFileSystem).join('\n');
  }

  private handleHead(args: string[]): string {
    if (args.length === 0) {
      return 'head: missing file operand';
    }

    const filePath = args[0];
    const file = this.currentFileSystem[filePath];

    if (!file) {
      return `head: ${filePath}: No such file or directory`;
    }

    const content = Array.isArray(file.content) ? file.content : [file.content || ''];
    return content.slice(0, 10).join('\n');
  }

  private handleTail(args: string[]): string {
    if (args.length === 0) {
      return 'tail: missing file operand';
    }

    const filePath = args[0];
    const file = this.currentFileSystem[filePath];

    if (!file) {
      return `tail: ${filePath}: No such file or directory`;
    }

    const content = Array.isArray(file.content) ? file.content : [file.content || ''];
    return content.slice(-10).join('\n');
  }

  private handleCd(args: string[]): string {
    // For simplicity, we'll just acknowledge the command
    const path = args[0] || '/home/detective';
    return `Changed directory to ${path}`;
  }

  checkClueReveal(command: string, levelId: string): string[] {
    const level = this.getLevel(levelId);
    if (!level) return [];

    const revealedClues: string[] = [];
    
    level.clues.forEach(clue => {
      if (!clue.revealed && clue.triggerCommands.some(trigger => 
        command.includes(trigger) || trigger.includes(command.split(' ')[0])
      )) {
        clue.revealed = true;
        revealedClues.push(clue.id);
      }
    });

    return revealedClues;
  }

  checkSolution(answer: string, levelId: string): boolean {
    const level = this.getLevel(levelId);
    if (!level) return false;

    return answer.trim().toLowerCase() === level.solution.finalAnswer.toLowerCase();
  }

  calculateScore(levelId: string, completionTime: number, hintsUsed: number, wrongCommands: number): number {
    const level = this.getLevel(levelId);
    if (!level) return 0;

    const { maxScore, timeBonus, hintPenalty, wrongCommandPenalty } = level.scoring;
    
    let score = maxScore;
    
    // Time bonus (if completed within time limit)
    if (completionTime <= level.scenario.timeLimit) {
      const timeRatio = 1 - (completionTime / level.scenario.timeLimit);
      score += Math.floor(timeBonus * timeRatio);
    }
    
    // Penalties
    score -= hintsUsed * hintPenalty;
    score -= wrongCommands * wrongCommandPenalty;
    
    return Math.max(score, 0);
  }
}

export const levelManager = new LevelManager();
