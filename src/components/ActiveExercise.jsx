import { useState, useEffect, useRef } from 'react';
import { getExerciseType } from '../utils/parseWorkout';

const RATINGS = [
  { value: 1, label: 'Too Easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Perfect' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Failed' },
];

export function InlineRatingStrip({ interactive, onRate, onSkip, selectedRating }) {
  return (
      <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
      <p className="text-xs uppercase tracking-wider text-[#475569] mb-2">How hard?</p>
      <div className="flex gap-2 justify-between">
        {RATINGS.map((r) => {
          const isSelected = selectedRating === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => interactive && onRate?.(r.value)}
              disabled={!interactive}
              className={`flex-1 min-w-[44px] min-h-[44px] aspect-square flex items-center justify-center rounded-xl border-2 font-bold text-sm transition-all ${
                interactive
                  ? isSelected
                    ? 'border-[#F97316] bg-[#F97316] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#F97316] hover:bg-[#FFF7ED] active:opacity-70'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
              }`}
            >
              {r.value}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2 justify-between px-1">
        {RATINGS.map((r) => (
          <span key={r.value} className="flex-1 text-xs text-[#475569] text-center truncate">
            {r.label}
          </span>
        ))}
      </div>
      {interactive && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full text-[#475569] text-sm text-center py-2"
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

export function SetTracker({ totalSets, currentSet }) {
  const circles = [];
  for (let i = 1; i <= totalSets; i++) {
    const isCompleted = i < currentSet;
    const isCurrent = i === currentSet;
    circles.push(
      <div
        key={i}
        className="rounded-full flex-shrink-0 transition-all duration-150"
        style={{
          width: 16,
          height: 16,
          backgroundColor: isCompleted ? '#F97316' : isCurrent ? 'transparent' : '#E2E8F0',
          border: isCurrent ? '2px solid #F97316' : 'none',
          marginRight: i < totalSets ? 8 : 0,
        }}
      />
    );
  }
  return (
    <div className="flex items-center justify-center" style={{ gap: 0 }}>
      {circles}
    </div>
  );
}

function WeightView({ exercise, currentSet, exerciseIndex, totalExercises, flatExercises, block, onCompleteSet }) {
  const [weight, setWeight] = useState(String(exercise.suggested_weight_kg || 0));
  const targetReps = exercise.reps ? (exercise.reps.includes('-') ? exercise.reps.split('-')[0] : exercise.reps) : null;
  const targetRepsNum = targetReps ? parseInt(targetReps, 10) : 0;
  const [actualReps, setActualReps] = useState(targetRepsNum || 0);
  const [difficulty, setDifficulty] = useState(null);

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
      difficulty,
    });
    setDifficulty(null);
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
        <SetTracker totalSets={effectiveSets} currentSet={currentSet} />

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

        <InlineRatingStrip
          interactive
          selectedRating={difficulty}
          onRate={setDifficulty}
          onSkip={() => setDifficulty(null)}
        />
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
  const endTimeRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
    setRunning(false);
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
        onCompleteSet({});
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${String(secs).padStart(2, '0')}`;
  const progressPercent = ((duration - remaining) / duration) * 100;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ProgressBar
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        blockName={block?.label || block?.name || ''}
      />

      <div className="px-6 pt-6 pb-2 text-center">
        <h1 className="text-3xl font-semibold text-[#0F172A]">{exercise.name}</h1>
        {effectiveSets > 1 && (
          <div className="mt-3">
            <SetTracker totalSets={effectiveSets} currentSet={currentSet} />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            <circle
              cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="1" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercent / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
          <span className="text-[60px] font-extrabold font-mono tabular-nums text-[#0F172A]">{display}</span>
        </div>
      </div>

      <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3">
        {!running ? (
        <button
          onClick={() => setRunning(true)}
          className="w-full min-h-[56px] py-4 bg-[#F97316] text-white text-lg font-semibold rounded-full active:scale-[0.98]"
        >
          {remaining < duration ? 'Resume' : 'Start'}
        </button>
        ) : (
        <button
          onClick={() => { setRunning(false); onCompleteSet({}); }}
          className="w-full min-h-[56px] py-4 bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] text-lg font-semibold rounded-full active:opacity-80"
        >
            Skip
          </button>
        )}
        <InlineRatingStrip interactive={false} />
      </div>
    </div>
  );
}

function CardioView({ exercise, exerciseIndex, totalExercises, flatExercises, block, onCompleteSet }) {
  const hasDuration = exercise.duration_seconds != null;
  const hasDistance = exercise.distance_meters != null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ProgressBar
        exerciseIndex={exerciseIndex}
        totalExercises={totalExercises}
        flatExercises={flatExercises}
        blockName={block?.label || block?.name || ''}
      />

      <div className="px-6 pt-6 pb-2 text-center">
        <h1 className="text-3xl font-semibold text-[#0F172A]">{exercise.name}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        {hasDuration && (
          <div className="text-center">
            <p className="text-[60px] font-extrabold font-mono text-[#111111]">
              {Math.floor(exercise.duration_seconds / 60)}:{String(exercise.duration_seconds % 60).padStart(2, '0')}
            </p>
            <p className="text-[#475569] mt-1 text-sm">minutes</p>
          </div>
        )}
        {hasDistance && (
          <div className="text-center">
            <p className="text-[60px] font-extrabold font-mono text-[#111111]">
              {exercise.distance_meters >= 1000
                ? `${(exercise.distance_meters / 1000).toFixed(1)} km`
                : `${exercise.distance_meters} m`}
            </p>
            <p className="text-[#475569] mt-1 text-sm">distance</p>
          </div>
        )}
        {!hasDuration && !hasDistance && (
          <p className="text-xl text-[#475569]">Complete when ready</p>
        )}
      </div>

      <div className="px-6 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <button
          onClick={() => onCompleteSet({})}
          className="w-full min-h-[56px] py-4 bg-[#F97316] text-white text-lg font-semibold rounded-full active:scale-[0.98]"
        >
          Done
        </button>
        <InlineRatingStrip interactive={false} />
      </div>
    </div>
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
        <SetTracker totalSets={effectiveSets} currentSet={currentSet} />
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        <SupersetExerciseCard
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
        <InlineRatingStrip interactive={false} />
      </div>
    </div>
  );
}

function SupersetExerciseCard({ exercise, weight, onWeightChange }) {
  const showWeight = exercise.suggested_weight_kg != null;

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
      <h2 className="text-xl font-semibold text-center text-[#0F172A]">{exercise.name}</h2>
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
