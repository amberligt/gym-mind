/**
 * History — streak, weekly summary, workout cards with delta.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkouts } from '../services/storageService';
import StreakBadge from './ui/StreakBadge';

export default function History({ onBack, onNewWorkout, onViewProfile }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    getWorkouts(user.id).then(setWorkouts).catch(() => setWorkouts([]));
  }, [user?.id]);

  const streak = (() => {
    if (!workouts.length) return 0;
    const dates = new Set(workouts.map((w) => new Date(w.date).toDateString()));
    const mostRecent = new Date(Math.max(...workouts.map((w) => new Date(w.date))));
    let count = 0;
    const d = new Date(mostRecent);
    for (let i = 0; i < 365; i++) {
      if (dates.has(d.toDateString())) count++;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const thisWeek = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  });
  const volumeThisWeek = thisWeek.reduce((s, w) => {
    const exs = w.exercises || [];
    return s + exs.reduce((eS, e) => {
      const sets = e.sets || [];
      return eS + (Array.isArray(sets) ? sets.reduce((ss, st) => ss + (st.weight_kg || 0) * (st.actual_reps || 0), 0) : 0);
    }, 0);
  }, 0);

  if (selected) {
    return (
      <WorkoutDetail workout={selected} onBack={() => setSelected(null)} />
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-[#1E3A8A] font-medium text-base min-h-[44px] min-w-[44px] -ml-2 flex items-center"
          >
            ← Back
          </button>
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="text-[#1E3A8A] font-medium text-sm min-h-[44px] min-w-[44px] flex items-center"
            >
              Profile
            </button>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-[#0F172A] mt-4">Workout History</h1>
        {streak > 0 && (
          <div className="mt-3">
            <StreakBadge count={streak} />
          </div>
        )}
        {workouts.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475569]">This week</p>
            <p className="text-lg font-semibold text-[#0F172A] mt-1">{thisWeek.length} sessions</p>
            {volumeThisWeek > 0 && (
              <p className="text-sm text-[#475569] mt-0.5">~{Math.round(volumeThisWeek)} kg volume</p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[#475569] text-lg">No workouts yet</p>
            <p className="text-[#475569] text-sm mt-1">Complete your first workout to see it here.</p>
            <button
              onClick={onNewWorkout}
              className="mt-6 min-h-[56px] px-8 rounded-full bg-[#F97316] text-white font-semibold"
            >
              Start a workout
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {workouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} onSelect={() => setSelected(w)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutCard({ workout, onSelect }) {
  const date = new Date(workout.date);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const mins = Math.round((workout.duration_seconds || 0) / 60);
  const delta = getTopDelta(workout);

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4 border-2 border-transparent hover:border-[#E2E8F0] transition-colors min-h-[44px]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-[#0F172A]">{workout.title || 'Workout'}</p>
          <p className="text-sm text-[#475569] mt-0.5">{dateStr}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#0F172A]">{mins} min</p>
          {delta && (
            <p className="text-sm font-medium text-[#F97316]">{delta}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function getTopDelta(workout) {
  const exs = workout.exercises || [];
  for (const ex of exs) {
    const sets = ex.sets || [];
    if (!Array.isArray(sets)) continue;
    const weights = sets.map((s) => s.weight_kg).filter((w) => w != null && w > 0);
    if (weights.length >= 2) {
      const last = weights[weights.length - 1];
      const prev = weights[weights.length - 2];
      if (last > prev) {
        return `+${(last - prev).toFixed(1)} kg ${ex.name}`;
      }
    }
  }
  return null;
}

function WorkoutDetail({ workout, onBack }) {
  const date = new Date(workout.date);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const mins = Math.round((workout.duration_seconds || 0) / 60);
  const totalSets = workout.exercises?.reduce((s, e) => {
    const sets = e.sets || [];
    return s + (Array.isArray(sets) ? sets.length : sets) || 0;
  }, 0) ?? 0;
  const totalExercises = workout.exercises?.length ?? 0;

  const hasBlocks = workout.blocks && workout.blocks.length > 0;
  const blocks = hasBlocks ? workout.blocks : (workout.exercises ? [{ label: 'Exercises', exercises: workout.exercises }] : []);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] animate-slide-up">
      <div className="shrink-0 px-6 pt-6 pb-2">
        <button
          onClick={onBack}
          className="text-[#1E3A8A] font-medium text-base min-h-[44px]"
        >
          ← All workouts
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <h1 className="text-2xl font-semibold text-[#0F172A]">{workout.title}</h1>
        <p className="text-[#475569] text-sm mt-1">{dateStr}</p>

        <div className="grid grid-cols-3 gap-3 mt-6 mb-8">
          <SummaryCard label="Duration" value={`${mins} min`} />
          <SummaryCard label="Total Sets" value={totalSets} />
          <SummaryCard label="Exercises" value={totalExercises} />
        </div>

        <div className="space-y-6">
          {blocks.map((block, bi) => (
            <div key={bi} className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4 border-l-4 border-l-[#1E3A8A]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">{block.label}</span>
              <div className="space-y-2 mt-3">
                {(block.exercises || []).map((ex, ei) => (
                  <div key={ei} className="flex items-baseline justify-between py-1">
                    <p className="font-medium text-[#0F172A] truncate flex-1">{ex.name}</p>
                    <span className="text-sm text-[#475569] tabular-nums ml-3 shrink-0">
                      {ex.prescription ?? formatEx(ex)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatEx(ex) {
  if (ex.sets && Array.isArray(ex.sets)) {
    const first = ex.sets[0];
    const reps = first?.target_reps ?? first?.actual_reps ?? '—';
    const w = first?.weight_kg;
    return `${ex.sets.length}×${reps}${w ? ` @ ${w} kg` : ''}`;
  }
  return ex.sets ? `${ex.sets}×${ex.reps || '—'}` : '—';
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] py-3 text-center">
      <p className="text-xl font-bold text-[#0F172A]">{value}</p>
      <p className="text-xs text-[#475569] mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}
