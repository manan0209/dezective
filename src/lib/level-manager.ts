import { Level } from '../types';

// File system types
interface FileSystemEntry {
  type: 'file' | 'directory';
  content?: string | string[];
  children?: Record<string, FileSystemEntry>;
}

// Import the single level
import levelData from '../data/level.json';

class LevelManager {
  private level: Level;
  private currentFileSystem: Record<string, FileSystemEntry> = {};
  private currentWorkingDirectory: string = '/home/hacker';
  private currentUsername: string = 'hacker';
  private completedCommands: Set<string> = new Set();

  constructor() {
    this.level = levelData as Level;
  }

  getLevel(): Level {
    return this.level;
  }

  initializeLevel(): boolean {
    // Initialize the file system
    this.currentFileSystem = { ...this.level.environment.fileSystem } as Record<string, FileSystemEntry>;
    this.currentWorkingDirectory = '/home/hacker';
    this.currentUsername = 'hacker';
    this.completedCommands.clear();
    return true;
  }

  getCurrentWorkingDirectory(): string {
    return this.currentWorkingDirectory;
  }

  getCurrentUsername(): string {
    return this.currentUsername;
  }

  getFileSystem(): Record<string, FileSystemEntry> {
    return this.currentFileSystem;
  }

  getCompletedCommands(): Set<string> {
    return this.completedCommands;
  }

  getAvailableFiles(directory: string): string[] {
    return this.getDirectoryContents(directory);
  }

  getAvailableCommands(): string[] {
    return this.level.environment.availableCommands;
  }

  isLevelComplete(): boolean {
    // Check if the mission_complete file exists
    return '/home/hacker/mission_complete.txt' in this.currentFileSystem;
  }

  addMissionCompleteFile(): void {
    this.currentFileSystem['/home/hacker/mission_complete.txt'] = {
      type: 'file',
      content: 'Mission accomplished! GTA VI leak source identified and secured.'
    };
  }

  executeCommand(command: string, args: string[]): string {
    const fullCommand = `${command} ${args.join(' ')}`.trim();
    
    // Check for special commands first
    if (this.level?.environment.specialCommands) {
      const specialCommand = this.level.environment.specialCommands[fullCommand];
      if (specialCommand) {
        this.completedCommands.add(fullCommand);
        
        // Handle special actions
        if (specialCommand.action === 'complete_level') {
          this.addMissionCompleteFile();
        }
        
        return Array.isArray(specialCommand.output) 
          ? specialCommand.output.join('\n') 
          : specialCommand.output;
      }
    }

    switch (command) {
      case 'ls':
        return this.handleLs(args);
      case 'cat':
        return this.handleCat(args);
      case 'cd':
        return this.handleCd(args);
      case 'pwd':
        return this.currentWorkingDirectory;
      case 'whoami':
        return this.currentUsername;
      case 'netstat':
        return this.handleNetstat(args);
      case 'iptables':
        return this.handleIptables(args);
      case 'clear':
        return '';
      case 'help':
        return this.handleHelp();
      default:
        return `Command not found: ${command}\nType 'help' for available commands.`;
    }
  }

  private handleLs(args: string[]): string {
    const directory = args.length > 0 ? this.resolvePath(args[0]) : this.currentWorkingDirectory;
    
    if (!this.directoryExists(directory)) {
      return `ls: cannot access '${args[0] || directory}': No such file or directory`;
    }

    const files = this.getDirectoryContents(directory);
    if (files.length === 0) {
      return '';
    }

    return files.join('  ');
  }

  private handleCat(args: string[]): string {
    if (args.length === 0) {
      return 'cat: missing file operand';
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.currentFileSystem[filePath];

    if (!file) {
      return `cat: ${args[0]}: No such file or directory`;
    }

    if (file.type !== 'file') {
      return `cat: ${args[0]}: Is a directory`;
    }

    return typeof file.content === 'string' ? file.content : (file.content || []).join('\n');
  }

  private handleCd(args: string[]): string {
    const targetDir = args.length > 0 ? args[0] : '/home/hacker';
    const resolvedPath = this.resolvePath(targetDir);

    if (!this.directoryExists(resolvedPath)) {
      return `cd: ${targetDir}: No such file or directory`;
    }

    this.currentWorkingDirectory = resolvedPath;
    return '';
  }

  private handleNetstat(args: string[]): string {
    return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN     
tcp        0      0 192.168.1.100:8080      0.0.0.0:*               LISTEN`;
  }

  private handleIptables(args: string[]): string {
    if (args.includes('-L')) {
      return `Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     all  --  anywhere             anywhere            
INPUT_direct  all  --  anywhere             anywhere            
INPUT_ZONES_SOURCE  all  --  anywhere             anywhere            
INPUT_ZONES  all  --  anywhere             anywhere            
DROP       all  --  anywhere             anywhere             ctstate INVALID
REJECT     all  --  anywhere             anywhere             reject-with icmp-host-prohibited

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     all  --  anywhere             anywhere            
FORWARD_direct  all  --  anywhere             anywhere            
FORWARD_IN_ZONES_SOURCE  all  --  anywhere             anywhere            
FORWARD_IN_ZONES  all  --  anywhere             anywhere            
FORWARD_OUT_ZONES_SOURCE  all  --  anywhere             anywhere            
FORWARD_OUT_ZONES  all  --  anywhere             anywhere            
DROP       all  --  anywhere             anywhere             ctstate INVALID
REJECT     all  --  anywhere             anywhere             reject-with icmp-host-prohibited

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         
OUTPUT_direct  all  --  anywhere             anywhere`;
    }
    
    return 'iptables: permission denied (must be root)';
  }

  private handleHelp(): string {
    return `INVESTIGATION COMMANDS
=====================

File System Navigation:
  ls [directory]     - List files and directories
                      Example: ls /logs (show what's in logs folder)
  
  cat <file>         - Display file contents  
                      Example: cat mission.txt (read the mission briefing)
  
  cd <directory>     - Change to a different directory
                      Example: cd /logs (navigate to logs folder)
  
  pwd               - Print current directory path
                      Shows where you are in the file system

System Information:
  whoami            - Display current username (shows you're 'hacker')

Network Security Analysis:
  netstat           - Show active network connections and listening ports
                      Use this to find suspicious open ports
  
  iptables -L       - List firewall rules and security settings
                      Essential for identifying security vulnerabilities

Terminal Control:
  clear             - Clear the terminal screen
  help              - Show this help message

INVESTIGATION TIPS:
- Always start by reading your mission briefing
- Use 'ls' to explore directories and find evidence files  
- Check network connections to identify security breaches
- Analyze firewall rules to understand system vulnerabilities
- Navigate between /home/hacker and /logs directories`;
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }

    if (path === '..') {
      const parts = this.currentWorkingDirectory.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }

    if (path === '.') {
      return this.currentWorkingDirectory;
    }

    return this.currentWorkingDirectory === '/' 
      ? `/${path}` 
      : `${this.currentWorkingDirectory}/${path}`;
  }

  private directoryExists(path: string): boolean {
    return path in this.currentFileSystem && this.currentFileSystem[path].type === 'directory';
  }

  private getDirectoryContents(directory: string): string[] {
    const files: string[] = [];
    const searchPrefix = directory === '/' ? '/' : `${directory}/`;

    Object.keys(this.currentFileSystem).forEach(path => {
      if (path.startsWith(searchPrefix) && path !== directory) {
        const relativePath = path.substring(searchPrefix.length);
        const childName = relativePath.split('/')[0];
        if (childName && !files.includes(childName)) {
          files.push(childName);
        }
      } else if (directory === '/' && path.startsWith('/') && path !== '/') {
        const topLevel = path.substring(1).split('/')[0];
        if (topLevel && !files.includes(topLevel)) {
          files.push(topLevel);
        }
      }
    });
    
    return files.sort();
  }
}

export const levelManager = new LevelManager();
export default levelManager;
