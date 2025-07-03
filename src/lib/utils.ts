import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generate random IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Format time duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

// Format timestamp
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

// Validate username
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: "Username is required" };
  }
  
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  
  if (username.length > 20) {
    return { valid: false, error: "Username must be no more than 20 characters" };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, hyphens, and underscores" };
  }
  
  return { valid: true };
}

// Generate anonymous username
export function generateAnonymousUsername(): string {
  const adjectives = [
    "anonymous", "phantom", "ghost", "shadow", "cipher",
    "binary", "digital", "cyber", "neural", "quantum",
    "matrix", "vector", "crypto", "stealth", "virtual"
  ];
  
  const nouns = [
    "hacker", "detective", "agent", "decoder", "analyst",
    "runner", "hunter", "seeker", "finder", "solver",
    "coder", "tracer", "scanner", "breaker", "guardian"
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${adjective}_${noun}_${number}`;
}

// Command parsing utilities
export function parseCommand(input: string): { command: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  const command = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);
  
  return { command, args };
}

// Terminal text formatting
export function formatTerminalOutput(text: string, type: 'output' | 'error' | 'warning' | 'info' = 'output'): string {
  const timestamp = new Date().toLocaleTimeString();
  
  switch (type) {
    case 'error':
      return `[${timestamp}] ERROR: ${text}`;
    case 'warning':
      return `[${timestamp}] WARNING: ${text}`;
    case 'info':
      return `[${timestamp}] INFO: ${text}`;
    default:
      return text;
  }
}

// Hash utilities (for puzzles)
export async function hashString(input: string, algorithm: 'md5' | 'sha1' | 'sha256'): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side fallback
    const crypto = await import('crypto');
    return crypto.createHash(algorithm).update(input).digest('hex');
  }
  
  // Client-side using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  let hashAlgorithm: string;
  switch (algorithm) {
    case 'md5':
      // MD5 not available in Web Crypto API, fallback to SHA-256
      hashAlgorithm = 'SHA-256';
      break;
    case 'sha1':
      hashAlgorithm = 'SHA-1';
      break;
    case 'sha256':
      hashAlgorithm = 'SHA-256';
      break;
    default:
      hashAlgorithm = 'SHA-256';
  }
  
  const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Base64 utilities
export function encodeBase64(input: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64');
  }
  return btoa(input);
}

export function decodeBase64(input: string): string {
  try {
    if (typeof window === 'undefined') {
      return Buffer.from(input, 'base64').toString('utf-8');
    }
    return atob(input);
  } catch {
    throw new Error('Invalid Base64 string');
  }
}

// Hex utilities
export function encodeHex(input: string): string {
  return Array.from(input)
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

export function decodeHex(input: string): string {
  if (input.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  
  const pairs = input.match(/.{2}/g) || [];
  return pairs
    .map(pair => String.fromCharCode(parseInt(pair, 16)))
    .join('');
}

// URL utilities
export function encodeURL(input: string): string {
  return encodeURIComponent(input);
}

export function decodeURL(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    throw new Error('Invalid URL encoding');
  }
}

// File size formatting
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Score calculation
export function calculateScore(
  basePoints: number,
  completionTime: number,
  timeThreshold: number,
  timeBonus: number,
  hintsUsed: number,
  hintPenalty: number,
  wrongCommands: number,
  wrongCommandPenalty: number,
  noHintsBonus: number
): number {
  let score = basePoints;
  
  // Time bonus
  if (completionTime <= timeThreshold) {
    score += timeBonus;
  }
  
  // No hints bonus
  if (hintsUsed === 0) {
    score += noHintsBonus;
  }
  
  // Penalties
  score -= hintsUsed * hintPenalty;
  score -= wrongCommands * wrongCommandPenalty;
  
  // Ensure score is not negative
  return Math.max(0, score);
}

// Local storage utilities
export function saveToLocalStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
