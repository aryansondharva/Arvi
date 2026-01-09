-- Add missing INSERT policy for leaderboard table
-- Users should be able to create their own leaderboard entry
CREATE POLICY "Users can insert their own leaderboard entry"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also allow users to update their own leaderboard stats
CREATE POLICY "Users can update their own leaderboard entry"
  ON leaderboard FOR UPDATE
  USING (auth.uid() = user_id);
