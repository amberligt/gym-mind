/**
 * Rest state — Rest Timer header, recovery subtitle, big seconds countdown, Up next card, Skip rest.
 * Matches screenshot: clear header, orange progress ring, card with next exercise + prescription.
 */
import { useState, useEffect, useRef } from 'react';

function formatNextPrescription(exercise) {
  if (!exercise) return null;
  const parts = [];
  const sets = exercise.sets ?? 1;
  if (exercise.duration_seconds != null && !exercise.reps) {
    const m = Math.floor(exercise.duration_seconds / 60);
    const s = exercise.duration_seconds % 60;
    parts.push(`${sets} x ${m}:${String(s).padStart(2, '0')}`);
  } else {
    parts.push(`${exercise.reps ?? '—'} reps`);
  }
  if (exercise.suggested_weight_kg != null && exercise.suggested_weight_kg > 0) {
    parts.push(`${exercise.suggested_weight_kg} kg`);
  }
  return parts.join(' • ');
}

export default function RestTimer({
  seconds,
  lastCompletedExerciseName,
  lastCompletedSetText,
  nextExerciseName,
  nextSetText,
  nextExercise,
  onComplete,
  onSkip,
}) {
  const endTimeRef = useRef(Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    endTimeRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onComplete();
      }
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [seconds, onComplete]);

  const progressPercent = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 0;
  const prescription = formatNextPrescription(nextExercise);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#FAF8F5]">
      {/* Just completed: exercise name + set completed */}
      {(lastCompletedExerciseName || lastCompletedSetText) && (
        <div className="shrink-0 px-6 pt-6 pb-2 text-left">
          {lastCompletedExerciseName && (
            <p className="text-lg font-bold text-[#1E293B]">{lastCompletedExerciseName}</p>
          )}
          {lastCompletedSetText && (
            <p className="text-sm text-[#475569] mt-0.5">{lastCompletedSetText}</p>
          )}
        </div>
      )}

      {/* Big REST + countdown */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#64748B] mb-2">REST</p>
        <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#F97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - progressPercent / 100)}
              className="transition-all duration-300"
            />
          </svg>
          <div className="text-center">
            <span className="font-mono tabular-nums text-[64px] font-extrabold text-[#1E293B] leading-none">{remaining}</span>
            <p className="text-base text-[#475569] mt-1">s</p>
          </div>
        </div>

        {/* Up next: exercise — Set N of M + prescription */}
        {nextExerciseName && (
          <div className="w-full max-w-sm mt-8 rounded-2xl bg-[#F1F5F9]/80 p-4 text-left shadow-sm">
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Up next</p>
            <p className="text-lg font-bold text-[#1E293B] mt-1">
              {nextExerciseName}
              {nextSetText && <span className="text-[#475569] font-semibold"> — {nextSetText}</span>}
            </p>
            {prescription && (
              <p className="text-sm text-[#475569] mt-1">{prescription}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onSkip}
          className="mt-8 text-[#475569] font-medium text-base hover:text-[#0F172A] active:opacity-70 min-h-[44px]"
        >
          Skip rest
        </button>
      </div>
    </div>
  );
}
