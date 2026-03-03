/**
 * Workout Complete — orange success circle, streak, metrics, progress delta, Return to Dashboard.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveCompletedSession } from '../services/storageService';
import { analyseWorkoutHistory } from '../services/workoutService';
import PrimaryButton from './ui/PrimaryButton';
import StreakBadge from './ui/StreakBadge';
import { getWorkouts } from '../services/storageService';

export default function WorkoutComplete({
  sessionLog,
  startTime,
  workout,
  analysis,
  analysisLoading,
  dispatch,
  onNewWorkout,
  onViewHistory,
}) {
  const { user } = useAuth();
  const saved = useRef(false);
  const [streak, setStreak] = useState(0);

  const durationSeconds = Math.round((Date.now() - startTime) / 1000);
  const durationMins = Math.round(durationSeconds / 60);

  const exercises = sessionLog?.exercises ?? [];
  const rated = exercises.filter((e) => {
    if (e.sets && Array.isArray(e.sets)) return e.sets.some((s) => s.difficulty != null);
    return false;
  });
  const getAvgDifficulty = () => {
    if (rated.length === 0) return '—';
    let sum = 0, count = 0;
    for (const e of rated) {
      if (e.sets && Array.isArray(e.sets)) {
        for (const s of e.sets) {
          if (s.difficulty != null) { sum += s.difficulty; count++; }
        }
      }
    }
    return count > 0 ? (sum / count).toFixed(1) : '—';
  };
  const avgDifficulty = getAvgDifficulty();

  useEffect(() => {
    if (!user?.id) return;
    getWorkouts(user.id).then((workouts) => {
      if (!workouts.length) return;
      const dates = new Set(workouts.map((w) => new Date(w.date).toDateString()));
      const mostRecent = new Date(Math.max(...workouts.map((w) => new Date(w.date))));
      let count = 0;
      const d = new Date(mostRecent);
      for (let i = 0; i < 365; i++) {
        if (dates.has(d.toDateString())) count++;
        else break;
        d.setDate(d.getDate() - 1);
      }
      setStreak(count);
    }).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (saved.current || !user?.id) return;
    saved.current = true;
    saveCompletedSession(user.id, sessionLog, workout, durationSeconds).catch(() => {});

    dispatch({ type: 'SET_ANALYSIS_LOADING' });
    const session = {
      id: null,
      date: new Date().toISOString(),
      title: workout?.title ?? 'Workout',
      duration_seconds: durationSeconds,
      workout_id: sessionLog?.workout_id ?? null,
      started_at: sessionLog?.started_at ?? new Date(startTime).toISOString(),
      exercises,
    };
    analyseWorkoutHistory(session, user.id).then((result) => {
      if (result.success) {
        dispatch({ type: 'SET_ANALYSIS', analysis: result.analysis });
      } else {
        dispatch({ type: 'SET_ANALYSIS', analysis: null });
      }
    });
  }, [user?.id]);

  const progressItems = analysis?.recommendations?.filter((r) => r.volume_trend === 'up' || r.pr_flag).slice(0, 2) ?? [];
  const nextRec = analysis?.recommendations?.[0];

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6 min-h-0">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#F97316] flex items-center justify-center text-white text-4xl animate-scale-in">
            ✓
          </div>
          <h1 className="text-3xl font-semibold text-[#0F172A] mt-6">Workout Complete</h1>
          {streak > 0 && (
            <div className="mt-3">
              <StreakBadge count={streak} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 max-w-sm mx-auto">
          <StatCard label="Total Time" value={`${durationMins} min`} />
          <StatCard label="Exercises" value={exercises.length} />
          <StatCard label="Avg Difficulty" value={avgDifficulty} />
        </div>

        {analysisLoading && (
          <div className="mt-8 space-y-4">
            <div className="h-4 w-24 rounded animate-pulse bg-[#E2E8F0] mx-auto" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded animate-pulse bg-[#E2E8F0]" />
              <div className="h-3 w-4/5 rounded animate-pulse bg-[#E2E8F0]" />
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            {progressItems.length > 0 && (
              <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Progress</h2>
                <div className="space-y-2">
                  {progressItems.map((rec, i) => (
                    <p key={i} className="text-sm font-medium text-[#F97316]">
                      {rec.exercise ?? rec.exercise_name} {rec.suggested_weight_kg != null && `+${rec.suggested_weight_kg} kg`}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {analysis.coaching_summary && (
              <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A] mb-2">Coach&rsquo;s Notes</h2>
                <p className="text-[#0F172A] text-sm leading-relaxed">{analysis.coaching_summary}</p>
              </div>
            )}

            {nextRec && (
              <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Next Session</h2>
                <p className="font-medium text-[#0F172A]">{nextRec.exercise ?? nextRec.exercise_name ?? '—'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
        <PrimaryButton onClick={onNewWorkout}>Return to Dashboard</PrimaryButton>
        <button
          onClick={onViewHistory}
          className="w-full mt-3 text-[#475569] text-sm text-center py-2"
        >
          View history
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] py-4 text-center">
      <p className="text-xl font-bold text-[#0F172A]">{value}</p>
      <p className="text-xs text-[#475569] mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
