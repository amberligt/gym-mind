/**
 * Dashboard — plan exists (streak + suggested) or no plan (chips + duration).
 * Orange + Blue. One dominant CTA. No Dev Mode.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkouts, getSavedWorkoutTemplates } from '../services/storageService';
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

export default function ChatInput({ onGenerate, onLoadWorkoutFromText, onLoadSavedWorkout, loading, error, onClearError, onViewHistory, onViewProfile }) {
  const { user, signOut } = useAuth();
  const { streak, weeklySessions, weeklyTarget, lastWorkout } = useStreakAndWeekly(user?.id);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [focus, setFocus] = useState('');
  const [duration, setDuration] = useState(60);
  // null = show choice; 'paste' = paste workout; 'generate' = AI generate with type/duration
  const [createMode, setCreateMode] = useState(null);
  const [pasteText, setPasteText] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setSavedTemplates([]);
      return;
    }
    getSavedWorkoutTemplates(user.id).then(setSavedTemplates).catch(() => setSavedTemplates([]));
  }, [user?.id]);

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

        <div className="shrink-0 px-6 pt-4 pb-2">
          <button
            type="button"
            onClick={() => setCreateMode('choice')}
            className="text-[#1E3A8A] text-sm font-medium"
          >
            Create custom workout
          </button>
        </div>
        <div className="shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2 flex justify-center gap-4">
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

  const showChoice = (!hasPlan && createMode === null) || createMode === 'choice';
  const showPaste = createMode === 'paste';
  const showGenerate = createMode === 'generate';

  const handleLoadPaste = () => {
    if (!pasteText.trim() || !onLoadWorkoutFromText) return;
    onClearError?.();
    const result = onLoadWorkoutFromText(pasteText.trim());
    if (result?.success) setCreateMode(null);
  };

  const handleBackToChoice = () => {
    setCreateMode(hasPlan ? 'choice' : null);
    onClearError?.();
  };

  // Choice: I have a workout | Let AI generate
  if (showChoice) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          {loading && (
            <p className="text-sm text-[#475569] mb-4">Suggesting weights for your workout…</p>
          )}
          {createMode === 'choice' && (
            <button
              type="button"
              onClick={() => setCreateMode(null)}
              className="text-[#1E3A8A] font-medium text-sm mb-4 -ml-2"
            >
              ← Back
            </button>
          )}
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            {hasPlan ? 'Create custom workout' : 'How do you want to create your workout?'}
          </h1>
          <div className="mt-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => { setCreateMode('paste'); onClearError?.(); }}
              className="w-full text-left rounded-2xl bg-white border-2 border-[#E2E8F0] p-5 shadow-sm hover:border-[#3B82F6] transition-colors"
            >
              <p className="font-semibold text-[#0F172A]">I have a workout</p>
              <p className="text-sm text-[#475569] mt-1">Paste JSON or LLM output and load it</p>
            </button>
            <button
              type="button"
              onClick={() => { setCreateMode('generate'); onClearError?.(); }}
              className="w-full text-left rounded-2xl bg-white border-2 border-[#E2E8F0] p-5 shadow-sm hover:border-[#3B82F6] transition-colors"
            >
              <p className="font-semibold text-[#0F172A]">Let AI generate</p>
              <p className="text-sm text-[#475569] mt-1">Choose type (e.g. Upper body) and duration</p>
            </button>
          </div>
          {savedTemplates.length > 0 && onLoadSavedWorkout && (
            <div className="mt-8">
              <p className="text-sm font-medium text-[#475569] mb-3">Saved workouts (do again, weights suggested for today)</p>
              <div className="flex flex-col gap-2">
                {savedTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={loading}
                    onClick={() => onLoadSavedWorkout(t.id)}
                    className="w-full text-left rounded-2xl bg-white border-2 border-[#E2E8F0] p-4 shadow-sm hover:border-[#3B82F6] transition-colors disabled:opacity-60"
                  >
                    <p className="font-semibold text-[#0F172A]">{t.title || 'Saved workout'}</p>
                    <p className="text-xs text-[#475569] mt-0.5">
                      {(t.blocks?.reduce((s, b) => s + (b.exercises?.length || 0), 0) || 0)} exercises
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <NavFooter onViewHistory={onViewHistory} onViewProfile={onViewProfile} signOut={signOut} />
      </div>
    );
  }

  // Paste: textarea + Load workout
  if (showPaste) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        <div className="flex-1 flex flex-col px-6 py-6 min-h-0">
          <button
            type="button"
            onClick={handleBackToChoice}
            className="text-[#1E3A8A] font-medium text-sm mb-4 -ml-2"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold text-[#0F172A]">Paste your workout</h2>
          <p className="text-sm text-[#475569] mt-1">Paste JSON or LLM-generated workout (with blocks and exercises)</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder='{"title": "My Workout", "blocks": [...]}'
            className="mt-4 w-full min-h-[200px] rounded-xl border-2 border-[#E2E8F0] p-4 text-sm font-mono text-[#0F172A] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:ring-0 resize-y"
            spellCheck={false}
          />
          {error && (
            <div className="mt-4 border-2 border-[#EA580C]/50 bg-[#FFF7ED] text-[#EA580C] rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}
          <div className="mt-6">
            <PrimaryButton onClick={handleLoadPaste} disabled={!pasteText.trim()}>
              Load workout
            </PrimaryButton>
          </div>
        </div>
        <NavFooter onViewHistory={onViewHistory} onViewProfile={onViewProfile} signOut={signOut} />
      </div>
    );
  }

  // Generate: focus + duration + Generate Workout
  if (showGenerate) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <button
            type="button"
            onClick={handleBackToChoice}
            className="text-[#1E3A8A] font-medium text-sm mb-4 -ml-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            What do you want to train today?
          </h1>

          <div className="mt-6">
            <p className="text-sm font-medium text-[#475569] mb-3">Type</p>
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
        <NavFooter onViewHistory={onViewHistory} onViewProfile={onViewProfile} signOut={signOut} />
      </div>
    );
  }

  // No plan and createMode null: show choice (handled above via showChoice when !hasPlan && createMode === null)
  // Fallback: no plan, show choice
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <h1 className="text-2xl font-semibold text-[#0F172A]">How do you want to create your workout?</h1>
        <div className="mt-8 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setCreateMode('paste')}
            className="w-full text-left rounded-2xl bg-white border-2 border-[#E2E8F0] p-5 shadow-sm hover:border-[#3B82F6] transition-colors"
          >
            <p className="font-semibold text-[#0F172A]">I have a workout</p>
            <p className="text-sm text-[#475569] mt-1">Paste JSON or LLM output and load it</p>
          </button>
          <button
            type="button"
            onClick={() => setCreateMode('generate')}
            className="w-full text-left rounded-2xl bg-white border-2 border-[#E2E8F0] p-5 shadow-sm hover:border-[#3B82F6] transition-colors"
          >
            <p className="font-semibold text-[#0F172A]">Let AI generate</p>
            <p className="text-sm text-[#475569] mt-1">Choose type (e.g. Upper body) and duration</p>
          </button>
        </div>
      </div>
      <NavFooter onViewHistory={onViewHistory} onViewProfile={onViewProfile} signOut={signOut} />
    </div>
  );
}

function NavFooter({ onViewHistory, onViewProfile, signOut }) {
  return (
    <div className="shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] flex justify-center gap-4">
      <button onClick={onViewHistory} className="text-[#1E3A8A] text-sm font-medium min-h-[44px] flex items-center">
        History
      </button>
      {onViewProfile && (
        <button onClick={onViewProfile} className="text-[#1E3A8A] text-sm font-medium min-h-[44px] flex items-center">
          Profile
        </button>
      )}
      <button onClick={signOut} className="text-[#64748B] text-xs font-medium min-h-[44px] flex items-center">
        Sign out
      </button>
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
