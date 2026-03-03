/**
 * Dashboard — plan exists (streak + suggested) or no plan (chips + duration).
 * Orange + Blue. One dominant CTA. No Dev Mode.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkouts } from '../services/storageService';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import StreakBadge from './ui/StreakBadge';
import ProgressBar from './ui/ProgressBar';

const FOCUS_CHIPS = ['Upper', 'Lower', 'Push', 'Pull', 'Core', 'Full Body'];
const DURATION_OPTIONS = [30, 45, 60, 90];

function useStreakAndWeekly(userId) {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    if (!userId) return;
    getWorkouts(userId).then(setWorkouts).catch(() => setWorkouts([]));
  }, [userId]);

  const streak = (() => {
    if (!workouts.length) return 0;
    const dates = new Set(workouts.map((w) => new Date(w.date).toDateString()));
    const mostRecent = new Date(Math.max(...workouts.map((w) => new Date(w.date))));
    let count = 0;
    const d = new Date(mostRecent);
    for (let i = 0; i < 365; i++) {
      const key = d.toDateString();
      if (dates.has(key)) count++;
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
  const weeklySessions = thisWeek.length;
  const weeklyTarget = 5;

  return { streak, weeklySessions, weeklyTarget, lastWorkout: workouts[0] };
}

export default function ChatInput({ onGenerate, loading, error, onViewHistory, onViewProfile }) {
  const { user, signOut } = useAuth();
  const { streak, weeklySessions, weeklyTarget, lastWorkout } = useStreakAndWeekly(user?.id);
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState(60);

  const hasPlan = lastWorkout != null;

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (loading) return;
    const focusStr = focus
      ? ['Upper', 'Lower', 'Full Body'].includes(focus)
        ? `${focus === 'Full Body' ? 'Full' : focus} body`
        : focus
      : '';
    const input = focusStr ? `${focusStr} ${duration} min` : `${duration} min workout`;
    onGenerate(input);
  };

  const handleSuggestedStart = () => {
    const title = lastWorkout?.title || 'Workout';
    const dur = lastWorkout?.duration_seconds
      ? Math.round(lastWorkout.duration_seconds / 60)
      : 60;
    onGenerate(`${title}, ${dur} min`);
  };

  // Plan exists: streak, weekly progress, suggested workout
  if (hasPlan) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        <div className="shrink-0 px-6 pt-8 pb-4">
          {streak > 0 && (
            <div className="mb-4">
              <StreakBadge count={streak} />
            </div>
          )}
          <ProgressBar value={weeklySessions} max={weeklyTarget} className="mb-6" />
          <p className="text-sm text-[#475569]">
            {weeklySessions}/{weeklyTarget} sessions this week
          </p>

          <Card className="mt-6 p-5">
            <p className="text-sm font-medium text-[#475569]">Today</p>
            <h2 className="text-xl font-semibold text-[#0F172A] mt-1">
              {lastWorkout?.title || 'Suggested Workout'}
            </h2>
            <p className="text-[#475569] text-sm mt-1">
              {lastWorkout?.duration_seconds
                ? `${Math.round(lastWorkout.duration_seconds / 60)} min`
                : '60 min'}
            </p>
            <PrimaryButton
              onClick={handleSuggestedStart}
              loading={loading}
              className="mt-4"
            >
              Start Workout
            </PrimaryButton>
          </Card>
        </div>

        <div className="flex-1 min-h-0 overflow-x-auto px-6 py-4">
          <p className="text-sm font-medium text-[#475569] mb-3">This Week</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="shrink-0 w-16 py-3 rounded-[20px] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] text-center"
              >
                <p className="text-xs text-[#475569]">{day}</p>
                <p className="text-lg font-semibold text-[#0F172A] mt-1">—</p>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 flex justify-center gap-4">
          <button
            onClick={onViewHistory}
            className="text-[#1E3A8A] text-sm font-medium min-h-[44px] flex items-center"
          >
            History
          </button>
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="text-[#1E3A8A] text-sm font-medium min-h-[44px] flex items-center"
            >
              Profile
            </button>
          )}
          <button
            onClick={signOut}
            className="text-[#64748B] text-xs font-medium min-h-[44px] flex items-center"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // No plan: chips + duration + Generate
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <h1 className="text-3xl font-semibold text-[#0F172A]">
          What do you want to train today?
        </h1>

        <div className="mt-6">
          <p className="text-sm font-medium text-[#475569] mb-3">Focus</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setFocus(focus === chip ? '' : chip)}
                className={`min-h-[44px] px-4 rounded-full text-sm font-medium transition-all ${
                  focus === chip
                    ? 'bg-[#F97316] text-white'
                    : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-[#475569] mb-3">Duration</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`min-h-[44px] px-4 rounded-full text-sm font-medium transition-all ${
                  duration === d
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A]'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 border-2 border-[#EA580C]/50 bg-[#FFF7ED] text-[#EA580C] rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mt-10">
          <PrimaryButton onClick={handleGenerate} loading={loading}>
            Generate Workout
          </PrimaryButton>
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#475569]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-medium tracking-wide">
                Generating your workout<span className="animate-pulse">...</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] flex justify-center gap-4">
        <button
          onClick={onViewHistory}
          className="text-[#1E3A8A] text-sm font-medium min-h-[44px] flex items-center"
        >
          History
        </button>
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="text-[#1E3A8A] text-sm font-medium min-h-[44px] flex items-center"
          >
            Profile
          </button>
        )}
        <button
          onClick={signOut}
          className="text-[#64748B] text-xs font-medium min-h-[44px] flex items-center"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}
