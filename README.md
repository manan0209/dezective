# DEZECTIVE

A browser-based cybersecurity investigation game for Hack Club Summer of Making.

## Overview

DEZECTIVE is an educational terminal-based game that teaches cybersecurity investigation techniques through hands-on scenarios. Players take on the role of a digital detective, using command-line tools to solve cybersecurity incidents and uncover digital evidence.

## Features

- **Terminal Interface**: Authentic command-line experience with Linux commands
- **Investigation Scenarios**: Real-world cybersecurity cases to solve
- **Evidence Collection**: Progressive clue system that reveals as players investigate
- **Scoring System**: Points based on efficiency, accuracy, and completion time
- **Multiple Difficulty Levels**: From beginner to advanced investigations
- **User Progress Tracking**: Save progress and track achievements

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS with custom terminal theme
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dezective
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. **Login**: Use the `login` command to set your agent identity
2. **View Levels**: Type `levels` to see available investigations
3. **Start Investigation**: Use `start level-1` to begin your first case
4. **Investigate**: Use Linux commands to explore files and gather evidence
5. **Collect Clues**: Execute commands to reveal hidden evidence
6. **Submit Solution**: Use `submit <answer>` when you've solved the case

### Available Commands

**System Commands:**
- `help` - Show available commands
- `whoami` - Display user information
- `login [username]` - Set your identity
- `clear` - Clear the terminal
- `levels` - List available investigations
- `start <level-id>` - Begin an investigation
- `quit` - Exit current level

**Investigation Commands (available during levels):**
- `ls` - List directory contents
- `cat` - Display file contents
- `grep` - Search text patterns
- `find` - Search for files
- `head/tail` - View file beginnings/endings
- `pwd` - Show current directory
- `cd` - Change directory
- And more...

## Available Investigations

### Level 1: The Missing Email
**Difficulty**: Beginner  
**Scenario**: A critical email has disappeared from the company server. Investigate suspicious activity and recover the missing information.

### Level 2: Database Breach Investigation
**Difficulty**: Intermediate  
**Scenario**: Customer data has been compromised. Determine the attack vector and scope of the data breach.

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── game/           # Game-specific components
│   ├── ui/             # Reusable UI components
│   └── layout/         # Layout components
├── lib/                # Utility functions and stores
├── types/              # TypeScript type definitions
└── data/               # Game data and levels
    └── levels/         # Level definitions
```

## Development

### Key Components

- **Terminal**: Main game interface component
- **GameEngine**: Handles level logic and command processing
- **CluePanel**: Displays discovered evidence
- **LevelManager**: Manages level data and file system simulation

### Adding New Levels

1. Create a new JSON file in `src/data/levels/`
2. Follow the level schema with scenario, environment, clues, and solution
3. Add the level to the LevelManager imports

### Level Schema

```json
{
  "id": "level-id",
  "title": "Level Title",
  "difficulty": "Beginner|Intermediate|Advanced",
  "description": "Brief description",
  "scenario": {
    "briefing": "Detailed briefing text",
    "objective": "What the player needs to accomplish",
    "timeLimit": 1800,
    "maxHints": 3
  },
  "environment": {
    "serverName": "server-name",
    "osType": "Linux",
    "availableCommands": ["ls", "cat", "grep"],
    "fileSystem": {
      "/path/to/file": {
        "type": "file",
        "content": ["line1", "line2"]
      }
    }
  },
  "clues": [
    {
      "id": "clue-1",
      "title": "Clue Title",
      "description": "What this clue reveals",
      "hint": "Hint for finding this clue",
      "triggerCommands": ["cat /some/file"],
      "revealed": false
    }
  ],
  "solution": {
    "steps": ["Step 1", "Step 2"],
    "finalAnswer": "/path/to/answer",
    "explanation": "How the case was solved"
  },
  "scoring": {
    "maxScore": 1000,
    "timeBonus": 300,
    "hintPenalty": 100,
    "wrongCommandPenalty": 50
  }
}
```

## Roadmap

- [x] Basic terminal interface and command handling
- [x] Level system and game engine
- [x] Evidence/clue discovery system  
- [x] Level 1 & 2 implementations
- [ ] Additional levels (3-5)
- [ ] User authentication with Supabase
- [ ] Leaderboard system
- [ ] Advanced tools (decoders, analyzers)
- [ ] Mobile responsiveness
- [ ] Audio/visual effects
- [ ] Multiplayer features

## Contributing

This is a Hack Club Summer of Making project. Contributions, suggestions, and feedback are welcome!

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built for Hack Club Summer of Making 2024
- Inspired by real cybersecurity investigation techniques
- Terminal styling inspired by classic hacker aesthetics
