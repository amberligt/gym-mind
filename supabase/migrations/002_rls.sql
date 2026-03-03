-- Row Level Security: users see only their own data

-- workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- sets (accessed via session ownership; sets inherit session's user_id conceptually)
-- We restrict sets via session_id: user can only insert sets for their own sessions
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select sets for own sessions"
  ON sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = sets.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sets for own sessions"
  ON sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = sets.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sets for own sessions"
  ON sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = sets.session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = sets.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sets for own sessions"
  ON sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = sets.session_id AND s.user_id = auth.uid()
    )
  );
