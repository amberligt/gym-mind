import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { WorkoutProvider, useWorkoutContext } from './context/WorkoutContext';
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

function AppContent() {
  const {
    state,
    dispatch,
    generate,
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
          loading={state.screen === 'loading'}
          error={state.error}
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
          nextExerciseName={nextExercise?.name}
          currentSet={state.currentSetIndex}
          totalSets={(() => {
            if (!currentExercise) return 1;
            if (currentExercise.duration_seconds && !currentExercise.sets) return 1;
            return currentExercise.sets || 1;
          })()}
          lastSet={(() => {
            const exs = state.sessionLog?.exercises ?? [];
            const last = exs[exs.length - 1];
            const sets = last?.sets ?? [];
            const s = sets[sets.length - 1];
            return s ? { reps: s.actual_reps, weight: s.weight_kg } : null;
          })()}
          nextTarget={currentExercise?.reps}
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

function AppInnerWithProfile() {
  const { hasProfile, loading, refreshProfile } = useProfile();

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

  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
