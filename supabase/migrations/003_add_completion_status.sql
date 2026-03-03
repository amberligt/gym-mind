-- Prepare session data for adaptive logic.
-- completion_status enables future fatigue/performance analytics.
-- No UI change; column is nullable, populated when feature is implemented.

ALTER TABLE sets
ADD COLUMN IF NOT EXISTS completion_status TEXT;

COMMENT ON COLUMN sets.completion_status IS 'Future: completed | partial | skipped | failed. For performance trend / fatigue indicators.';
