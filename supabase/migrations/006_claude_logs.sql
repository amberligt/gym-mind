-- Log prompts and responses for Claude edge function
-- Tracks: user, action, request payload, and Claude output.

CREATE TABLE claude_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE claude_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own claude logs"
  ON claude_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own claude logs"
  ON claude_logs FOR SELECT
  USING (auth.uid() = user_id);

