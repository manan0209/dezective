'use client';

import { motion } from 'framer-motion';
import { MatrixRain, GlitchText, TypingAnimation, ParticleSystem, ScanlineEffect } from '../effects/VisualEffects';
import { useState, useEffect } from 'react';

export function EpicLandingPage({ onEnter }: { onEnter: () => void }) {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'briefing' | 'ready'>('intro');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 800);
    return () => clearInterval(cursorInterval);
  }, []);

  const handleIntroComplete = () => {
    setTimeout(() => setCurrentPhase('briefing'), 1000);
  };

  const handleBriefingComplete = () => {
    setTimeout(() => setCurrentPhase('ready'), 1000);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background Effects */}
      <MatrixRain intensity={80} />
      <ParticleSystem count={50} color="#00ff00" />
      <ScanlineEffect speed={4} opacity={0.15} />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        
        {/* Phase 1: Epic Intro */}
        {currentPhase === 'intro' && (
          <motion.div
            className="text-center max-w-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <motion.div
              className="mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              <GlitchText className="text-8xl font-bold text-terminal-primary mb-4">
                DEZECTIVE
              </GlitchText>
              <motion.div
                className="h-1 bg-gradient-to-r from-transparent via-terminal-primary to-transparent"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 1 }}
              />
            </motion.div>

            <motion.div
              className="text-2xl text-terminal-secondary mb-12"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <TypingAnimation
                text="The world's most advanced cybersecurity investigation platform..."
                speed={80}
                onComplete={handleIntroComplete}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Mission Briefing */}
        {currentPhase === 'briefing' && (
          <motion.div
            className="max-w-5xl text-left font-mono"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-black/80 border border-terminal-primary rounded-lg p-8 backdrop-blur-sm">
              <motion.div
                className="text-terminal-accent text-xl mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-red-500">URGENT</span> - GLOBAL CYBER THREAT DETECTED
              </motion.div>

              <motion.div
                className="space-y-4 text-terminal-secondary text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <TypingAnimation
                  text="Agent, we need your expertise..."
                  speed={50}
                />
                <br />
                <TypingAnimation
                  text="Multiple high-profile cyberattacks are happening RIGHT NOW."
                  speed={50}
                />
                <br />
                <TypingAnimation
                  text="• GTA VI gameplay leaked (90 minutes of footage)"
                  speed={50}
                />
                <br />
                <TypingAnimation
                  text="• Taylor Swift concert tickets hijacked by bots"
                  speed={50}
                />
                <br />
                <TypingAnimation
                  text="• TikTok algorithm compromised - fake news spreading"
                  speed={50}
                  onComplete={handleBriefingComplete}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Ready to Begin */}
        {currentPhase === 'ready' && (
          <motion.div
            className="text-center max-w-4xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="text-6xl text-terminal-primary mb-8"
              animate={{ 
                textShadow: [
                  '0 0 20px #00ff00',
                  '0 0 40px #00ff00, 0 0 60px #00ff00',
                  '0 0 20px #00ff00'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ARE YOU READY?
            </motion.div>

            <motion.div
              className="text-xl text-terminal-secondary mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Join the elite ranks of digital investigators.
              <br />
              Every second counts. Lives depend on you.
            </motion.div>

            <motion.button
              className="bg-transparent border-2 border-terminal-primary text-terminal-primary 
                         px-12 py-6 text-2xl font-mono font-bold rounded-lg
                         hover:bg-terminal-primary hover:text-black hover:shadow-[0_0_50px_#00ff00]
                         transition-all duration-300 transform hover:scale-105"
              whileHover={{ 
                boxShadow: '0 0 50px rgba(0, 255, 0, 0.8)',
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              animate={{
                borderColor: ['#00ff00', '#ffff00', '#00ff00'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ENTER THE MATRIX
              </motion.span>
            </motion.button>

            <motion.div
              className="mt-8 text-terminal-muted text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Warning: This simulation contains intense cybersecurity scenarios.
              <br />
              Recommended for ages 16+. Hack Club approved.
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Corner Info */}
      <motion.div
        className="absolute top-8 right-8 text-right text-terminal-muted font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <div>CLASSIFICATION: TOP SECRET</div>
        <div>CLEARANCE LEVEL: SIGMA</div>
        <div>AGENT STATUS: ACTIVE</div>
        <div className="text-terminal-primary">
          CONNECTION: SECURE {showCursor && '█'}
        </div>
      </motion.div>

      {/* Bottom Status Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-terminal-primary p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 4 }}
      >
        <div className="flex justify-between items-center font-mono text-terminal-secondary">
          <div>HACK CLUB - SUMMER OF MAKING 2025</div>
          <div className="flex space-x-8">
            <span>THREATS: <span className="text-red-500">ACTIVE</span></span>
            <span>STATUS: <span className="text-yellow-500">STANDBY</span></span>
            <span>AGENTS: <span className="text-green-500">ONLINE</span></span>
          </div>
          <div>DEZECTIVE v2.0 - NEURAL NET ENABLED</div>
        </div>
      </motion.div>
    </div>
  );
}
