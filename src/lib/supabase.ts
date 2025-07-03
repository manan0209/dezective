import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only throw error in production if env vars are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('Missing Supabase environment variables. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          total_score: number;
          levels_completed: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          created_at?: string;
          total_score?: number;
          levels_completed?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          total_score?: number;
          levels_completed?: number;
          updated_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          level_id: string;
          score: number;
          completion_time: number;
          hints_used: number;
          wrong_commands: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level_id: string;
          score: number;
          completion_time: number;
          hints_used?: number;
          wrong_commands?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level_id?: string;
          score?: number;
          completion_time?: number;
          hints_used?: number;
          wrong_commands?: number;
          completed_at?: string;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          username: string;
          total_score: number;
          levels_completed: number;
          rank: number;
        };
      };
    };
  };
}
