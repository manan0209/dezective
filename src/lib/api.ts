import { User } from '../types';
import { Database, supabase } from './supabase';

type DbScore = Database['public']['Tables']['scores']['Row'];
type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row'];

export class SupabaseAPI {
  private static isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  // User Management
  static async createUser(username: string): Promise<User | null> {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured, using local storage');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ username }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        totalScore: data.total_score,
        levelsCompleted: data.levels_completed,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        return null;
      }

      // Get user's rank
      const { data: rankData, error: rankError } = await supabase
        .from('users')
        .select('id')
        .gt('total_score', data.total_score)
        .order('total_score', { ascending: false });

      const rank = rankError ? undefined : (rankData?.length || 0) + 1;

      return {
        id: data.id,
        username: data.username,
        totalScore: data.total_score,
        levelsCompleted: data.levels_completed,
        createdAt: data.created_at,
        rank,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async updateUserStats(
    userId: string,
    totalScore: number,
    levelsCompleted: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          total_score: totalScore,
          levels_completed: levelsCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user stats:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  // Score Management
  static async submitScore(
    userId: string,
    levelId: string,
    score: number,
    completionTime: number,
    hintsUsed: number = 0,
    wrongCommands: number = 0
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scores')
        .insert([{
          user_id: userId,
          level_id: levelId,
          score,
          completion_time: completionTime,
          hints_used: hintsUsed,
          wrong_commands: wrongCommands,
        }]);

      if (error) {
        console.error('Error submitting score:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      return false;
    }
  }

  static async getUserScores(userId: string): Promise<DbScore[]> {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user scores:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user scores:', error);
      return [];
    }
  }

  static async getLevelLeaderboard(levelId: string, limit: number = 10): Promise<DbScore[]> {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          *,
          users (username)
        `)
        .eq('level_id', levelId)
        .order('score', { ascending: false })
        .order('completion_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching level leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching level leaderboard:', error);
      return [];
    }
  }

  static async getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching global leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      return [];
    }
  }

  // Utility functions
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      // If no error and no data, username is available
      return !data;
    } catch {
      // If error is because no rows returned, username is available
      return true;
    }
  }

  static async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      console.error('Database connection failed');
      return false;
    }
  }
}
