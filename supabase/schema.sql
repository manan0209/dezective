-- Dezective Database Schema
-- This file contains the complete database schema for the Dezective game

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_score INTEGER DEFAULT 0,
    levels_completed INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
    CONSTRAINT total_score_positive CHECK (total_score >= 0),
    CONSTRAINT levels_completed_positive CHECK (levels_completed >= 0)
);

-- Scores table
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    completion_time INTEGER NOT NULL, -- in seconds
    hints_used INTEGER DEFAULT 0,
    wrong_commands INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT score_positive CHECK (score >= 0),
    CONSTRAINT completion_time_positive CHECK (completion_time > 0),
    CONSTRAINT hints_used_positive CHECK (hints_used >= 0),
    CONSTRAINT wrong_commands_positive CHECK (wrong_commands >= 0),
    
    -- Unique constraint to prevent duplicate scores for same user/level
    UNIQUE(user_id, level_id)
);

-- Leaderboard view for efficient querying
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    u.username,
    u.total_score,
    u.levels_completed,
    RANK() OVER (ORDER BY u.total_score DESC, u.levels_completed DESC, u.created_at ASC) as rank
FROM public.users u
WHERE u.levels_completed > 0
ORDER BY rank;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON public.users(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_level_id ON public.scores(level_id);
CREATE INDEX IF NOT EXISTS idx_scores_score ON public.scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_completed_at ON public.scores(completed_at DESC);

-- Function to update user stats after score submission
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total score and levels completed
    UPDATE public.users 
    SET 
        total_score = (
            SELECT COALESCE(SUM(score), 0) 
            FROM public.scores 
            WHERE user_id = NEW.user_id
        ),
        levels_completed = (
            SELECT COUNT(DISTINCT level_id) 
            FROM public.scores 
            WHERE user_id = NEW.user_id
        ),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats when scores are inserted/updated
DROP TRIGGER IF EXISTS trigger_update_user_stats ON public.scores;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_stats();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all user data (for leaderboards)
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

-- Policy: Users can only update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (true); -- We'll handle this in the application layer

-- Policy: Users can insert their own user record
CREATE POLICY "Users can insert own record" ON public.users
    FOR INSERT WITH CHECK (true); -- We'll handle this in the application layer

-- Policy: Users can read all scores (for leaderboards)
CREATE POLICY "Users can view all scores" ON public.scores
    FOR SELECT USING (true);

-- Policy: Users can insert their own scores
CREATE POLICY "Users can insert own scores" ON public.scores
    FOR INSERT WITH CHECK (true); -- We'll handle this in the application layer

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.scores TO anon, authenticated;
GRANT SELECT ON public.leaderboard TO anon, authenticated;
