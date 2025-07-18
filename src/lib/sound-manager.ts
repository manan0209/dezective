'use client';

import React, { useEffect, useRef, type JSX } from 'react';

export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  private async loadSounds() {
    // Create synthetic sounds programmatically
    const sounds: Array<{ 
      name: string; 
      config: { frequency: number; duration: number; type: 'sine' | 'square' | 'sawtooth' | 'triangle' } 
    }> = [
      { name: 'keypress', config: { frequency: 800, duration: 0.05, type: 'square' } },
      { name: 'command', config: { frequency: 1200, duration: 0.1, type: 'sine' } },
      { name: 'error', config: { frequency: 200, duration: 0.3, type: 'sawtooth' } },
      { name: 'success', config: { frequency: 600, duration: 0.2, type: 'sine' } },
      { name: 'hack', config: { frequency: 1000, duration: 0.5, type: 'triangle' } },
      { name: 'alarm', config: { frequency: 400, duration: 1.0, type: 'square' } },
      { name: 'click', config: { frequency: 1200, duration: 0.08, type: 'square' } },
      { name: 'beep', config: { frequency: 800, duration: 0.15, type: 'sine' } },
      { name: 'loading', config: { frequency: 500, duration: 0.1, type: 'sine' } },
      { name: 'level_start', config: { frequency: 440, duration: 0.3, type: 'sine' } },
      { name: 'level_complete', config: { frequency: 1047, duration: 0.4, type: 'sine' } }
    ];

    for (const sound of sounds) {
      const buffer = this.createSyntheticSound(sound.config);
      this.sounds.set(sound.name, buffer);
    }
  }

  private createSyntheticSound({ frequency, duration, type = 'sine' }: { 
    frequency: number; 
    duration: number; 
    type?: 'sine' | 'square' | 'sawtooth' | 'triangle' 
  }): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const arrayBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = arrayBuffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      // Create envelope for smooth attack/decay
      const envelope = Math.exp(-t * 3); // Exponential decay
      
      let wave = 0;
      switch (type) {
        case 'sine':
          wave = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          wave = Math.sign(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          wave = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
        case 'triangle':
          wave = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
          break;
      }
      
      // Add subtle harmonics for richer sound
      if (type === 'sine') {
        wave += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.1; // Second harmonic
      }
      
      channelData[i] = wave * envelope * 0.2; // Volume control
    }

    return arrayBuffer;
  }

  playSound(soundName: string, volume: number = 1.0) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.get(soundName)!;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  playKeypressSound() {
    this.playSound('keypress', 0.1);
  }

  playCommandSound() {
    this.playSound('command', 0.3);
  }

  playErrorSound() {
    this.playSound('error', 0.5);
  }

  playSuccessSound() {
    this.playSound('success', 0.4);
  }

  playHackSound() {
    this.playSound('hack', 0.6);
  }

  playAlarmSound() {
    this.playSound('alarm', 0.3);
  }

  // New enhanced sound methods
  playClickSound() {
    this.playSound('click', 0.2);
  }

  playBeepSound() {
    this.playSound('beep', 0.3);
  }

  playLevelStartSound() {
    // Play ascending sequence for dramatic effect
    this.playSound('level_start', 0.4);
    setTimeout(() => this.playSound('level_start', 0.4), 120);
    setTimeout(() => this.playSound('level_start', 0.4), 240);
  }

  playLevelCompleteSound() {
    // Play triumphant sequence
    this.playSound('success', 0.3);
    setTimeout(() => this.playSound('level_complete', 0.5), 150);
  }

  playLoadingSequence() {
    // Play beep beep loading sound
    const playBeepSequence = (count: number) => {
      if (count > 0) {
        this.playBeepSound();
        setTimeout(() => playBeepSequence(count - 1), 200);
      }
    };
    playBeepSequence(5); // 5 beeps
  }

  // Typing sequence with realistic timing
  playTypingSequence(text: string, callback?: () => void) {
    if (!text) {
      callback?.();
      return;
    }
    
    let index = 0;
    const typeChar = () => {
      if (index < text.length) {
        this.playKeypressSound();
        index++;
        
        // Variable delay for realistic typing
        const char = text[index - 1];
        let delay = 50 + Math.random() * 50; // Base typing speed
        
        if (char === ' ') delay = 100; // Pause for spaces
        if (char === '\n') delay = 200; // Pause for new lines
        if (['.', '!', '?'].includes(char)) delay = 300; // Pause for punctuation
        
        setTimeout(typeChar, delay);
      } else {
        callback?.();
      }
    };
    
    typeChar();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getAudioContextState(): string {
    return this.audioContext?.state || 'not-available';
  }

  resumeAudioContext(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

interface SoundEffectsProps {
  children: React.ReactNode;
}

export function SoundEffects({ children }: SoundEffectsProps): JSX.Element {
  const soundManager = useRef<SoundManager | null>(null);

  useEffect(() => {
    soundManager.current = SoundManager.getInstance();
    
    // Auto-enable audio on first user interaction
    const enableAudio = () => {
      if (soundManager.current?.getAudioContextState() === 'suspended') {
        soundManager.current.resumeAudioContext();
      }
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  return React.createElement(React.Fragment, null, children);
}

// Hook for easy sound access
export function useSounds() {
  return SoundManager.getInstance();
}
