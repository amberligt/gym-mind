-- Allow suggest_weights action in rate limit (same cost as generate)
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

  IF p_action NOT IN ('generate', 'analyse', 'alternatives', 'adjust', 'parse_profile', 'suggest_weights') THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Invalid action');
  END IF;

  v_window_start := date_trunc('minute', now());
  v_limit := CASE p_action
    WHEN 'generate' THEN 5
    WHEN 'analyse' THEN 5
    WHEN 'alternatives' THEN 20
    WHEN 'adjust' THEN 10
    WHEN 'parse_profile' THEN 5
    WHEN 'suggest_weights' THEN 5
    ELSE 10
  END;

  INSERT INTO api_rate_limits (user_id, action, window_start, request_count)
  VALUES (v_user_id, p_action, v_window_start, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  v_allowed := v_count <= v_limit;

  IF NOT v_allowed THEN
    v_retry_after := 60 - EXTRACT(SECOND FROM now())::INT;
    IF v_retry_after < 1 THEN v_retry_after := 60; END IF;
  END IF;

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
