-- Sample data for development and testing
-- This file inserts sample users and scores for testing the leaderboard functionality

-- Insert sample users
INSERT INTO public.users (username, total_score, levels_completed) VALUES
    ('CyberNinja', 4500, 5),
    ('HackerPro', 4200, 4),
    ('Detective101', 3800, 4),
    ('SecurityGuru', 3500, 3),
    ('CodeBreaker', 3200, 3),
    ('DataSleuth', 2900, 2),
    ('CyberSleuth', 2600, 2),
    ('InfoSecPro', 2300, 2),
    ('DigitalPI', 2000, 1),
    ('CyberCop', 1700, 1)
ON CONFLICT (username) DO NOTHING;

-- Insert sample scores for different levels
WITH user_ids AS (
    SELECT id, username FROM public.users WHERE username IN (
        'CyberNinja', 'HackerPro', 'Detective101', 'SecurityGuru', 'CodeBreaker'
    )
)
INSERT INTO public.scores (user_id, level_id, score, completion_time, hints_used, wrong_commands) 
SELECT 
    u.id,
    'level-' || level_num,
    base_score + random_bonus,
    completion_time,
    hints_used,
    wrong_commands
FROM user_ids u
CROSS JOIN (
    VALUES 
        (1, 950, 1200, 0, 2),
        (2, 880, 1800, 1, 3),
        (3, 820, 2400, 2, 4),
        (4, 780, 3000, 1, 5),
        (5, 720, 3600, 3, 6)
) AS level_data(level_num, base_score, completion_time, hints_used, wrong_commands)
CROSS JOIN (
    VALUES 
        (50),   -- CyberNinja gets bonus
        (20),   -- HackerPro gets smaller bonus
        (10),   -- Detective101 gets small bonus
        (0),    -- SecurityGuru gets no bonus
        (-20)   -- CodeBreaker gets penalty
) AS bonus_data(random_bonus)
WHERE (u.username = 'CyberNinja' AND random_bonus = 50)
   OR (u.username = 'HackerPro' AND random_bonus = 20 AND level_num <= 4)
   OR (u.username = 'Detective101' AND random_bonus = 10 AND level_num <= 4)
   OR (u.username = 'SecurityGuru' AND random_bonus = 0 AND level_num <= 3)
   OR (u.username = 'CodeBreaker' AND random_bonus = -20 AND level_num <= 3)
ON CONFLICT (user_id, level_id) DO NOTHING;

-- Update the updated_at timestamp for all users
UPDATE public.users SET updated_at = NOW() WHERE total_score > 0;
