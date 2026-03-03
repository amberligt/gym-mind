/**
 * GYMmind Architecture Types
 *
 * Future-ready interfaces for:
 * - Multi-day structured training blocks
 * - Daily adaptive workout adjustments
 * - Performance-based progression
 * - Recovery-based modifications
 *
 * These types are NOT wired into UI yet. They define the schema for future expansion.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Training Block (Future Use)
// ─────────────────────────────────────────────────────────────────────────────

/** Multi-day program (e.g. 10-day block). Not yet in DB or UI. */
export interface TrainingBlock {
  id: string;
  user_id: string;
  goal: string;
  duration_days: number;
  split_structure: string;
  created_at: string;
}

/** Single day within a training block. Holds planned workout structure. */
export interface TrainingDay {
  id: string;
  training_block_id: string;
  day_number: number;
  focus: string;
  planned_structure: WorkoutTemplate;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Workout Template (Day-Compatible)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Current workout structure. Can be nested under:
 *   TrainingBlock → TrainingDay → WorkoutTemplate
 *
 * planned_structure in TrainingDay stores this shape.
 * Structural compatibility: ✓
 */
export interface WorkoutTemplate {
  title: string;
  estimated_duration_minutes: number;
  blocks: WorkoutBlock[];
}

export interface WorkoutBlock {
  label: string;
  name: string;
  duration_minutes: number;
  type: "warmup" | "strength" | "hypertrophy" | "circuit" | "superset" | "cardio" | "cooldown";
  rounds: number | null;
  rest_between_rounds_seconds: number | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  superset_with: string | null;
  sets: number | null;
  reps: string | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  suggested_weight_kg: number | null;
  rest_seconds: number | null;
  notes: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Session Execution (Actual Performance)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Session logging captures everything needed for adaptive logic.
 * Enables future computation of: performance trend, volume load, fatigue indicators.
 */
export interface SessionExecution {
  id: string;
  user_id: string;
  workout_id: string | null;
  title: string;
  started_at: string;
  completed_at: string;
  completion_status?: SessionCompletionStatus;
  exercises: SessionExerciseLog[];
}

export type SessionCompletionStatus = "completed" | "partial" | "abandoned";

export interface SessionExerciseLog {
  name: string;
  block: string;
  sets: SessionSetLog[];
}

export interface SessionSetLog {
  set_number: number;
  target_reps: string | null;
  actual_reps: number | null;
  weight_kg: number | null;
  difficulty: number | null;
  completion_status?: SetCompletionStatus;
}

export type SetCompletionStatus = "completed" | "partial" | "skipped" | "failed";

// ─────────────────────────────────────────────────────────────────────────────
// 4. Recovery Input (Placeholder)
// ─────────────────────────────────────────────────────────────────────────────

/** User-perceived recovery before/after session. UI not built yet. */
export interface RecoveryInput {
  session_id: string;
  perceived_recovery: "fresh" | "normal" | "fatigued" | "very_fatigued";
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Future AI Adaptation Strategy (Documentation Only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FUTURE AI ADAPTATION STRATEGY (not implemented)
 *
 * When building daily adaptive adjustments, Claude will receive:
 *   - Last 3 sessions (SessionExecution[])
 *   - Difficulty averages per exercise
 *   - Missed reps (actual_reps < target)
 *   - RecoveryInput for most recent session
 *   - Planned TrainingDay (planned_structure = WorkoutTemplate)
 *
 * Claude should adjust:
 *   - Weight suggestions (suggested_weight_kg)
 *   - Rep ranges (reps string)
 *   - Exercise substitutions (alternatives API)
 *
 * Do NOT implement until feature is scoped.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 6. Layer Separation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LAYER SEPARATION (confirmed)
 *
 * 1. TrainingBlock   — Long-term plan (e.g. 10-day program). Future table: training_blocks.
 * 2. TrainingDay     — One day in block. Future table: training_days. planned_structure = WorkoutTemplate.
 * 3. WorkoutTemplate — Daily structure (title, blocks, exercises). Current table: workouts.
 * 4. SessionExecution — Actual performance (what user did). Current table: sessions + sets.
 *
 * Flow: TrainingBlock → TrainingDay → WorkoutTemplate (plan)
 *       SessionExecution references workout_id (execution of a plan)
 */
