/**
 * Workout-related API calls. All Claude calls go via Supabase Edge Function.
 * No secrets in frontend.
 */
import { parseWorkout } from '../utils/parseWorkout';
import { supabase } from '../lib/supabase';
import { getRecentHistory, getWorkouts } from './storageService';
import { fetchProfile } from './profileService';
import * as Sentry from '@sentry/react';

async function invokeClaudeEdge(action, payload) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error('Session error. Please sign in again.');
  }
  if (!session?.access_token) {
    throw new Error('Not signed in. Please sign in and try again.');
  }

  // Use Supabase Functions client so it attaches the correct headers/JWT.
  const { data, error } = await supabase.functions.invoke('claude-workout', {
    body: { action, payload },
  });

  if (error) {
    const status = error.status ?? 500;
    const msg = error.message || `API error ${status}`;
    Sentry.captureException(new Error(msg), {
      tags: { area: 'workoutService', action },
      extra: { status, payload, error },
    });
    if (status === 401 || /not authenticated|invalid jwt/i.test(msg)) {
      throw new Error('Session expired. Please sign out and sign in again.');
    }
    if (status === 429 && typeof (error as any).context?.retry_after_seconds === 'number') {
      const secs = (error as any).context.retry_after_seconds;
      throw new Error(`${msg} Try again in ${secs} seconds.`);
    }
    throw new Error(msg);
  }
  return data;
}

export async function generateWorkout(userInput, userId) {
  const [history, profileRow] = await Promise.all([
    userId ? getRecentHistory(userId, 5) : [],
    userId ? fetchProfile(userId) : null,
  ]);
  const profile = profileRow?.profile_json ?? null;

  const { raw } = await invokeClaudeEdge('generate', {
    userInput,
    history,
    profile,
  });
  return parseWorkout(raw);
}

export async function analyseWorkoutHistory(currentSession, userId) {
  const [allSessions, profileRow] = await Promise.all([
    userId ? getWorkouts(userId) : [],
    userId ? fetchProfile(userId) : null,
  ]);
  const profile = profileRow?.profile_json ?? null;

  try {
    const { analysis } = await invokeClaudeEdge('analyse', {
      current_session: currentSession,
      all_sessions: allSessions,
      profile,
    });
    return { success: true, analysis };
  } catch {
    return { success: false, error: 'Analysis failed' };
  }
}

export async function getExerciseAlternatives(originalExercise, blockType, workoutGoal, equipment = null) {
  const { alternatives } = await invokeClaudeEdge('alternatives', {
    original_exercise: typeof originalExercise === 'object' ? originalExercise : { name: originalExercise },
    block_type: blockType,
    workout_goal: workoutGoal || 'general fitness',
    equipment,
  });
  return alternatives;
}

export async function parseProfile(rawText) {
  const { profile } = await invokeClaudeEdge('parse_profile', { rawText });
  return profile;
}

export async function adjustWorkout(workout, adjustmentInstruction) {
  const { raw } = await invokeClaudeEdge('adjust', {
    workout,
    adjustment: adjustmentInstruction,
  });
  const result = parseWorkout(raw);
  if (!result.success) {
    throw new Error(result.error || 'Invalid workout response');
  }
  return result.workout;
}
