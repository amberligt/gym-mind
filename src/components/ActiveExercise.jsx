import { useState, useEffect, useRef } from 'react';
import { getExerciseType } from '../utils/parseWorkout';
import { DIFFICULTY_RATINGS } from '../constants/rating';

const RATING_ICONS = {
  1: IconTooLight,
  2: IconGood,
  3: IconTooHard,
};

function IconTooLight() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M7 12l5 5 5-5" />
    </svg>
  );
}
function IconGood() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function IconTooHard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M7 12l5-5 5 5" />
    </svg>
  );
}

export function InlineRatingStrip({ interactive, onRate, onSkip, selectedRating }) {
  return (
    <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#475569] mb-3">How was that set?</p>
      <div className="flex gap-3">
        {DIFFICULTY_RATINGS.map((r) => {
          const isSelected = selectedRating === r.value;
          const Icon = RATING_ICONS[r.value];
          return (
            <button
              key={r.value}
              type="button"
              aria-label={r.label}
              onClick={() => interactive && onRate?.(r.value)}
              disabled={!interactive}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all px-3 py-4 shadow-sm ${
                interactive
                  ? isSelected
                    ? 'border-[#F97316] bg-[#F97316] text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)]'
                    : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#FED7AA] hover:bg-[#FFF7ED] hover:shadow-md active:scale-[0.98]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
              }`}
            >
              {Icon && (
                <span className="flex items-center justify-center [&_svg]:stroke-current" aria-hidden>
                  <Icon />
                </span>
              )}
              <span className="text-sm font-semibold">{r.label}</span>
            </button>
          );
        })}
      </div>
      {interactive && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full text-[#475569] text-sm font-medium text-center py-2 min-h-[44px] flex items-center justify-center"
        >
          Skip
        </button>
      )}
    </div>
  );
}

export default function ActiveExercise({
  exercise,
  partner,
  currentSet,
  exerciseIndex,
  totalExercises,
  flatExercises,
  onCompleteSet,
}) {
  const block = exercise._block;
  const exType = getExerciseType(exercise, block);

  if (exType === 'superset' && partner) {
    return (
      <SupersetView
        exercise={exercise}
        partner={partner}
        currentSet={currentSet}
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        block={block}
        onCompleteSet={onCompleteSet}
      />
    );
  }

  if (exType === 'timed') {
    return (
      <TimedView
        exercise={exercise}
        currentSet={currentSet}
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        block={block}
        onCompleteSet={onCompleteSet}
      />
    );
  }

  if (exType === 'cardio') {
    return (
      <CardioView
        exercise={exercise}
        currentSet={currentSet}
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        block={block}
        onCompleteSet={onCompleteSet}
      />
    );
  }

  return (
    <WeightView
      exercise={exercise}
      currentSet={currentSet}
      exerciseIndex={exerciseIndex}
      totalExercises={totalExercises}
      flatExercises={flatExercises}
      block={block}
      onCompleteSet={onCompleteSet}
    />
  );
}

export function ProgressBar({ exerciseIndex, totalExercises, flatExercises, blockName }) {
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex gap-1 mb-2">
        {flatExercises.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-sm transition-all duration-300"
            style={{
              backgroundColor:
                i < exerciseIndex
                  ? '#F97316'
                  : i === exerciseIndex
                    ? 'rgba(249,115,22,0.4)'
                    : '#E2E8F0',
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#475569]">
        <span>{blockName}</span>
        <span>{exerciseIndex + 1} of {totalExercises}</span>
      </div>
    </div>
  );
}

/** Set progress dots: completed (solid orange), current (peachy), upcoming (gray) + "Set X of Y" */
export function SetTracker({ totalSets, currentSet }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSets }).map((_, i) => {
        const setNum = i + 1;
        const isCompleted = setNum < currentSet;
        const isCurrent = setNum === currentSet;
        return (
          <div
            key={i}
            className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-150 ${
              isCompleted
                ? 'bg-[#F97316]'
                : isCurrent
                  ? 'bg-[#FDBA74]'
                  : 'bg-[#E2E8F0]'
            }`}
          />
        );
      })}
      <span className="text-sm text-[#64748B] ml-2">
        Set {currentSet} of {totalSets}
      </span>
    </div>
  );
}

function WeightView({ exercise, currentSet, exerciseIndex, totalExercises, flatExercises, block, onCompleteSet }) {
  const [weight, setWeight] = useState(String(exercise.suggested_weight_kg || 0));
  const targetReps = exercise.reps ? (exercise.reps.includes('-') ? exercise.reps.split('-')[0] : exercise.reps) : null;
  const targetRepsNum = targetReps ? parseInt(targetReps, 10) : 0;
  const [actualReps, setActualReps] = useState(targetRepsNum || 0);

  useEffect(() => {
    setWeight(String(exercise.suggested_weight_kg || 0));
  }, [exercise.name, currentSet, exercise.suggested_weight_kg]);

  useEffect(() => {
    setActualReps(targetRepsNum || 0);
  }, [exercise.name, currentSet, targetRepsNum]);

  const effectiveSets = exercise.sets || 1;

  const handleDone = () => {
    onCompleteSet({
      weight: parseFloat(weight) || 0,
      actualReps: actualReps || 0,
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ProgressBar
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        blockName={block?.label || block?.name || ''}
      />

      <div className="px-6 pt-6 pb-2 text-center shrink-0">
        <h1 className="text-3xl font-semibold text-[#0F172A]">{exercise.name}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 min-h-0">
        {effectiveSets > 1 && <SetTracker totalSets={effectiveSets} currentSet={currentSet} />}

        <p className="text-3xl font-bold text-[#0F172A]">
          {exercise.reps} <span className="text-[#475569] text-xl font-normal">reps</span>
        </p>

        <div className="w-full max-w-xs text-center">
          <label className="block text-xs uppercase tracking-wider text-[#475569] mb-2">
            Weight (kg)
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full text-center text-[60px] font-extrabold font-mono bg-transparent text-[#0F172A] outline-none border-b-2 border-transparent focus:border-[#3B82F6] transition-colors py-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-[1.5px] text-[#999999]">Actual reps</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActualReps((r) => Math.max(0, r - 1))}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-lg active:opacity-70"
            >
              −
            </button>
            <span className="min-w-[3ch] text-center text-2xl font-bold font-mono text-[#0F172A] tabular-nums">
              {actualReps}
            </span>
            <button
              type="button"
              onClick={() => setActualReps((r) => r + 1)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-lg active:opacity-70"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <button
          onClick={handleDone}
          className="w-full min-h-[56px] py-4 bg-[#F97316] text-white text-lg font-semibold rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-all active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function TimedView({ exercise, currentSet, exerciseIndex, totalExercises, flatExercises, block, onCompleteSet }) {
  const duration = exercise.duration_seconds || 30;
  const effectiveSets = exercise.sets || 1;
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const endTimeRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
    setIsComplete(false);
    endTimeRef.current = null;
  }, [exercise.name, currentSet, duration]);

  useEffect(() => {
    if (!running) return;
    endTimeRef.current = Date.now() + remaining * 1000;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        setRunning(false);
        setIsComplete(true);
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 45;
  const timerProgress = duration > 0 ? ((duration - remaining) / duration) * circumference : 0;

  const handleStartPause = () => {
    if (isComplete) {
      onCompleteSet({});
    } else {
      setRunning(!running);
    }
  };

  const handleSkip = () => {
    setIsComplete(true);
    setRunning(false);
    onCompleteSet({});
  };

  const blockName = block?.label || block?.name || '';

  // Orange dot at the end of the timer arc (12 o'clock = start; dot at arc head)
  const angle = -Math.PI / 2 + (timerProgress / circumference) * 2 * Math.PI;
  const dotR = 45;
  const dotCx = 112 + dotR * Math.cos(angle);
  const dotCy = 112 + dotR * Math.sin(angle);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden bg-[#FAFAFA]">
      <ProgressBar
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        blockName={blockName}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
        <h2 className="text-2xl font-bold text-[#1E293B] mb-8">{exercise.name}</h2>

        {/* Set dots — completed (solid orange), current (lighter orange), upcoming (light gray) */}
        {effectiveSets > 1 && (
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: effectiveSets }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 < currentSet
                    ? 'bg-[#F97316]'
                    : i + 1 === currentSet
                      ? 'bg-[#FDBA74]'
                      : 'bg-[#E2E8F0]'
                }`}
              />
            ))}
            <span className="text-sm text-[#64748B] ml-2">
              Set {currentSet} of {effectiveSets}
            </span>
          </div>
        )}

        {/* Timer circle — thin light gray track, orange gradient arc, dot at arc head */}
        <div className="relative mb-12 w-56 h-56 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 224 224" aria-hidden>
            <circle
              cx="112"
              cy="112"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-[#E2E8F0]/50"
            />
            <circle
              cx="112"
              cy="112"
              r="45"
              fill="none"
              stroke="url(#timed-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - timerProgress}
              className={`transition-all ${running ? 'duration-1000 ease-linear' : 'duration-300'}`}
            />
            {/* Raised orange dot at the top where the arc begins / at arc head */}
            <circle
              cx={dotCx}
              cy={dotCy}
              r="5"
              fill="#f97316"
              className="drop-shadow-sm"
            />
            <defs>
              <linearGradient id="timed-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl font-extrabold font-mono tabular-nums text-[#1E293B]">
                {formatTime(remaining)}
              </div>
              <div className="text-sm text-[#64748B] mt-2">
                {isComplete ? 'Complete!' : 'remaining'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls — primary gradient + shadow, secondary white + thin border */}
        <div className="flex gap-4 shrink-0">
          <button
            type="button"
            onClick={handleStartPause}
            className="px-8 py-4 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white rounded-full font-bold shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:from-[#f97316] hover:to-[#ea580c] active:scale-[0.98] transition-all flex items-center gap-2 min-h-[56px]"
          >
            {isComplete ? (
              <>
                <IconSkipForward className="w-5 h-5" />
                Next
              </>
            ) : running ? (
              <>
                <IconPause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <IconPlay className="w-5 h-5" />
                {remaining === duration ? 'Start' : 'Resume'}
              </>
            )}
          </button>
          {!isComplete && (
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-4 bg-white border border-[#E2E8F0] text-[#475569] rounded-full font-medium hover:bg-[#F8FAFC] active:opacity-80 transition-all min-h-[56px]"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
    </svg>
  );
}
function IconSkipForward() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 18l8.5-6L4 6v12zm9-12v12h2V6h-2z" />
    </svg>
  );
}

function CardioView({ exercise, currentSet = 1, exerciseIndex, totalExercises, flatExercises, block, onCompleteSet }) {
  const defaultDuration = exercise.duration_seconds ?? 300; // 5 min
  const defaultDistance = exercise.distance_meters ?? 2500; // 2.5 km
  const effectiveSets = exercise.sets ?? exercise.rounds ?? block?.rounds ?? 1;

  const [phase, setPhase] = useState('setup'); // 'setup' | 'running' | 'paused'
  const [plannedDurationSec, setPlannedDurationSec] = useState(defaultDuration);
  const [plannedDistanceM, setPlannedDistanceM] = useState(defaultDistance);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [loggedDistanceM, setLoggedDistanceM] = useState(0); // user can update during workout
  const [showStopModal, setShowStopModal] = useState(false);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const loggedDistanceMRef = useRef(0);
  const plannedDurationSecRef = useRef(plannedDurationSec);
  const hasAutoFinishedRef = useRef(false);
  loggedDistanceMRef.current = loggedDistanceM;
  plannedDurationSecRef.current = plannedDurationSec;

  const hasDuration = plannedDurationSec > 0;
  const hasDistance = plannedDistanceM > 0;

  // Timer tick when running; auto-finish when duration target reached
  useEffect(() => {
    if (phase !== 'running') return;
    startTimeRef.current = startTimeRef.current ?? Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + elapsedRef.current;
      setElapsedSec(elapsed);
      if (plannedDurationSecRef.current > 0 && elapsed >= plannedDurationSecRef.current && !hasAutoFinishedRef.current) {
        hasAutoFinishedRef.current = true;
        onCompleteSet({
          duration_seconds: elapsed,
          distance_meters: loggedDistanceMRef.current,
          cardio: true,
        });
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, onCompleteSet]);


  const handleStart = () => {
    hasAutoFinishedRef.current = false;
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    setPhase('running');
  };

  const handlePause = () => {
    elapsedRef.current = elapsedSec;
    startTimeRef.current = null;
    setPhase('paused');
  };

  const handleResume = () => {
    startTimeRef.current = Date.now();
    setPhase('running');
  };

  const handleFinish = () => {
    onCompleteSet({
      duration_seconds: elapsedSec,
      distance_meters: loggedDistanceM,
      cardio: true,
    });
  };

  const handleSkip = () => {
    onCompleteSet({ duration_seconds: 0, distance_meters: 0, cardio: true, skipped: true });
  };

  const handleStopModalLog = () => {
    setShowStopModal(false);
    onCompleteSet({
      duration_seconds: elapsedSec,
      distance_meters: loggedDistanceM,
      cardio: true,
    });
  };

  const handleStopModalContinue = () => {
    setShowStopModal(false);
    setPhase('running');
    startTimeRef.current = Date.now();
  };

  const handleStopModalDiscard = () => {
    setShowStopModal(false);
    onCompleteSet({ duration_seconds: 0, distance_meters: 0, cardio: true, skipped: true });
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const remainingSec = Math.max(0, plannedDurationSec - elapsedSec);
  const blockName = block?.label || block?.name || '';

  // Editable duration: minutes component
  const durationMins = Math.floor(plannedDurationSec / 60);
  const durationSecs = plannedDurationSec % 60;
  const setDurationFromMinsSecs = (mins, secs) => setPlannedDurationSec(mins * 60 + secs);

  const distanceKm = (plannedDistanceM / 1000).toFixed(1);
  const loggedKm = (loggedDistanceM / 1000).toFixed(1);
  const progressPct = hasDistance && plannedDistanceM > 0 ? Math.min(100, (loggedDistanceM / plannedDistanceM) * 100) : 0;

  const isActive = phase === 'running' || phase === 'paused';

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#FAFAFA]">
      <ProgressBar
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        blockName={blockName}
      />

      <div className="px-6 pt-4 pb-2 text-center shrink-0">
        <h1 className="text-2xl font-bold text-[#0F172A]">{exercise.name}</h1>
        {effectiveSets > 1 && (
          <div className="mt-2">
            <SetTracker totalSets={effectiveSets} currentSet={currentSet} />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 min-h-0 overflow-y-auto">
        {/* Setup: editable metric cards */}
        {!isActive && (
          <>
            {hasDuration && (
              <div className="w-full max-w-xs bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-1">Duration</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setPlannedDurationSec(Math.max(0, plannedDurationSec - 30))}
                    className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="text-[48px] font-extrabold font-mono tabular-nums text-[#0F172A] min-w-[4ch] text-center">
                    {formatTime(plannedDurationSec)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPlannedDurationSec(plannedDurationSec + 30)}
                    className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-[#475569] text-sm mt-1">minutes</p>
              </div>
            )}
            {hasDistance && (
              <div className="w-full max-w-xs bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475569] mb-1">Distance</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setPlannedDistanceM(Math.max(0, plannedDistanceM - 250))}
                    className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="text-[48px] font-extrabold font-mono tabular-nums text-[#0F172A] min-w-[5ch] text-center">
                    {plannedDistanceM >= 1000 ? `${(plannedDistanceM / 1000).toFixed(1)} km` : `${plannedDistanceM} m`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPlannedDistanceM(plannedDistanceM + 250)}
                    className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-[#475569] text-sm mt-1">target</p>
              </div>
            )}
          </>
        )}

        {/* Running / Paused: timer dominant, then distance progress */}
        {isActive && (
          <>
            <div className="relative w-56 h-56 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 224 224" aria-hidden>
                <circle cx="112" cy="112" r="45" fill="none" stroke="#E2E8F0" strokeWidth="8" className="text-[#E2E8F0]/50" />
                <circle
                  cx="112"
                  cy="112"
                  r="45"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - (hasDuration ? Math.min(1, elapsedSec / plannedDurationSec) : (hasDistance && plannedDistanceM > 0 ? Math.min(1, loggedDistanceM / plannedDistanceM) : 0)))}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold font-mono tabular-nums text-[#0F172A]">
                  {hasDuration ? formatTime(remainingSec) : formatTime(elapsedSec)}
                </span>
                <span className="text-sm text-[#475569] mt-1">
                  {hasDuration ? 'remaining' : 'elapsed'}
                </span>
              </div>
            </div>
            {hasDistance && (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm text-[#475569] mb-1">
                  <span>{loggedKm} / {distanceKm} km</span>
                </div>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F97316] rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {phase === 'running' && (
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setLoggedDistanceM((d) => Math.max(0, d - 100))}
                      className="text-xs text-[#1E3A8A] font-medium"
                    >
                      −0.1 km
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoggedDistanceM((d) => d + 100)}
                      className="text-xs text-[#1E3A8A] font-medium"
                    >
                      +0.1 km
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-3">
        {!isActive && (
          <>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 min-h-[56px] py-4 bg-[#F97316] text-white rounded-full font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.35)] active:scale-[0.98]"
              >
                <IconPlay className="w-5 h-5" />
                Start
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-4 bg-white border-2 border-[#E2E8F0] text-[#475569] rounded-full font-medium min-h-[56px]"
              >
                Skip
              </button>
            </div>
          </>
        )}
        {phase === 'running' && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePause}
              className="flex-1 min-h-[56px] py-4 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-full font-semibold flex items-center justify-center gap-2 min-h-[56px]"
            >
              <IconPause className="w-5 h-5" />
              Pause
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 min-h-[56px] py-4 bg-[#F97316] text-white rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <IconCheck className="w-5 h-5" />
              Finish
            </button>
          </div>
        )}
        {phase === 'paused' && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleResume}
              className="flex-1 min-h-[56px] py-4 bg-[#F97316] text-white rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <IconPlay className="w-5 h-5" />
              Resume
            </button>
            <button
              type="button"
              onClick={() => setShowStopModal(true)}
              className="flex-1 min-h-[56px] py-4 bg-white border-2 border-[#E2E8F0] text-[#475569] rounded-full font-semibold"
            >
              Stop workout
            </button>
          </div>
        )}
      </div>

      {/* Stop early confirmation modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="stop-cardio-title">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in duration-200">
            <h2 id="stop-cardio-title" className="text-lg font-bold text-[#0F172A]">Stop workout early?</h2>
            <div className="mt-4 text-sm text-[#475569] space-y-1">
              <p>Completed: {formatTime(elapsedSec)} of {formatTime(plannedDurationSec)}</p>
              {hasDistance && <p>Distance: {loggedKm} km</p>}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStopModalLog}
                className="w-full min-h-[48px] py-3 bg-[#F97316] text-white rounded-xl font-semibold"
              >
                Log progress
              </button>
              <button
                type="button"
                onClick={handleStopModalContinue}
                className="w-full min-h-[48px] py-3 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl font-semibold"
              >
                Continue workout
              </button>
              <button
                type="button"
                onClick={handleStopModalDiscard}
                className="w-full min-h-[48px] py-3 text-[#475569] font-medium"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-4-4" />
    </svg>
  );
}

function SupersetView({ exercise, partner, currentSet, exerciseIndex, totalExercises, flatExercises, block, onCompleteSet }) {
  const [weightA, setWeightA] = useState(String(exercise.suggested_weight_kg || 0));
  const [weightB, setWeightB] = useState(String(partner.suggested_weight_kg || 0));
  const effectiveSets = exercise.sets || 1;

  useEffect(() => {
    setWeightA(String(exercise.suggested_weight_kg || 0));
    setWeightB(String(partner.suggested_weight_kg || 0));
  }, [exercise.name, partner.name, currentSet, exercise.suggested_weight_kg, partner.suggested_weight_kg]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ProgressBar
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        blockName={block?.label || block?.name || ''}
      />

      <div className="px-6 pt-4 pb-2 text-center">
        <p className="text-xs uppercase tracking-wider text-[#1E3A8A] font-semibold mb-1">Superset</p>
        {effectiveSets > 1 && <SetTracker totalSets={effectiveSets} currentSet={currentSet} />}
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        <SupersetExerciseCard
          sequenceLabel="A1"
          exercise={exercise}
          weight={weightA}
          onWeightChange={setWeightA}
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#475569] uppercase tracking-wider">then</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>
        <SupersetExerciseCard
          sequenceLabel="A2"
          exercise={partner}
          weight={weightB}
          onWeightChange={setWeightB}
        />
      </div>

      <div className="px-6 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <button
          onClick={() => onCompleteSet({
            weight: parseFloat(weightA) || 0,
            partnerWeight: parseFloat(weightB) || 0,
          })}
          className="w-full min-h-[56px] py-4 bg-[#F97316] text-white text-lg font-semibold rounded-full active:scale-[0.98]"
        >
          Done — both exercises
        </button>
      </div>
    </div>
  );
}

function SupersetExerciseCard({ sequenceLabel, exercise, weight, onWeightChange }) {
  const showWeight = exercise.suggested_weight_kg != null;

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
      <h2 className="text-xl font-semibold text-center text-[#0F172A]">
        {sequenceLabel && <span className="text-[#1E3A8A] font-bold mr-2">{sequenceLabel}</span>}
        {exercise.name}
      </h2>
      <div className="text-center mt-3">
        <p className="text-3xl font-bold text-[#0F172A]">
          {exercise.reps} <span className="text-[#475569] text-lg font-normal">reps</span>
        </p>
      </div>
      {showWeight && (
        <div className="mt-3">
          <label className="block text-xs uppercase tracking-wider text-[#475569] text-center mb-1">Weight (kg)</label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full text-center text-[30px] font-bold bg-transparent text-[#0F172A] outline-none border-b-2 border-transparent focus:border-[#3B82F6] rounded-none py-2 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
