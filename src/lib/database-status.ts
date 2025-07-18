import { SupabaseAPI } from './api';

export class DatabaseStatus {
  private static isConnected = false;
  private static lastChecked = 0;
  private static checkInterval = 30000; // 30 seconds

  static async checkConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Only check if it's been more than the interval or first time
    if (now - this.lastChecked > this.checkInterval) {
      this.isConnected = await SupabaseAPI.checkDatabaseConnection();
      this.lastChecked = now;
    }
    
    return this.isConnected;
  }

  static isOnline(): boolean {
    return this.isConnected;
  }

  static getStatusMessage(): string {
    return this.isConnected 
      ? 'Connected to Supabase Database' 
      : 'Using Local Storage (Database Offline)';
  }

  static getStatusColor(): string {
    return this.isConnected ? 'text-green-500' : 'text-yellow-500';
  }
}
