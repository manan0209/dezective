# Level 1: The GTA VI Leak Investigation - Complete Walkthrough

## 🎮 **Scenario Overview**

**THE SITUATION**: Someone just leaked 90 minutes of GTA VI gameplay footage on social media! Rockstar Games is devastated and needs your help to find the security vulnerability that allowed this breach.

**YOUR MISSION**: Find the open network port that allowed unauthorized access to GTA VI files and help plug the security hole.

**DIFFICULTY**: Beginner (Perfect for cybersecurity newcomers!)

---

## 🎯 **Learning Objectives**

By completing this level, you'll learn:
- **Network port security fundamentals**
- **How hackers find vulnerabilities** (port scanning)
- **Digital forensics investigation methods**
- **Firewall protection concepts**
- **Real-world cybersecurity incident response**

---

## 🚀 **Step-by-Step Investigation**

### **Phase 1: Getting Your Bearings** ⭐

When you start the level, you'll be in your detective workspace. Let's understand what tools you have available.

**Step 1.1: Check where you are**
```bash
pwd
```
**Expected Output**: `/home/detective`

**Step 1.2: See what's available in your workspace**
```bash
ls
```
**Expected Output**: `mission_brief.txt`

**Step 1.3: Read your mission briefing**
```bash
cat mission_brief.txt
```

**What You'll Learn**: This shows you the available commands and gives you the investigation roadmap. Notice it mentions checking the `/evidence/` folder first.

---

### **Phase 2: Understanding the Incident** 🔍

Now let's investigate what actually happened with the GTA VI leak.

**Step 2.1: Navigate to the evidence folder**
```bash
cd /evidence
```

**Step 2.2: See what evidence is available**
```bash
ls
```
**Expected Output**: `incident_report.txt`

**Step 2.3: Read the incident report**
```bash
cat incident_report.txt
```

**🧠 What This Teaches You**: 
- **Timeline analysis** - Understanding when events occurred
- **Attack vectors** - How hackers gain access (through open ports)
- **Impact assessment** - The damage caused by security breaches
- **Investigation methodology** - Following the digital breadcrumbs

**Key Findings**:
- The leak happened through game testing infrastructure
- A network port was left open without firewall protection
- The hacker used automated tools to find the vulnerability
- Next step: Check the `/network/` folder for detailed logs

---

### **Phase 3: Network Forensics** 🌐

This is where you learn how hackers actually find vulnerabilities!

**Step 3.1: Navigate to the network logs**
```bash
cd /network
```

**Step 3.2: See what network data is available**
```bash
ls
```
**Expected Output**: `connection_log.txt  port_scan.txt`

**Step 3.3: Check the port scan results** (This is the smoking gun!)
```bash
cat port_scan.txt
```

**🧠 What This Teaches You**:
- **Port scanning basics** - How attackers discover open services
- **Common network ports** and their purposes:
  - Port 22: SSH (secure remote access)
  - Port 80: HTTP (web traffic)
  - Port 443: HTTPS (secure web traffic)
  - Port 6789: **THE VULNERABLE PORT!**
- **Firewall importance** - Why ports need protection
- **Risk assessment** - Understanding "CRITICAL" vs "SECURE" findings

**Key Discovery**: Port 6789 is **OPEN TO INTERNET** with **FIREWALL DISABLED** - this is how the hacker got in!

**Step 3.4: Confirm the attack with connection logs**
```bash
cat connection_log.txt
```

**🧠 What This Teaches You**:
- **Log analysis skills** - Reading network connection records
- **Suspicious activity identification** - External IP connecting to internal systems
- **Data exfiltration detection** - Large file downloads (156.2MB = GTA VI files!)
- **Timeline correlation** - Matching suspicious connections to leak timing

**Key Evidence**: 
- External IP `203.0.113.25` connected to vulnerable port 6789
- Hacker downloaded exactly the files that got leaked
- Attack happened right before the social media posts appeared

---

### **Phase 4: Interactive Security Response** 🛡️

Now comes the exciting part - you don't just read about the solution, you actually implement it yourself!

**Step 4.1: Navigate to security solutions**
```bash
cd /security
```

**Step 4.2: See what security information is available**
```bash
ls
```
**Expected Output**: `firewall_instructions.txt  lesson_learned.txt  port_status.txt`

**Step 4.3: Read the security instructions**
```bash
cat firewall_instructions.txt
```

**🧠 What This Teaches You**:
- **Active remediation** - You'll run the actual security commands
- **Network diagnostics** - Using `netstat` to see open ports
- **Firewall configuration** - Using `iptables` to block threats
- **Real-world skills** - Commands used by actual security teams

**Step 4.4: Check what ports are currently open** ⚠️ **INTERACTIVE STEP**
```bash
netstat -tuln
```

**🧠 What This Shows You**:
- Live view of all active network ports
- Port 6789 is highlighted as **VULNERABLE**
- Exactly what hackers see when scanning systems
- How to identify security risks in real-time

**Key Finding**: You'll see port 6789 is **LISTENING** and marked as the vulnerability!

**Step 4.5: Close the vulnerable port** 🚨 **MISSION-CRITICAL STEP**
```bash
iptables -A INPUT -p tcp --dport 6789 -j DROP
```

**🧠 What This Command Does**:
- `iptables`: Linux firewall configuration tool (industry standard)
- `-A INPUT`: Add rule to incoming traffic
- `-p tcp`: Apply to TCP protocol
- `--dport 6789`: Target port 6789 specifically  
- `-j DROP`: Drop (block) all connections to this port

**🎉 SUCCESS!** After running this command, you'll see:
- Confirmation that the firewall rule was added
- Port 6789 is now **BLOCKED** from external access
- **MISSION ACCOMPLISHED** message
- The GTA VI vulnerability is **PATCHED**!

**Step 4.6: Claim your achievement!** 🏆
```bash
cat /security/mission_complete.txt
```

This file only appears **after** you've successfully run both security commands, proving you actually fixed the vulnerability!

**Step 4.7: Learn the cybersecurity concepts** (Highly recommended!)
```bash
cat lesson_learned.txt
```

**🧠 What This Teaches You**:
- **Network security fundamentals** explained simply
- **Real-world relevance** - How this applies to actual companies
- **Career inspiration** - What cybersecurity professionals do
- **Achievement recognition** - You just solved a real-world scenario!

---

## 🏆 **Case Resolution**

**VULNERABILITY IDENTIFIED**: Port 6789 (GTA VI Test Server)
**ROOT CAUSE**: Firewall disabled during game testing
**HACKER METHOD**: Port scanning + automated file download
**SOLUTION**: Close port 6789 with firewall rules

**Congratulations! You've successfully:**
✅ Identified the security vulnerability
✅ Traced the attack timeline
✅ Found the evidence of data theft
✅ Learned how to fix the problem
✅ Understood real cybersecurity concepts

---

## 💡 **Real-World Applications**

This scenario teaches skills used by actual cybersecurity professionals:

**🔒 Security Operations Center (SOC) Analysts**:
- Monitor network logs for suspicious activity
- Investigate security incidents and breaches
- Analyze port scans and connection attempts

**🕵️ Digital Forensics Investigators**:
- Piece together attack timelines from log files
- Correlate evidence across multiple systems
- Document findings for legal proceedings

**🛡️ Incident Response Teams**:
- Identify vulnerabilities during active breaches
- Implement emergency security measures
- Prevent ongoing data theft

**🏢 IT Security Managers**:
- Assess business impact of security incidents
- Implement security policies and procedures
- Coordinate with development teams on secure practices

---

## 🧠 **Key Cybersecurity Concepts Learned**

### **Network Port Security**
- Ports are like doors to computer systems
- Each port number serves a specific purpose
- Open ports without protection = security vulnerabilities
- Firewalls control access to ports

### **Attack Methodology**
1. **Reconnaissance**: Hacker scans for open ports
2. **Initial Access**: Connects to vulnerable port 6789
3. **Data Exfiltration**: Downloads sensitive files
4. **Publication**: Leaks data on social media

### **Defense Strategies**
- **Principle of Least Privilege**: Only open necessary ports
- **Defense in Depth**: Multiple security layers
- **Monitoring**: Continuous network surveillance
- **Incident Response**: Rapid detection and containment

---

## 🎮 **Why This Matters for Gamers**

This scenario isn't just educational - it's incredibly relevant:

**Real Gaming Industry Attacks**:
- 2022: Uber breach affecting gaming partnerships
- 2021: CD Projekt Red ransomware (Cyberpunk 2077)
- 2020: Nintendo internal data leak
- 2019: Capcom breach affecting game development

**Your Skills Help Protect**:
- Game development studios
- Player personal data
- Unreleased game content
- Gaming platform security

---

## ⚡ **TL;DR - Quick Command Summary**

If you want to speedrun this level, here are the exact commands:

```bash
# Start in /home/detective
cat mission_brief.txt                                # Read the briefing
cd /evidence                                        # Go to evidence
cat incident_report.txt                             # Understand what happened
cd /network                                         # Check network data
cat port_scan.txt                                  # Find the vulnerable port (6789!)
cat connection_log.txt                              # Confirm the attack
cd /security                                        # Check solutions
cat firewall_instructions.txt                       # Read the instructions
netstat -tuln                                      # ⚠️ REQUIRED: Check open ports
iptables -A INPUT -p tcp --dport 6789 -j DROP      # 🚨 REQUIRED: Close port 6789
cat /security/mission_complete.txt                  # 🏆 Claim your victory!
```

**⚠️ IMPORTANT**: You MUST run both the `netstat` and `iptables` commands to complete the level. Reading files alone won't finish the mission - you need to actively fix the vulnerability!

**🏆 Fastest completion time**: ~2-3 minutes (if you know exactly what to do)
**🎯 Learning completion time**: ~15-20 minutes (recommended for understanding!)
**🔧 Interactive experience**: You actually run real cybersecurity commands!

---

## 🚀 **Pro Tips for Maximum Score**

**⭐ Speed Bonus Strategy**:
- Use `Tab` completion for file names
- Navigate directly with full paths: `cat /evidence/incident_report.txt`
- Read mission brief first to understand the roadmap

**🧠 Learning Bonus Strategy**:
- Read every file completely to understand the story
- Try to predict what you'll find before opening files
- Think about how this applies to real cybersecurity

**🔍 Investigation Bonus Strategy**:
- Look for patterns in timestamps and IP addresses
- Notice how file sizes match between logs and leak
- Understand the business impact beyond just technical details

---

## 🎉 **Congratulations, Cyber Detective!**

You've just completed your first cybersecurity investigation! You now have practical skills in:

- **Digital forensics** and evidence analysis
- **Network security** and vulnerability assessment  
- **Incident response** and security remediation
- **Log analysis** and timeline reconstruction

These are exactly the skills used by professional cybersecurity teams at major companies like Google, Microsoft, and yes... even Rockstar Games!

**Ready for the next challenge? The cybersecurity world needs more investigators like you!** 🛡️💻

---

*Keep investigating, stay curious, and remember: Every expert was once a beginner who never gave up!* 🔍✨
