/**
 * Workout Overview — sections with blue accent, last session delta, Start Session CTA.
 */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkouts } from '../services/storageService';
import PrimaryButton from './ui/PrimaryButton';
import StreakBadge from './ui/StreakBadge';

const IconMore = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

function generateId() {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function useLastSessionDelta(userId, workout) {
  const [delta, setDelta] = useState(null);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    if (!userId || !workout) return;
    getWorkouts(userId).then((workouts) => {
      if (!workouts.length) return;
      const last = workouts[0];
      const exercises = last.exercises || [];
      const flat = workout.blocks.flatMap((b) => b.exercises.map((e) => ({ ...e, block: b })));
      for (const curr of flat) {
        const prev = exercises.find((ex) => ex.name === curr.name);
        if (prev?.sets?.length) {
          const prevWeight = prev.sets[prev.sets.length - 1]?.weight_kg;
          const currWeight = curr.suggested_weight_kg;
          if (prevWeight != null && currWeight != null && currWeight > prevWeight) {
            setDelta({ exercise: curr.name, diff: (currWeight - prevWeight).toFixed(1) });
            break;
          }
        }
      }
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
  }, [userId, workout?.title]);
  return { delta, streak };
}

export default function WorkoutPreview({
  workout,
  onStart,
  onRegenerate,
  fetchAlternatives,
  replaceExercise,
  updateExercise,
  removeExercise,
  applyAdjustment,
}) {
  const { user } = useAuth();
  const { delta, streak } = useLastSessionDelta(user?.id, workout);
  const [replaceFor, setReplaceFor] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const [editFor, setEditFor] = useState(null);
  const [editValues, setEditValues] = useState({ sets: '', reps: '', weight: '' });
  const [adjustmentInput, setAdjustmentInput] = useState('');
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const scrollPosRef = useRef(0);

  const totalExercises = workout.blocks.reduce((sum, b) => sum + b.exercises.length, 0);

  const formatExerciseDetail = (ex) => {
    const parts = [];
    if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
    if (ex.duration_seconds && !ex.sets)
      parts.push(`${Math.floor(ex.duration_seconds / 60)}:${String(ex.duration_seconds % 60).padStart(2, '0')}`);
    if (ex.duration_seconds && ex.sets) parts.push(`${ex.sets}×${ex.duration_seconds}s`);
    if (ex.distance_meters)
      parts.push(ex.distance_meters >= 1000 ? `${(ex.distance_meters / 1000).toFixed(1)}km` : `${ex.distance_meters}m`);
    return parts.join(' · ') || '—';
  };

  const handleReplaceClick = async (e, blockIndex, exerciseIndex, ex) => {
    e.stopPropagation();
    const block = workout.blocks[blockIndex];
    setReplaceFor({ blockIndex, exerciseIndex });
    setAlternatives([]);
    setAlternativesLoading(true);
    try {
      const alts = await fetchAlternatives(ex, block, workout.title);
      setAlternatives((alts || []).slice(0, 3));
    } catch {
      setAlternatives([]);
    } finally {
      setAlternativesLoading(false);
    }
  };

  const handleSelectAlternative = (alt) => {
    if (!replaceFor) return;
    replaceExercise(replaceFor.blockIndex, replaceFor.exerciseIndex, {
      name: alt.name,
      id: generateId(),
    });
    setReplaceFor(null);
    setAlternatives([]);
  };

  const handleEditChange = (blockIndex, exerciseIndex, field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
    const updates = {};
    if (field === 'sets') updates.sets = Number(value) || 1;
    if (field === 'reps') updates.reps = value === '' ? null : String(value);
    if (field === 'weight') updates.suggested_weight_kg = value === '' ? null : parseFloat(value) || 0;
    if (Object.keys(updates).length > 0) updateExercise(blockIndex, exerciseIndex, updates);
  };

  const toggleEdit = (blockIndex, exerciseIndex, ex) => {
    if (editFor?.blockIndex === blockIndex && editFor?.exerciseIndex === exerciseIndex) {
      setEditFor(null);
      setReplaceFor(null);
    } else {
      setEditFor({ blockIndex, exerciseIndex });
      setEditValues({
        sets: String(ex.sets ?? 1),
        reps: String(ex.reps ?? ''),
        weight: ex.suggested_weight_kg != null ? String(ex.suggested_weight_kg) : '',
      });
      setReplaceFor(null);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const val = adjustmentInput.trim();
    if (!val || adjustmentLoading) return;
    if (scrollRef.current) scrollPosRef.current = scrollRef.current.scrollTop;
    setAdjustmentError(null);
    setAdjustmentLoading(true);
    try {
      await applyAdjustment(val);
      setAdjustmentInput('');
    } catch (err) {
      setAdjustmentError(err.message || 'Adjustment failed');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current && scrollPosRef.current > 0) {
      scrollRef.current.scrollTop = scrollPosRef.current;
      scrollPosRef.current = 0;
    }
  }, [workout]);

  return (
    <div className="flex flex-col min-h-full overflow-hidden bg-[#F8FAFC]">
      <div className="shrink-0 px-6 pt-6 pb-3">
        <h1 className="text-3xl font-semibold text-[#0F172A]">{workout.title}</h1>
        <p className="text-[#475569] text-base mt-1">
          {workout.estimated_duration_minutes} min • {totalExercises} exercises
        </p>
        {delta && (
          <p className="text-sm font-medium text-[#F97316] mt-2">
            Last session: +{delta.diff} kg {delta.exercise}
          </p>
        )}
        {streak > 0 && (
          <div className="mt-2">
            <StreakBadge count={streak} />
          </div>
        )}
        {onRegenerate && (
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#475569] -m-2 p-2"
              aria-label="More options"
            >
              <IconMore />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute left-0 top-full mt-1 z-20 min-w-[200px] py-1 bg-white border-2 border-[#E2E8F0] rounded-xl shadow-lg">
                  <button
                    type="button"
                    onClick={() => { onRegenerate(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-[#0F172A] flex items-center gap-2"
                  >
                    <IconRefresh />
                    Regenerate workout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-6">
        <div className="space-y-6 pb-4">
          {workout.blocks.map((block, bi) => (
            <div
              key={bi}
              className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4 border-l-4 border-l-[#1E3A8A]"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">{block.label}</span>
              <h2 className="text-lg font-medium text-[#0F172A] mt-1">{block.name || block.label}</h2>
              <div className="space-y-1 mt-4">
                {block.exercises.map((ex, ei) => (
                  <div key={ex.id || ei}>
                    <button
                      type="button"
                      onClick={() => toggleEdit(bi, ei, ex)}
                      className="w-full text-left flex items-center justify-between py-4 min-h-[56px]"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-medium text-[#0F172A] truncate">{ex.name}</p>
                        <p className="text-xs text-[#475569] mt-0.5 truncate">{formatExerciseDetail(ex)}</p>
                      </div>
                      {ex.suggested_weight_kg != null && ex.suggested_weight_kg > 0 ? (
                        <span className="shrink-0 font-semibold text-[#0F172A] tabular-nums">{ex.suggested_weight_kg} kg</span>
                      ) : (
                        <span className="shrink-0 text-sm text-[#475569]">—</span>
                      )}
                    </button>
                    {editFor?.blockIndex === bi && editFor?.exerciseIndex === ei && (
                      <div className="pt-3 pb-4 border-t border-[#E2E8F0] space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            ['Sets', 'sets', 'number'],
                            ['Reps', 'reps', 'text'],
                            ['Weight (kg)', 'weight', 'text'],
                          ].map(([label, field, type]) => (
                            <div key={field}>
                              <label className="block text-xs uppercase tracking-wider text-[#475569] mb-1">{label}</label>
                              <input
                                type={type}
                                min={field === 'sets' ? 1 : undefined}
                                max={field === 'sets' ? 20 : undefined}
                                value={editValues[field]}
                                onChange={(e) => handleEditChange(bi, ei, field, e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && setEditFor(null)}
                                className="w-full min-h-[44px] px-3 text-sm font-medium border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] outline-none focus:border-[#3B82F6]"
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleReplaceClick(e, bi, ei, ex)}
                          disabled={alternativesLoading}
                          className="min-h-[44px] px-4 rounded-full text-sm font-medium border-2 border-[#1E3A8A] text-[#1E3A8A] flex items-center gap-2"
                        >
                          <IconRefresh />
                          Replace exercise
                        </button>
                        {replaceFor?.blockIndex === bi && replaceFor?.exerciseIndex === ei && (
                          <div className="space-y-2">
                            {alternativesLoading ? (
                              <div className="min-h-[72px] rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                                <span className="text-sm text-[#475569]">Loading…</span>
                              </div>
                            ) : alternatives.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {alternatives.map((alt, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectAlternative(alt)}
                                    className="w-full text-left px-4 py-3 min-h-[44px] rounded-xl border-2 border-[#E2E8F0] bg-white"
                                  >
                                    <p className="font-medium text-sm text-[#0F172A]">{alt.name}</p>
                                    <p className="text-xs text-[#475569] mt-0.5 line-clamp-1">{alt.reason}</p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-[#475569]">No alternatives found</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-6 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] space-y-4">
        <form onSubmit={handleAdjustSubmit} className="flex gap-2">
          <input
            type="text"
            value={adjustmentInput}
            onChange={(e) => setAdjustmentInput(e.target.value)}
            placeholder="e.g. Add one more set to bench press"
            disabled={adjustmentLoading}
            className="flex-1 min-h-[44px] px-4 border-2 border-[#E2E8F0] rounded-full text-[#0F172A] placeholder-[#475569]/70 outline-none focus:border-[#3B82F6] bg-white"
          />
          <button
            type="submit"
            disabled={!adjustmentInput.trim() || adjustmentLoading}
            className="min-h-[44px] min-w-[44px] px-4 rounded-full text-sm font-medium bg-[#F97316] text-white"
          >
            {adjustmentLoading ? '…' : 'Apply'}
          </button>
        </form>
        {adjustmentError && <p className="text-sm font-medium text-[#EA580C]">{adjustmentError}</p>}
        <PrimaryButton onClick={onStart}>Start Session</PrimaryButton>
      </div>
    </div>
  );
}
