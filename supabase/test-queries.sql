-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'scores');

-- 2. Check if the leaderboard view exists
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'leaderboard';

-- 3. Test inserting a sample user (optional)
INSERT INTO public.users (username) 
VALUES ('TestAgent') 
ON CONFLICT (username) DO NOTHING
RETURNING *;

-- 4. Check if the trigger is working by viewing users
SELECT * FROM public.users LIMIT 5;

-- 5. Test the leaderboard view
SELECT * FROM public.leaderboard LIMIT 5;
