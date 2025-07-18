# How to Play Dezective

Welcome to **Dezective** - the ultimate cybersecurity investigation game! Master digital forensics and uncover cyber crimes through immersive terminal-based gameplay.

## 🎯 Game Overview

Dezective puts you in the role of a digital detective investigating various cybersecurity incidents. Using realistic Linux commands and forensic techniques, you'll analyze evidence, uncover clues, and solve complex cyber crimes.

## 🚀 Getting Started

### 1. Authentication
Before starting any investigation, you need to create your agent profile:

**Option A: Using the Terminal**
```bash
register YourAgentName    # Create a new agent
login YourAgentName       # Login with existing agent
```

**Option B: Using the Authentication Panel**
- Use the sidebar panel on the right
- Choose "Register" or "Login" 
- Enter your agent codename (3-20 characters, letters/numbers only)

### 2. Basic Commands
```bash
help          # Show all available commands
whoami        # Display your current agent info
levels        # List all available investigations
clear         # Clear the terminal screen
```

## 🔍 Starting an Investigation

### View Available Cases
```bash
levels
```
This shows all investigations with their difficulty levels:
- **Beginner**: Email server breach, basic file analysis
- **Intermediate**: Database compromises, web server attacks
- **Advanced**: Social engineering, network intrusions, APT analysis

### Launch an Investigation
```bash
start level-1    # Start the first investigation
start level-2    # Start database breach case
# ... and so on
```

## 🕵️ Investigation Commands

Once inside an investigation, you have access to realistic Linux forensic commands:

### File System Navigation
```bash
ls              # List files and directories
ls -la          # List with detailed permissions and hidden files
cd /path        # Change directory
pwd             # Show current directory
```

### File Analysis
```bash
cat filename    # Display file contents
head filename   # Show first 10 lines of a file
tail filename   # Show last 10 lines of a file
grep pattern filename    # Search for text patterns in files
```

### Advanced Investigation
```bash
find /path -name "*.log"    # Find files by name/pattern
history                     # Show command history
file filename              # Identify file type
```

## 🧩 Solving Cases

### Finding Clues
- **Execute commands** to explore the file system
- **Read log files** to understand what happened
- **Search for patterns** using grep and find
- **Analyze timestamps** to build a timeline
- **Look for suspicious activities** in system logs

### Evidence Board
- Discovered clues appear in the **Evidence Panel**
- Click on clues to expand and read details
- Piece together the evidence to solve the case
- Some clues unlock only after finding previous evidence

### Getting Hints
```bash
hint    # Get a helpful hint for the current investigation
```
**Note**: Using hints reduces your final score, so try to solve cases independently first!

## 🏆 Scoring System

Your performance is evaluated on multiple factors:

### Score Components
- **Base Points**: Awarded for solving the case
- **Time Bonus**: Faster completion = higher score
- **Efficiency Bonus**: Fewer wrong commands = better score
- **Hint Penalty**: Each hint used reduces your score

### Difficulty Multipliers
- **Beginner**: 1.0x multiplier
- **Intermediate**: 1.5x multiplier  
- **Advanced**: 2.0x multiplier

## 🏅 Leaderboards

Compete with other digital detectives:

### Global Leaderboard
- Shows top agents by total score
- Includes levels completed and rank
- Updates in real-time

### Level-Specific Leaderboards
- Compare your performance on individual cases
- See completion times and hint usage
- Learn from top performers

## 📚 Investigation Scenarios

### Level 1: The Missing Email (Beginner)
**Scenario**: Email server breach investigation  
**Skills**: Basic file navigation, log analysis  
**Time Limit**: 30 minutes  
**What You'll Learn**: Email server logs, authentication failures

### Level 2: Database Breach Investigation (Intermediate)
**Scenario**: Customer database compromise  
**Skills**: SQL log analysis, web server investigation  
**Time Limit**: 40 minutes  
**What You'll Learn**: Multi-system breach analysis, data theft tracking

### Level 3: Social Engineering Attack (Advanced)
**Scenario**: Sophisticated phishing campaign  
**Skills**: Email header analysis, domain investigation  
**Time Limit**: 50 minutes  
**What You'll Learn**: Attack attribution, social engineering detection

### Level 4: Network Intrusion Analysis (Advanced)
**Scenario**: Multi-stage network attack  
**Skills**: Network log correlation, lateral movement tracking  
**Time Limit**: 60 minutes  
**What You'll Learn**: Advanced persistent threat investigation

### Level 5: Advanced Persistent Threat (Expert)
**Scenario**: Nation-state level cyber attack  
**Skills**: Advanced malware analysis, attribution techniques  
**Time Limit**: 75 minutes  
**What You'll Learn**: APT tactics, advanced forensic techniques

## 💡 Pro Tips

### For Beginners
1. **Start with `ls` and `cd`** to explore the file system
2. **Read README files** for context about the environment
3. **Check log files** in `/var/log/` directory
4. **Use `grep` to search** for specific users, IPs, or timestamps
5. **Don't rush** - take time to understand what you're seeing

### For Advanced Players
1. **Think like an attacker** - what would they target?
2. **Build timelines** by correlating logs from different sources
3. **Look for persistence mechanisms** attackers might have used
4. **Check for data exfiltration** indicators
5. **Consider the full attack chain** from initial access to objectives

### Command Efficiency
- Use **tab completion** where available
- Learn **common log locations**: `/var/log/`, `/home/`, `/tmp/`
- Master **grep patterns**: `grep -i` (case insensitive), `grep -r` (recursive)
- Combine commands: `cat file.log | grep "ERROR"`

## 🛠️ Troubleshooting

### Common Issues
- **"Command not found"**: Use `help` to see available commands
- **"Permission denied"**: Some files may require specific discovery methods
- **"No such file"**: Check your current directory with `pwd`
- **Stuck on a case**: Use the `hint` command (with score penalty)

### Getting Help
- Use the `help` command for available commands
- Check the **Evidence Panel** for discovered clues
- Join the community discussions for tips and strategies
- Review completed cases to learn new techniques

## 🎖️ Becoming a Master Detective

### Skill Progression
1. **Complete all beginner levels** to master basic commands
2. **Improve your time** on intermediate cases
3. **Solve advanced cases** without hints
4. **Achieve top leaderboard** positions
5. **Help other detectives** in the community

### Real-World Skills
Playing Dezective helps you develop:
- **Linux command line proficiency**
- **Log analysis techniques**
- **Incident response procedures**
- **Digital forensics methodology**
- **Cybersecurity awareness**

## 🌟 Community Features

### Share Your Success
- Screenshot your best scores
- Share solving strategies with other players
- Create walkthrough guides for complex cases
- Participate in community challenges

### Learning Resources
- Each level includes **educational content**
- Links to **real-world cybersecurity resources**
- **Best practices** for digital forensics
- **Industry-standard tools** and techniques

---

## 🚨 Ready to Investigate?

```bash
register YourAgentName    # Create your detective profile
levels                    # View available cases
start level-1            # Begin your first investigation
```

**Good luck, Detective! The digital world needs your expertise.** 🔍🛡️

---

*Dezective is an educational game designed to teach real cybersecurity skills through engaging gameplay. All scenarios are based on realistic attack patterns and investigation techniques used by security professionals.*
