/**
 * Storage service. All DB writes go through here.
 * Uses Supabase - no direct localStorage.
 */
import { supabase } from '../lib/supabase';

/**
 * Save a workout template. Returns workout id.
 */
export async function saveWorkoutTemplate(userId, title, blocks) {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      title: title || 'Workout',
      blocks: blocks || [],
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Create a session. Returns session id.
 */
export async function createSession(userId, workoutId, title, startedAt, completedAt) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      workout_id: workoutId || null,
      title: title || 'Workout',
      started_at: startedAt,
      completed_at: completedAt,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Save all sets for a session in one batch.
 */
export async function saveSetBatch(sessionId, sets) {
  if (!sets?.length) return;

  const rows = sets.map((s) => {
    const row = {
      session_id: sessionId,
      exercise_name: s.exercise_name,
      block_label: s.block_label,
      set_number: s.set_number,
      target_reps: s.target_reps,
      actual_reps: s.actual_reps,
      weight_kg: s.weight_kg,
      difficulty: s.difficulty,
    };
    // completion_status: for adaptive logic (run migration 003 first)
    if (s.completion_status != null) row.completion_status = s.completion_status;
    return row;
  });

  const { error } = await supabase.from('sets').insert(rows);
  if (error) throw error;
}

/**
 * Flatten sessionLog exercises into sets array for saveSetBatch.
 */
function sessionLogToSets(sessionLog) {
  const sets = [];
  for (const ex of sessionLog.exercises || []) {
    const blockLabel = ex.block || '';
    for (const s of ex.sets || []) {
      const row = {
        exercise_name: ex.name,
        block_label: blockLabel,
        set_number: s.set_number,
        target_reps: s.target_reps != null ? String(s.target_reps) : null,
        actual_reps: s.actual_reps,
        weight_kg: s.weight_kg,
        difficulty: s.difficulty,
      };
      if (s.completion_status != null) row.completion_status = s.completion_status;
      sets.push(row);
    }
  }
  return sets;
}

/**
 * Save a completed session: creates session + sets in one flow.
 */
export async function saveCompletedSession(userId, sessionLog, workout, durationSeconds) {
  const startedAt = sessionLog?.started_at ?? new Date().toISOString();
  const completedAt = new Date().toISOString();

  const title = workout?.title ?? 'Workout';
  const sessionId = await createSession(
    userId,
    sessionLog?.workout_id ?? null,
    title,
    startedAt,
    completedAt
  );

  const sets = sessionLogToSets(sessionLog);
  await saveSetBatch(sessionId, sets);

  return {
    id: sessionId,
    date: completedAt,
    title: workout?.title ?? 'Workout',
    duration_seconds: durationSeconds,
    workout_id: sessionLog?.workout_id ?? null,
    started_at: startedAt,
    exercises: sessionLog?.exercises ?? [],
  };
}

/**
 * Fetch user history (sessions + sets) as legacy-compatible format.
 */
export async function fetchUserHistory(userId) {
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, workout_id, title, started_at, completed_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (sessionsError) throw sessionsError;
  if (!sessions?.length) return [];

  const { data: sets, error: setsError } = await supabase
    .from('sets')
    .select('session_id, exercise_name, block_label, set_number, target_reps, actual_reps, weight_kg, difficulty')
    .in('session_id', sessions.map((s) => s.id));

  if (setsError) throw setsError;

  const setsBySession = {};
  for (const s of sets || []) {
    if (!setsBySession[s.session_id]) setsBySession[s.session_id] = [];
    setsBySession[s.session_id].push(s);
  }

  const exercisesBySession = {};
  for (const sid of Object.keys(setsBySession)) {
    const sessionSets = setsBySession[sid];
    const byExercise = {};
    for (const row of sessionSets) {
      const key = `${row.exercise_name}|${row.block_label}`;
      if (!byExercise[key]) {
        byExercise[key] = { name: row.exercise_name, block: row.block_label, sets: [] };
      }
      byExercise[key].sets.push({
        set_number: row.set_number,
        target_reps: row.target_reps,
        actual_reps: row.actual_reps,
        weight_kg: row.weight_kg,
        difficulty: row.difficulty,
      });
    }
    exercisesBySession[sid] = Object.values(byExercise);
  }

  return sessions.map((s) => {
    const completedAt = new Date(s.completed_at);
    const startedAt = new Date(s.started_at);
    const durationSeconds = Math.round((completedAt - startedAt) / 1000);
    return {
      id: s.id,
      date: s.completed_at,
      title: s.title || 'Workout',
      duration_seconds: durationSeconds,
      workout_id: s.workout_id,
      started_at: s.started_at,
      exercises: exercisesBySession[s.id] || [],
    };
  });
}

/**
 * Get recent history for workout generation context.
 */
export async function getRecentHistory(userId, limit = 5) {
  const history = await fetchUserHistory(userId);
  return history.slice(0, limit);
}

/**
 * Get all workouts for analysis. Same shape as legacy getWorkouts().
 */
export async function getWorkouts(userId) {
  return fetchUserHistory(userId);
}
