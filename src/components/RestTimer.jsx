/**
 * Rest state — hero timer, orange progress ring, hold-to-skip.
 * Minimal text. Rotating microcopy.
 */
import { useState, useEffect, useRef } from 'react';

const MICROCOPY = [
  'Control your breathing.',
  'Stay sharp.',
  'Recover well.',
  'Next set awaits.',
];

export default function RestTimer({ seconds, nextExerciseName, currentSet = 1, totalSets = 1, lastSet, nextTarget, onComplete, onSkip }) {
  const endTimeRef = useRef(Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);
  const [microcopyIndex, setMicrocopyIndex] = useState(0);

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

  useEffect(() => {
    const id = setInterval(() => {
      setMicrocopyIndex((i) => (i + 1) % MICROCOPY.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${String(secs).padStart(2, '0')}`;
  const progressPercent = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0 overflow-hidden bg-[#F8FAFC]">
      <p className="text-sm font-medium text-[#475569] uppercase tracking-wider mb-2">
        Set {currentSet} of {totalSets}
      </p>
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#F97316"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercent / 100)}`}
            className="transition-all duration-300"
          />
        </svg>
        <span className="hero-metric font-mono tabular-nums text-[60px]">{display}</span>
      </div>

      {(lastSet || nextTarget) && (
        <div className="mt-6 text-center space-y-1">
          {lastSet && (lastSet.reps != null || lastSet.weight != null) && (
            <p className="text-sm text-[#475569]">
              Last set: {lastSet.reps ?? '—'} reps{lastSet.weight != null && lastSet.weight > 0 ? ` @ ${lastSet.weight} kg` : ''}
            </p>
          )}
          {nextTarget && (
            <p className="text-sm font-medium text-[#0F172A]">Next target: {nextTarget}</p>
          )}
        </div>
      )}

      {nextExerciseName && (
        <div className="mt-4 text-center">
          <p className="text-xs text-[#475569] uppercase tracking-wider">Up next</p>
          <p className="text-lg font-medium mt-1 text-[#0F172A]">{nextExerciseName}</p>
        </div>
      )}

      <p className="text-sm text-[#475569] mt-6">{MICROCOPY[microcopyIndex]}</p>

      <button
        onClick={onSkip}
        className="mt-8 min-h-[44px] px-6 rounded-full border-2 border-[#1E3A8A] text-[#1E3A8A] font-medium text-sm"
      >
        Skip rest
      </button>
    </div>
  );
}
