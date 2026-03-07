import { useReducer, useCallback } from 'react';
import { generateWorkout, getExerciseAlternatives, adjustWorkout } from '../services/workoutService';
import { flattenExercises, getExerciseType, parseWorkout } from '../utils/parseWorkout';

/** Pure sessionLog shape - serializable, no UI values */
export const SESSION_LOG_SHAPE = {
  workout_id: null,
  started_at: null,
  exercises: [],
};

function createEmptySessionLog(startedAt) {
  return {
    workout_id: null,
    started_at: startedAt ? new Date(startedAt).toISOString() : null,
    exercises: [],
  };
}

const initialState = {
  screen: 'input',
  workout: null,
  flatExercises: [],
  currentExerciseIndex: 0,
  currentSetIndex: 1,
  sessionLog: createEmptySessionLog(null),
  workoutStatus: 'preview',
  setWeights: [],
  supersetWeights: [],
  _currentExerciseSets: [],
  _currentCardioSets: [],
  startTime: null,
  error: null,
  lastInput: '',
  analysis: null,
  analysisLoading: false,
};

function getEffectiveSets(exercise, block) {
  const type = getExerciseType(exercise, block);
  if (type === 'cardio') return exercise.sets ?? block?.rounds ?? 1;
  if (type === 'timed' && !exercise.sets) return 1;
  return exercise.sets || 1;
}

function reducer(state, action) {
  switch (action.type) {
    case 'GENERATE_START':
      return { ...state, screen: 'loading', workoutStatus: 'preview', error: null, lastInput: action.input || state.lastInput };

    case 'GENERATE_SUCCESS': {
      const flat = flattenExercises(action.workout);
      return {
        ...state,
        screen: 'preview',
        workout: action.workout,
        flatExercises: flat,
        workoutStatus: 'preview',
        error: null,
        analysis: null,
      };
    }

    case 'GENERATE_ERROR':
      return { ...state, screen: 'input', workoutStatus: 'preview', error: action.error };

    case 'START_WORKOUT':
      const startTime = Date.now();
      return {
        ...state,
        screen: 'active',
        workoutStatus: 'active',
        currentExerciseIndex: 0,
        currentSetIndex: 1,
        sessionLog: createEmptySessionLog(startTime),
        setWeights: [],
        supersetWeights: [],
        _currentExerciseSets: [],
        _currentCardioSets: [],
        startTime,
        analysis: null,
        analysisLoading: false,
      };

    case 'COMPLETE_SET': {
      const exercise = state.flatExercises[state.currentExerciseIndex];
      const block = exercise._block;
      const exType = getExerciseType(exercise, block);
      const effectiveSets = getEffectiveSets(exercise, block);
      const blockName = block?.label || block?.name || '';

      if (exType === 'superset') {
        const payload = action.payload || {};
        const weight = payload.weight ?? action.weight;
        const partnerWeight = payload.partnerWeight ?? action.partnerWeight;
        const newSupersetWeights = [...state.supersetWeights, weight];
        const partnerWeights = partnerWeight != null
          ? [...(state._partnerWeights || []), partnerWeight]
          : state._partnerWeights || [];

        const isLastSet = state.currentSetIndex >= effectiveSets;
        if (!isLastSet) {
          return {
            ...state,
            currentSetIndex: state.currentSetIndex + 1,
            supersetWeights: newSupersetWeights,
            _partnerWeights: partnerWeights,
          };
        }

        const avgWeight = newSupersetWeights.length > 0
          ? Math.round(newSupersetWeights.reduce((s, w) => s + w, 0) / newSupersetWeights.length * 10) / 10
          : 0;
        const avgPartner = partnerWeights.length > 0
          ? Math.round(partnerWeights.reduce((s, w) => s + w, 0) / partnerWeights.length * 10) / 10
          : 0;

        const partnerId = exercise.superset_with;
        const partner = state.flatExercises.find((e) => e.id === partnerId);

        return {
          ...state,
          screen: 'rating',
          workoutStatus: 'active',
          supersetWeights: newSupersetWeights,
          _partnerWeights: partnerWeights,
          pendingLog: {
            name: exercise.name,
            block: blockName,
            sets: [{
              set_number: 1,
              target_reps: exercise.reps || (exercise.duration_seconds ? `${exercise.duration_seconds}s` : '—'),
              actual_reps: null,
              weight_kg: avgWeight,
              difficulty: null,
            }],
          },
          pendingSupersetLog: partner ? {
            name: partner.name,
            block: blockName,
            sets: [{
              set_number: 1,
              target_reps: partner.reps || (partner.duration_seconds ? `${partner.duration_seconds}s` : '—'),
              actual_reps: null,
              weight_kg: avgPartner,
              difficulty: null,
            }],
          } : null,
        };
      }

      const payload = action.payload || {};

      // Cardio: log actual duration and distance (or skipped); support multiple rounds
      if (exType === 'cardio' && payload.cardio) {
        const dur = payload.duration_seconds ?? 0;
        const dist = payload.distance_meters ?? 0;
        const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        const formatDist = (m) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
        const targetParts = [];
        if (exercise.duration_seconds) targetParts.push(formatTime(exercise.duration_seconds));
        if (exercise.distance_meters) targetParts.push(formatDist(exercise.distance_meters));
        const actualParts = [];
        if (dur > 0) actualParts.push(formatTime(dur));
        if (dist > 0) actualParts.push(formatDist(dist));
        const setEntry = {
          set_number: state.currentSetIndex,
          target_reps: targetParts.length ? targetParts.join(' / ') : '—',
          actual_reps: payload.skipped ? null : (actualParts.length ? actualParts.join(' / ') : '—'),
          weight_kg: 0,
          difficulty: null,
        };
        const isLastSet = state.currentSetIndex >= effectiveSets;
        if (!isLastSet) {
          const accumulated = [...(state._currentCardioSets || []), setEntry];
          return {
            ...state,
            currentSetIndex: state.currentSetIndex + 1,
            _currentCardioSets: accumulated,
          };
        }
        const allSets = [...(state._currentCardioSets || []), setEntry];
        const exerciseLog = {
          name: exercise.name,
          block: block?.label || block?.name || '',
          sets: allSets,
        };
        const newExercises = [...state.sessionLog.exercises, exerciseLog];
        const newSessionLog = { ...state.sessionLog, exercises: newExercises };
        const nextIndex = state.currentExerciseIndex + 1;
        const isLastExercise = nextIndex >= state.flatExercises.length;
        if (isLastExercise) {
          return {
            ...state,
            screen: 'complete',
            workoutStatus: 'complete',
            sessionLog: newSessionLog,
            _currentCardioSets: [],
          };
        }
        return {
          ...state,
          screen: 'rest',
          workoutStatus: 'rest',
          sessionLog: newSessionLog,
          _nextIndex: nextIndex,
          _currentCardioSets: [],
        };
      }

      const weightVal = payload.weight ?? action.weight ?? 0;
      const actualReps = payload.actualReps ?? 0;
      const targetReps = exercise.reps || (exercise.duration_seconds ? `${exercise.duration_seconds}s` : '—');

      const setEntry = {
        set_number: state.currentSetIndex,
        target_reps: targetReps,
        actual_reps: actualReps,
        weight_kg: Math.round(weightVal * 10) / 10,
        difficulty: null,
      };
      const newExerciseSets = [...(state._currentExerciseSets || []), setEntry];
      const isLastSet = state.currentSetIndex >= effectiveSets;

      if (!isLastSet) {
        return {
          ...state,
          currentSetIndex: state.currentSetIndex + 1,
          _currentExerciseSets: newExerciseSets,
        };
      }

      // Weight exercise last set: go to difficulty rating screen; sessionLog updated on RATE_EXERCISE/SKIP_RATING
      const pendingLog = {
        name: exercise.name,
        block: blockName,
        sets: newExerciseSets,
      };
      return {
        ...state,
        screen: 'rating',
        workoutStatus: 'active',
        pendingLog,
        pendingSupersetLog: null,
        _currentExerciseSets: [],
      };
    }

    case 'RATE_EXERCISE': {
      const applyDifficulty = (ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s, difficulty: action.rating })) });
      const entries = [
        applyDifficulty(state.pendingLog),
        ...(state.pendingSupersetLog ? [applyDifficulty(state.pendingSupersetLog)] : []),
      ];
      const newExercises = [...state.sessionLog.exercises, ...entries];
      const newSessionLog = { ...state.sessionLog, exercises: newExercises };

      let nextIndex = state.currentExerciseIndex + 1;
      if (state.pendingSupersetLog) {
        const partnerId = state.flatExercises[state.currentExerciseIndex]?.superset_with;
        const partnerIdx = state.flatExercises.findIndex((e) => e.id === partnerId);
        if (partnerIdx > nextIndex) nextIndex = partnerIdx + 1;
        else if (partnerIdx === nextIndex) nextIndex = partnerIdx + 1;
      }

      const isLastExercise = nextIndex >= state.flatExercises.length;

      if (isLastExercise) {
        return {
          ...state,
          screen: 'complete',
          workoutStatus: 'complete',
          sessionLog: newSessionLog,
          pendingLog: null,
          pendingSupersetLog: null,
        };
      }

      return {
        ...state,
        screen: 'rest',
        workoutStatus: 'rest',
        sessionLog: newSessionLog,
        pendingLog: null,
        pendingSupersetLog: null,
        _nextIndex: nextIndex,
      };
    }

    case 'SKIP_RATING': {
      const entries = [
        { ...state.pendingLog, sets: state.pendingLog.sets.map((s) => ({ ...s, difficulty: null })) },
        ...(state.pendingSupersetLog
          ? [{ ...state.pendingSupersetLog, sets: state.pendingSupersetLog.sets.map((s) => ({ ...s, difficulty: null })) }]
          : []),
      ];
      const newExercises = [...state.sessionLog.exercises, ...entries];
      const newSessionLog = { ...state.sessionLog, exercises: newExercises };

      let nextIndex = state.currentExerciseIndex + 1;
      if (state.pendingSupersetLog) {
        const partnerId = state.flatExercises[state.currentExerciseIndex]?.superset_with;
        const partnerIdx = state.flatExercises.findIndex((e) => e.id === partnerId);
        if (partnerIdx >= nextIndex) nextIndex = partnerIdx + 1;
      }

      const isLastExercise = nextIndex >= state.flatExercises.length;

      if (isLastExercise) {
        return {
          ...state,
          screen: 'complete',
          workoutStatus: 'complete',
          sessionLog: newSessionLog,
          pendingLog: null,
          pendingSupersetLog: null,
        };
      }

      return {
        ...state,
        screen: 'rest',
        workoutStatus: 'rest',
        sessionLog: newSessionLog,
        pendingLog: null,
        pendingSupersetLog: null,
        _nextIndex: nextIndex,
      };
    }

    case 'REST_COMPLETE': {
      const nextIndex = state._nextIndex != null
        ? state._nextIndex
        : state.currentExerciseIndex + 1;
      return {
        ...state,
        screen: 'active',
        workoutStatus: 'active',
        currentExerciseIndex: nextIndex,
        currentSetIndex: 1,
        setWeights: [],
        supersetWeights: [],
        _partnerWeights: [],
        _currentCardioSets: [],
        _nextIndex: null,
      };
    }

    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis, analysisLoading: false };

    case 'SET_ANALYSIS_LOADING':
      return { ...state, analysisLoading: true };

    case 'NEW_WORKOUT':
      return { ...initialState };

    case 'VIEW_HISTORY':
      return { ...state, screen: 'history', workoutStatus: 'preview' };

    case 'VIEW_PROFILE':
      return { ...state, screen: 'profile', workoutStatus: 'preview' };

    case 'LOAD_MOCK': {
      const flat = flattenExercises(action.workout);
      return {
        ...initialState,
        screen: 'preview',
        workout: action.workout,
        flatExercises: flat,
      };
    }

    case 'UPDATE_WORKOUT': {
      const flat = flattenExercises(action.workout);
      return {
        ...state,
        workout: action.workout,
        flatExercises: flat,
      };
    }

    case 'REPLACE_EXERCISE': {
      const { blockIndex, exerciseIndex, replacement } = action;
      const blocks = state.workout.blocks.map((block, bi) => {
        if (bi !== blockIndex) return block;
        const exercises = block.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          return {
            ...ex,
            name: replacement.name,
            id: replacement.id || ex.id,
          };
        });
        return { ...block, exercises };
      });
      const workout = { ...state.workout, blocks };
      const flat = flattenExercises(workout);
      return { ...state, workout, flatExercises: flat };
    }

    case 'UPDATE_EXERCISE': {
      const { blockIndex, exerciseIndex, updates } = action;
      const blocks = state.workout.blocks.map((block, bi) => {
        if (bi !== blockIndex) return block;
        const exercises = block.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          return { ...ex, ...updates };
        });
        return { ...block, exercises };
      });
      const workout = { ...state.workout, blocks };
      const flat = flattenExercises(workout);
      return { ...state, workout, flatExercises: flat };
    }

    case 'REMOVE_EXERCISE': {
      const { blockIndex, exerciseIndex } = action;
      const blocks = state.workout.blocks.map((block, bi) => {
        if (bi !== blockIndex) return block;
        const exercises = block.exercises.filter((_, ei) => ei !== exerciseIndex);
        return { ...block, exercises };
      }).filter((block) => block.exercises.length > 0);
      const workout = { ...state.workout, blocks };
      const flat = flattenExercises(workout);
      return { ...state, workout, flatExercises: flat };
    }

    case 'BACK_TO_INPUT':
      return { ...state, screen: 'input', error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

export function useWorkout(userId) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const generate = useCallback(async (userInput) => {
    dispatch({ type: 'GENERATE_START', input: userInput });
    try {
      const result = await generateWorkout(userInput, userId);
      if (result.success) {
        dispatch({ type: 'GENERATE_SUCCESS', workout: result.workout });
      } else {
        dispatch({ type: 'GENERATE_ERROR', error: result.error });
      }
    } catch (err) {
      dispatch({
        type: 'GENERATE_ERROR',
        error: err.message || 'Failed to generate workout',
      });
    }
  }, [userId]);

  const loadWorkoutFromText = useCallback((rawText) => {
    const result = parseWorkout(rawText);
    if (result.success) {
      dispatch({ type: 'GENERATE_SUCCESS', workout: result.workout });
      return { success: true };
    }
    dispatch({ type: 'GENERATE_ERROR', error: result.error ?? 'Failed to parse workout.' });
    return { success: false, error: result.error };
  }, []);

  const fetchAlternatives = useCallback(async (exercise, block, workoutGoal) => {
    return getExerciseAlternatives(
      exercise,
      block?.type || 'strength',
      workoutGoal || state.lastInput || 'general fitness',
      null
    );
  }, [state.lastInput]);

  const replaceExercise = useCallback((blockIndex, exerciseIndex, replacement) => {
    dispatch({ type: 'REPLACE_EXERCISE', blockIndex, exerciseIndex, replacement });
  }, []);

  const updateExercise = useCallback((blockIndex, exerciseIndex, updates) => {
    dispatch({ type: 'UPDATE_EXERCISE', blockIndex, exerciseIndex, updates });
  }, []);

  const removeExercise = useCallback((blockIndex, exerciseIndex) => {
    dispatch({ type: 'REMOVE_EXERCISE', blockIndex, exerciseIndex });
  }, []);

  const applyAdjustment = useCallback(async (instruction) => {
    if (!state.workout || !instruction?.trim()) return;
    const updated = await adjustWorkout(state.workout, instruction.trim());
    dispatch({ type: 'UPDATE_WORKOUT', workout: updated });
  }, [state.workout]);

  return {
    state,
    dispatch,
    generate,
    loadWorkoutFromText,
    fetchAlternatives,
    replaceExercise,
    updateExercise,
    removeExercise,
    applyAdjustment,
  };
}
