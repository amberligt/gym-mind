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
    if (rated.length === 0) return null;
    let sum = 0, count = 0;
    for (const e of rated) {
      if (e.sets && Array.isArray(e.sets)) {
        for (const s of e.sets) {
          if (s.difficulty != null) { sum += s.difficulty; count++; }
        }
      }
    }
    return count > 0 ? sum / count : null;
  };
  const avgDifficultyNum = getAvgDifficulty();
  // Display as X/5 for screenshot-style (map 1–3 scale to 1–5: (avg-1)/2*4+1)
  const avgDifficultyDisplay = avgDifficultyNum != null
    ? `${((avgDifficultyNum - 1) / 2 * 4 + 1).toFixed(1)}/5`
    : '—';

  const totalVolumeKg = exercises.reduce((sum, ex) => {
    if (!ex.sets || !Array.isArray(ex.sets)) return sum;
    return sum + ex.sets.reduce((s, set) => {
      const w = Number(set.weight_kg);
      const r = Number(set.actual_reps);
      return s + (Number.isFinite(w) && Number.isFinite(r) ? w * r : 0);
    }, 0);
  }, 0);
  const totalVolumeDisplay = totalVolumeKg > 0 ? `${Math.round(totalVolumeKg).toLocaleString()} kg` : '—';

  const caloriesEstimate = durationMins > 0 && totalVolumeKg > 0
    ? Math.round(durationMins * 5 + totalVolumeKg * 0.1)
    : durationMins > 0
      ? Math.round(durationMins * 5)
      : null;

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
  const prItems = analysis?.recommendations?.filter((r) => r.pr_flag) ?? [];
  const nextRec = analysis?.recommendations?.[0];

  const nextSessionTitle = workout?.title ?? nextRec?.exercise ?? nextRec?.exercise_name ?? 'Next workout';
  const nextSessionSubline = nextRec?.exercise_name ? `Building on ${nextRec.exercise_name}` : (analysis?.coaching_summary ? 'Keep the momentum' : null);
  const nextSessionDate = new Date();
  const nextSessionDateStr = nextSessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6 min-h-0">
        {/* Header: orange checkmark, Workout Complete!, Great work today */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#F97316] flex items-center justify-center text-white text-4xl animate-scale-in">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mt-6">Workout Complete!</h1>
          <p className="text-[#64748B] text-base mt-1">Great work today</p>
          {streak > 0 && (
            <div className="mt-3">
              <StreakBadge count={streak} />
            </div>
          )}
        </div>

        {/* Summary card: Total Time, Exercises Completed, Avg Difficulty, Total Volume, optional Calories */}
        <div className="mt-8 rounded-2xl bg-[#F1F5F9] p-5 max-w-sm mx-auto">
          <SummaryRow label="Total Time" value={`${durationMins} min`} className="pt-0" />
          <SummaryRow label="Exercises Completed" value={String(exercises.length)} className="border-t border-[#E2E8F0]" />
          <SummaryRow label="Avg Difficulty" value={avgDifficultyDisplay} className="border-t border-[#E2E8F0]" />
          <SummaryRow label="Total Volume Lifted" value={totalVolumeDisplay} className="border-t border-[#E2E8F0]" />
          {caloriesEstimate != null && (
            <SummaryRow label="Calories (est.)" value={`~${caloriesEstimate}`} className="border-t border-[#E2E8F0]" />
          )}
          {prItems.length > 0 && (
            <SummaryRow label="Personal records" value={String(prItems.length)} className="border-t border-[#E2E8F0]" />
          )}
        </div>

        {analysisLoading && (
          <div className="mt-8 rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-5 max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center text-[#F97316]">…</span>
              <span className="font-bold text-[#1E293B]">Coach&rsquo;s Notes</span>
            </div>
            <div className="h-3 w-full rounded animate-pulse bg-[#E2E8F0] mb-2" />
            <div className="h-3 w-4/5 rounded animate-pulse bg-[#E2E8F0]" />
          </div>
        )}

        {/* Coach's Notes card (when analysis loaded) */}
        {analysis && !analysisLoading && analysis.coaching_summary && (
          <div className="mt-8 max-w-sm mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center text-[#F97316]" aria-hidden>
                  <IconChat className="w-4 h-4" />
                </span>
                <h2 className="font-bold text-[#1E293B]">Coach&rsquo;s Notes</h2>
              </div>
              <p className="text-[#475569] text-sm leading-relaxed">{analysis.coaching_summary}</p>
            </div>
          </div>
        )}

        {/* Recommended Next Session card — always show */}
        <div className="mt-8 max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-5">
            <h2 className="font-bold text-[#1E293B] mb-3">Recommended Next Session</h2>
            <p className="text-xl font-bold text-[#0F172A]">{nextSessionTitle}</p>
            <p className="text-sm text-[#64748B] mt-1">{workout?.estimated_duration_minutes ?? 60} min • {nextSessionDateStr}</p>
            {nextSessionSubline && (
              <div className="flex items-center gap-2 mt-3 text-[#F97316]">
                <span aria-hidden><IconArrowUp className="w-4 h-4" /></span>
                <span className="text-sm font-medium">{nextSessionSubline}</span>
              </div>
            )}
          </div>
        </div>
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

function SummaryRow({ label, value, className = '' }) {
  return (
    <div className={`flex items-center justify-between py-3 first:pt-0 last:pb-0 ${className}`}>
      <span className="text-[#475569] text-sm">{label}</span>
      <span className="text-[#1E293B] font-bold text-lg">{value}</span>
    </div>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
