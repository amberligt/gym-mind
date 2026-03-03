-- API rate limiting: per-user, per-action, 1-minute sliding window
-- Protects Claude API calls from abuse

-- Per-action limits (requests per minute per user)
-- generate/analyse/adjust: expensive | alternatives/parse_profile: cheaper
CREATE TABLE IF NOT EXISTS api_rate_limits (
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action, window_start)
);

-- Only the rate-limit function needs access; users cannot read/write directly
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies: deny all direct access. Function uses SECURITY DEFINER.
CREATE POLICY "Deny all direct access"
  ON api_rate_limits FOR ALL
  USING (false)
  WITH CHECK (false);

-- Rate limits per action (requests per minute)
-- To change limits, update this function.
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(p_action TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_window_start TIMESTAMPTZ;
  v_limit INT;
  v_count INT;
  v_allowed BOOLEAN;
  v_retry_after INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Not authenticated');
  END IF;

  -- Validate action
  IF p_action NOT IN ('generate', 'analyse', 'alternatives', 'adjust', 'parse_profile') THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Invalid action');
  END IF;

  v_window_start := date_trunc('minute', now());
  v_limit := CASE p_action
    WHEN 'generate' THEN 5
    WHEN 'analyse' THEN 5
    WHEN 'alternatives' THEN 20
    WHEN 'adjust' THEN 10
    WHEN 'parse_profile' THEN 5
    ELSE 10
  END;

  -- Upsert: increment count for this user/action/window
  INSERT INTO api_rate_limits (user_id, action, window_start, request_count)
  VALUES (v_user_id, p_action, v_window_start, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  v_allowed := v_count <= v_limit;

  -- Retry-After: seconds until next window
  IF NOT v_allowed THEN
    v_retry_after := 60 - EXTRACT(SECOND FROM now())::INT;
    IF v_retry_after < 1 THEN v_retry_after := 60; END IF;
  END IF;

  -- Prune old windows occasionally (keeps table small)
  IF random() < 0.01 THEN
    PERFORM prune_old_rate_limits();
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_count),
    'reset_seconds', CASE WHEN v_allowed THEN NULL ELSE v_retry_after END
  );
END;
$$;

-- Cleanup old windows (run periodically; optional)
-- Keeps table small. Could be a pg_cron job or run on each request (delete old rows).
CREATE OR REPLACE FUNCTION prune_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM api_rate_limits
  WHERE window_start < now() - interval '5 minutes';
$$;

COMMENT ON TABLE api_rate_limits IS 'Per-user, per-action rate limits for Claude API calls. Do not query directly.';
COMMENT ON FUNCTION check_and_increment_rate_limit(TEXT) IS 'Check and increment rate limit. Returns {allowed, limit, remaining, reset_seconds}.';

GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(TEXT) TO authenticated;
