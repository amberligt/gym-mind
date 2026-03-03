export function parseWorkout(raw) {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.blocks)) {
      throw new Error('Missing blocks array');
    }

    parsed.title = parsed.title || 'Workout';
    parsed.estimated_duration_minutes = Number(parsed.estimated_duration_minutes) || 45;

    parsed.blocks = parsed.blocks.map((block, bi) => ({
      label: block.label || block.name || `Block ${bi + 1}`,
      name: block.name || block.label || `Block ${bi + 1}`,
      duration_minutes: Number(block.duration_minutes) || 0,
      type: block.type || 'strength',
      rounds: block.rounds != null ? Number(block.rounds) : null,
      rest_between_rounds_seconds: block.rest_between_rounds_seconds != null
        ? Number(block.rest_between_rounds_seconds)
        : null,
      exercises: (block.exercises || []).map((ex, ei) => ({
        id: ex.id || `ex-${bi}-${ei}`,
        name: ex.name || 'Exercise',
        superset_with: ex.superset_with || null,
        sets: ex.sets != null ? Number(ex.sets) : null,
        reps: ex.reps != null ? String(ex.reps) : null,
        duration_seconds: ex.duration_seconds != null ? Number(ex.duration_seconds) : null,
        distance_meters: ex.distance_meters != null ? Number(ex.distance_meters) : null,
        suggested_weight_kg: ex.suggested_weight_kg != null ? Number(ex.suggested_weight_kg) : null,
        rest_seconds: ex.rest_seconds != null ? Number(ex.rest_seconds) : null,
        notes: ex.notes || null,
      })),
    }));

    return { success: true, workout: parsed };
  } catch {
    return { success: false, error: 'Failed to parse workout. Please try again.' };
  }
}

export function flattenExercises(workout) {
  if (!workout?.blocks) return [];
  const flat = [];
  for (const block of workout.blocks) {
    for (const ex of block.exercises) {
      flat.push({ ...ex, _block: block });
    }
  }
  return flat;
}

export function getExerciseType(exercise, block) {
  if (exercise.superset_with) return 'superset';
  if (block?.type === 'cardio' || block?.type === 'warmup' || block?.type === 'cooldown') {
    if (exercise.duration_seconds || exercise.distance_meters) return 'cardio';
  }
  if (exercise.duration_seconds && !exercise.sets) return 'timed';
  if (exercise.duration_seconds && exercise.sets) return 'timed';
  return 'weight';
}
