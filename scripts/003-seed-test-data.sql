-- Seed some test events for demonstration
-- Note: You'll need real user IDs from auth.users after signing up

-- Insert sample events (using placeholder organizer_id - will need to be updated after user signup)
-- These are just examples and won't work until you create an account

-- To use this platform:
-- 1. Go to /auth/signup and create an account with your email and password
-- 2. Check your email for the confirmation link (if email confirmation is enabled)
-- 3. Log in at /auth/login
-- 4. You'll be redirected to /dashboard

-- Your account will automatically:
-- - Create a profile in the profiles table
-- - Create a leaderboard entry
-- - Allow you to create and join events

-- Example event data structure (for reference):
-- INSERT INTO events (organizer_id, title, description, location, latitude, longitude, start_date, end_date, max_participants, category, difficulty)
-- VALUES (
--   'YOUR-USER-ID-HERE',
--   'Beach Cleanup at Santa Monica',
--   'Join us for a morning beach cleanup to protect our ocean wildlife.',
--   'Santa Monica Beach, CA',
--   34.0195,
--   -118.4912,
--   NOW() + INTERVAL '7 days',
--   NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
--   50,
--   'beach-cleanup',
--   'beginner'
-- );
