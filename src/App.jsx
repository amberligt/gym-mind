import { useState, useEffect } from 'react';
import { AuthProvider, useAuth, AuthContext } from './context/AuthContext';
import { ProfileProvider, useProfile, ProfileContext } from './context/ProfileContext';
import { WorkoutProvider, useWorkoutContext } from './context/WorkoutContext';
import { DEMO_WORKOUT } from './data/demoWorkout';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import ProfileView from './components/ProfileView';
import ChatInput from './components/ChatInput';
import WorkoutPreview from './components/WorkoutPreview';
import ActiveExercise from './components/ActiveExercise';
import DifficultyRating from './components/DifficultyRating';
import RestTimer from './components/RestTimer';
import WorkoutComplete from './components/WorkoutComplete';
import History from './components/History';
import ExerciseTypesIntro from './components/ExerciseTypesIntro';

function AppContent() {
  const {
    state,
    dispatch,
    generate,
    loadWorkoutFromText,
    fetchAlternatives,
    replaceExercise,
    updateExercise,
    removeExercise,
    applyAdjustment,
  } = useWorkoutContext();

  const flatExercises = state.flatExercises || [];
  const currentExercise = flatExercises[state.currentExerciseIndex];
  const totalExercises = flatExercises.length;

  const partner = currentExercise?.superset_with
    ? flatExercises.find((e) => e.id === currentExercise.superset_with)
    : null;

  const restSeconds = (() => {
    if (!currentExercise) return 60;
    if (currentExercise._block?.rest_between_rounds_seconds) {
      return currentExercise._block.rest_between_rounds_seconds;
    }
    return currentExercise.rest_seconds || 60;
  })();

  const nextIndex = state._nextIndex != null
    ? state._nextIndex
    : state.currentExerciseIndex + 1;
  const nextExercise = flatExercises[nextIndex];

  const { profile, resetProfile } = useProfile();

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      {state.screen === 'profile' ? (
        <ProfileView
          profile={profile}
          onBack={() => dispatch({ type: 'BACK_TO_INPUT' })}
          onRecalculate={() => dispatch({ type: 'BACK_TO_INPUT' })}
          onResetProfile={async () => {
            await resetProfile();
            window.location.reload();
          }}
        />
      ) : (state.screen === 'input' || state.screen === 'loading') ? (
        <ChatInput
          onGenerate={generate}
          onLoadWorkoutFromText={loadWorkoutFromText}
          loading={state.screen === 'loading'}
          error={state.error}
          onClearError={() => dispatch({ type: 'CLEAR_ERROR' })}
          onViewHistory={() => dispatch({ type: 'VIEW_HISTORY' })}
          onViewProfile={() => dispatch({ type: 'VIEW_PROFILE' })}
        />
      ) : null}

      {state.screen === 'preview' && (
        <WorkoutPreview
          workout={state.workout}
          onStart={() => dispatch({ type: 'START_WORKOUT' })}
          onRegenerate={() => generate(state.lastInput)}
          fetchAlternatives={fetchAlternatives}
          replaceExercise={replaceExercise}
          updateExercise={updateExercise}
          removeExercise={removeExercise}
          applyAdjustment={applyAdjustment}
        />
      )}

      {state.screen === 'active' && currentExercise && (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <ActiveExercise
          exercise={currentExercise}
          partner={partner}
          currentSet={state.currentSetIndex}
          exerciseIndex={state.currentExerciseIndex}
          totalExercises={totalExercises}
          flatExercises={flatExercises}
          onCompleteSet={(payload) => {
            if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
              dispatch({ type: 'COMPLETE_SET', payload });
            } else {
              dispatch({ type: 'COMPLETE_SET', weight: payload ?? 0 });
            }
          }}
        />
        </div>
      )}

      {state.screen === 'rating' && (
        <DifficultyRating
          exerciseName={
            state.pendingSupersetLog
              ? `${state.pendingLog?.name ?? ''} + ${state.pendingSupersetLog?.name ?? ''}`
              : state.pendingLog?.name ?? ''
          }
          onRate={(rating) => dispatch({ type: 'RATE_EXERCISE', rating })}
          onSkip={() => dispatch({ type: 'SKIP_RATING' })}
          flatExercises={flatExercises}
          exerciseIndex={state.currentExerciseIndex}
          totalExercises={totalExercises}
          blockName={
            flatExercises[state.currentExerciseIndex]?._block?.label ||
            flatExercises[state.currentExerciseIndex]?._block?.name ||
            ''
          }
        />
      )}

      {state.screen === 'rest' && (
        <RestTimer
          seconds={restSeconds}
          lastCompletedExerciseName={(() => {
            const exs = state.sessionLog?.exercises ?? [];
            const last = exs[exs.length - 1];
            return last?.name ?? null;
          })()}
          lastCompletedSetText={(() => {
            const exs = state.sessionLog?.exercises ?? [];
            const last = exs[exs.length - 1];
            const n = last?.sets?.length ?? 0;
            return n > 0 ? `Set ${n} of ${n} completed` : null;
          })()}
          nextExerciseName={nextExercise?.name}
          nextSetText={nextExercise ? `Set 1 of ${nextExercise.sets ?? nextExercise._block?.rounds ?? 1}` : null}
          nextExercise={nextExercise}
          onComplete={() => dispatch({ type: 'REST_COMPLETE' })}
          onSkip={() => dispatch({ type: 'REST_COMPLETE' })}
        />
      )}

      {state.screen === 'complete' && (
        <WorkoutComplete
          sessionLog={state.sessionLog}
          startTime={state.startTime}
          workout={state.workout}
          analysis={state.analysis}
          analysisLoading={state.analysisLoading}
          dispatch={dispatch}
          onNewWorkout={() => dispatch({ type: 'NEW_WORKOUT' })}
          onViewHistory={() => dispatch({ type: 'VIEW_HISTORY' })}
        />
      )}

      {state.screen === 'history' && (
        <History
          onBack={() => dispatch({ type: 'BACK_TO_INPUT' })}
          onNewWorkout={() => dispatch({ type: 'NEW_WORKOUT' })}
          onViewProfile={() => dispatch({ type: 'VIEW_PROFILE' })}
        />
      )}
    </div>
  );
}

function AppInner() {
  const { user, loading, needsPasswordReset } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="h-6 w-24 rounded animate-skeleton-pulse bg-[#E2E8F0]" />
      </div>
    );
  }

  if (!user || needsPasswordReset) {
    return <Auth />;
  }

  return (
    <ProfileProvider>
      <AppInnerWithProfile />
    </ProfileProvider>
  );
}

const EXERCISE_TYPES_SEEN_KEY = 'mygym_has_seen_exercise_types';

function isDemoMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('demo') === '1';
}

const DEMO_USER = { id: 'demo', email: 'demo@example.com' };

const mockAuthValue = {
  user: DEMO_USER,
  loading: false,
  needsPasswordReset: false,
  clearPasswordReset: () => {},
  signInWithPassword: async () => {},
  signUpWithPassword: async () => {},
  signInWithMagicLink: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
};

const mockProfileValue = {
  profile: { profile_json: {} },
  hasProfile: true,
  loading: false,
  refreshProfile: async () => {},
  resetProfile: async () => {},
};

function DemoWorkoutSeeder({ children }) {
  const { state, dispatch } = useWorkoutContext();
  useEffect(() => {
    if (state.screen === 'input' && !state.workout) {
      dispatch({ type: 'GENERATE_SUCCESS', workout: DEMO_WORKOUT });
    }
  }, [state.screen, state.workout, dispatch]);
  return children;
}

function DemoRoot() {
  return (
    <AuthContext.Provider value={mockAuthValue}>
      <ProfileContext.Provider value={mockProfileValue}>
        <WorkoutProvider>
          <DemoWorkoutSeeder>
            <AppContent />
          </DemoWorkoutSeeder>
        </WorkoutProvider>
      </ProfileContext.Provider>
    </AuthContext.Provider>
  );
}

function useShowExerciseTypesIntro() {
  const forceShow = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('show_exercise_types') === '1';
  const [hasSeen, setHasSeen] = useState(() =>
    forceShow ? false : (typeof localStorage !== 'undefined' && localStorage.getItem(EXERCISE_TYPES_SEEN_KEY) === 'true')
  );
  return [forceShow ? false : hasSeen, setHasSeen];
}

function AppInnerWithProfile() {
  const { hasProfile, loading, refreshProfile } = useProfile();
  const [hasSeenExerciseTypes, setHasSeenExerciseTypes] = useShowExerciseTypesIntro();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="h-6 w-24 rounded animate-skeleton-pulse bg-[#E2E8F0]" />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <Onboarding onComplete={refreshProfile} />
    );
  }

  const showExerciseTypesIntro =
    hasProfile && (new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('show_exercise_types') === '1' || !hasSeenExerciseTypes);
  if (showExerciseTypesIntro) {
    return (
      <ExerciseTypesIntro
        onBack={() => {
          try {
            localStorage.setItem(EXERCISE_TYPES_SEEN_KEY, 'true');
          } catch (_) {}
          setHasSeenExerciseTypes(true);
        }}
      />
    );
  }

  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}

function App() {
  if (isDemoMode()) {
    return <DemoRoot />;
  }
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
