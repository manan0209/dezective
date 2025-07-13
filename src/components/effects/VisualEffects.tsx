'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatrixRainProps {
  intensity?: number;
}

export function MatrixRain({ intensity = 50 }: MatrixRainProps) {
  const [drops, setDrops] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    chars: string[];
  }>>([]);

  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const newDrops = Array.from({ length: intensity }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)])
    }));
    setDrops(newDrops);
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute top-0 text-terminal-primary font-mono text-sm whitespace-pre"
          style={{ left: `${drop.x}%` }}
          initial={{ y: -100 }}
          animate={{ y: '100vh' }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: drop.delay,
            ease: 'linear'
          }}
        >
          {drop.chars.map((char, i) => (
            <motion.div
              key={i}
              className="block"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.5, 0.2, 0] }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {char}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

interface GlitchTextProps {
  children: string;
  className?: string;
  intensity?: number;
}

export function GlitchText({ children, className = '', intensity = 3 }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={isGlitching ? {
        x: [0, -2, 2, -1, 1, 0],
        y: [0, 1, -1, 1, 0],
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
      {isGlitching && (
        <>
          <motion.span
            className="absolute inset-0 text-red-500"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)' }}
            animate={{ x: [-2, 2, -1] }}
            transition={{ duration: 0.1, repeat: 2 }}
          >
            {children}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-blue-500"
            style={{ clipPath: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)' }}
            animate={{ x: [2, -2, 1] }}
            transition={{ duration: 0.1, repeat: 2 }}
          >
            {children}
          </motion.span>
        </>
      )}
    </motion.span>
  );
}

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingAnimation({ text, speed = 50, className = '', onComplete }: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        className="border-r-2 border-terminal-primary ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        &nbsp;
      </motion.span>
    </span>
  );
}

interface ParticleSystemProps {
  count?: number;
  color?: string;
}

export function ParticleSystem({ count = 30, color = '#00ff00' }: ParticleSystemProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
}

interface ScanlineEffectProps {
  speed?: number;
  opacity?: number;
}

export function ScanlineEffect({ speed = 3, opacity = 0.1 }: ScanlineEffectProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-full h-1 bg-terminal-primary"
        style={{ opacity }}
        animate={{ y: ['0vh', '100vh'] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

interface CodeRainProps {
  lines?: string[];
  speed?: number;
}

export function CodeRain({ lines = ['if (hacker) { investigate(); }', 'const truth = findEvidence();', 'while(mystery) { solve(); }'], speed = 2 }: CodeRainProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute text-terminal-primary font-mono text-xs whitespace-nowrap"
          style={{ 
            left: `${Math.random() * 80 + 10}%`,
            top: `-20px`
          }}
          animate={{ y: '100vh' }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear'
          }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}
