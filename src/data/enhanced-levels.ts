// Enhanced level system with multiple engaging scenarios
export const LEVELS = {
  'gta-vi-leak': {
    id: 'gta-vi-leak',
    title: 'GTA VI Leak Crisis',
    category: 'Gaming',
    difficulty: 'Beginner',
    estimatedTime: '5-10 min',
    rewards: {
      xp: 500,
      badges: ['first-investigation', 'network-sleuth'],
      unlocks: ['advanced-scanner', 'port-analyzer']
    },
    description: 'Stop the biggest gaming leak in history! Someone just leaked 90 minutes of GTA VI footage.',
    trendingScore: 95,
    scenario: {
      briefing: `🚨 EMERGENCY ALERT 🚨
      
Rockstar Games has been HACKED!
90 minutes of GTA VI gameplay just leaked online.
The gaming world is in chaos.

YOU are the cybersecurity expert they called.
Find the vulnerability. Stop the breach.
Save the most anticipated game of the decade.

Ready to become a legend?`,
      objective: 'Find and close the network vulnerability',
      timeLimit: 600, // 10 minutes for better pacing
      maxHints: 3,
      backgroundMusic: 'cyber-tension',
      atmosphere: 'crisis'
    },
    // ... rest of level data
  },
  
  'taylor-swift-tickets': {
    id: 'taylor-swift-tickets',
    title: 'Eras Tour Ticket Bot Crisis',
    category: 'Entertainment',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 min',
    rewards: {
      xp: 750,
      badges: ['bot-hunter', 'swiftie-protector'],
      unlocks: ['traffic-analyzer', 'bot-detector']
    },
    description: 'Swifties are crying! Ticket bots are hoarding Taylor Swift concert tickets. Stop the bots!',
    trendingScore: 98,
    scenario: {
      briefing: `💔 SWIFTIE EMERGENCY 💔
      
Taylor Swift's Eras Tour tickets went on sale.
Within SECONDS, everything was sold out.
But real fans got NOTHING.

Ticket bots are buying thousands of tickets to resell.
Millions of Swifties are heartbroken.

You're their ONLY hope.
Find the bot network. Shut them down.
#SaveTheSwifties`,
      objective: 'Stop the ticket bot network',
      timeLimit: 900,
      maxHints: 2,
      backgroundMusic: 'tension-building',
      atmosphere: 'urgent'
    }
    // ... level details
  },

  'tiktok-algorithm-hack': {
    id: 'tiktok-algorithm-hack',
    title: 'TikTok Algorithm Manipulation',
    category: 'Social Media',
    difficulty: 'Advanced',
    estimatedTime: '15-20 min',
    rewards: {
      xp: 1000,
      badges: ['algorithm-detective', 'social-guardian'],
      unlocks: ['ai-analyzer', 'trend-tracker']
    },
    description: 'Someone hacked TikTok\'s algorithm! Fake news is going viral. Restore the truth!',
    trendingScore: 92,
    scenario: {
      briefing: `📱 VIRAL MISINFORMATION CRISIS 📱
      
TikTok's algorithm has been compromised!
Fake news is spreading faster than wildfire.
Millions of teens are seeing false information.

Democracy itself is at risk.
The election, climate change, health advice - all corrupted.

You must trace the manipulation.
Find the source. Restore truth.
The future depends on you.`,
      objective: 'Trace and stop algorithm manipulation',
      timeLimit: 1200,
      maxHints: 1,
      backgroundMusic: 'dark-tension',
      atmosphere: 'dystopian'
    }
    // ... level details
  }
};
