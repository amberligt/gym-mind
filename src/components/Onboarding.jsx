/**
 * Onboarding: Profile Setup Choice → Quick Setup (guided) or AI Import.
 * Orange + Blue design. Clear hierarchy.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseProfile } from '../services/workoutService';
import { saveProfile } from '../services/profileService';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import Card from './ui/Card';

const MAX_CHARS = 1200;
const PROMPT_TEXT = `I am joining a structured training system. Based on everything you know about me, output ONLY the answers below. Keep each line brief. Total under ${MAX_CHARS} characters.

1. Primary training goal (1 sentence)
2. Secondary goal (optional)
3. Training experience: beginner / intermediate / advanced + years
4. Strength numbers (if known): Push-ups max / Pull-ups / Squat kg×reps / Deadlift / Bench / OHP
5. Bodyweight
6. Injuries or limitations
7. Days per week available
8. Average session duration
9. Recovery quality: low / medium / high
10. Skill goals (e.g. handstand, muscle-up)

If unknown, write "unknown". No extra explanation.`;

const GOAL_OPTIONS = ['Strength', 'Hypertrophy', 'Endurance', 'General fitness'];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const DURATION_OPTIONS = [30, 45, 60, 90];

export default function Onboarding({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState('choice'); // 'choice' | 'guided' | 'ai-import'
  const [profileText, setProfileText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guided form state
  const [guided, setGuided] = useState({
    training_goal: '',
    experience_level: '',
    days_per_week: null,
    session_duration_minutes: 45,
    bodyweight: '',
    injuries: '',
  });

  const handleGuidedSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || loading) return;
    setLoading(true);
    setError(null);
    try {
      const profileJson = {
        training_goal: guided.training_goal || null,
        secondary_goal: null,
        experience_level: guided.experience_level?.toLowerCase() || null,
        experience_years: null,
        strength_numbers: {},
        bodyweight: guided.bodyweight || null,
        injuries: guided.injuries || null,
        days_per_week: guided.days_per_week,
        session_duration_minutes: guided.session_duration_minutes,
        recovery_quality: null,
        skill_goals: [],
      };
      await saveProfile(user.id, '', profileJson);
      onComplete();
    } catch (err) {
      setError(err?.message || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const trimmed = profileText.trim();
    if (!trimmed || !user?.id || loading) return;
    setLoading(true);
    setError(null);
    try {
      const profileJson = await parseProfile(trimmed);
      await saveProfile(user.id, trimmed, profileJson);
      onComplete();
    } catch (err) {
      const msg = err?.message || "Couldn't read your profile";
      const isFormat = /format|invalid|parse|json/i.test(msg);
      setError(isFormat
        ? `Format issue: ${msg}. Paste the raw AI output (no edits). Max ~${MAX_CHARS} chars.`
        : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const detectedPreview = (() => {
    const t = profileText.trim();
    if (!t) return null;
    const lines = t.split('\n').filter(Boolean);
    const preview = {};
    lines.forEach((line) => {
      if (/goal|train/i.test(line) && !preview.goal) preview.goal = line.replace(/^\d+\.?\s*/, '').slice(0, 60);
      if (/experience|beginner|intermediate|advanced/i.test(line) && !preview.experience) preview.experience = line.replace(/^\d+\.?\s*/, '').slice(0, 40);
      if (/day|week|per/i.test(line) && !preview.days) preview.days = line.replace(/^\d+\.?\s*/, '').slice(0, 30);
      if (/kg|lb|weight|bodyweight/i.test(line) && !preview.bodyweight) preview.bodyweight = line.replace(/^\d+\.?\s*/, '').slice(0, 30);
    });
    return Object.keys(preview).length > 0 ? preview : null;
  })();

  // Step 1: Choice
  if (step === 'choice') {
    return (
      <div className="min-h-full flex flex-col px-6 pt-12 pb-8 bg-[#F8FAFC]">
        <h1 className="text-3xl font-semibold text-[#0F172A]">Build Your Training Profile</h1>
        <p className="text-[#475569] text-base mt-2">Takes under 2 minutes.</p>

        <div className="mt-8 space-y-4">
          <Card className="p-5 border-l-4 border-l-[#F97316]">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F97316]">Recommended</span>
                <h2 className="text-xl font-semibold text-[#0F172A] mt-1">Quick Setup</h2>
                <p className="text-[#475569] text-sm mt-1">Answer guided questions.</p>
              </div>
              <PrimaryButton onClick={() => setStep('guided')}>Start Setup</PrimaryButton>
            </div>
          </Card>

          <Card className="p-5 border-2 border-[#E2E8F0]">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-[#0F172A]">Advanced AI Setup</h2>
              <p className="text-[#475569] text-sm">Import from ChatGPT.</p>
              <SecondaryButton onClick={() => { setStep('ai-import'); setError(null); }}>
                Use AI Import
              </SecondaryButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2a: Guided Setup
  if (step === 'guided') {
    return (
      <div className="min-h-full flex flex-col px-6 pt-8 pb-8 bg-[#F8FAFC] animate-step-in">
        <button
          onClick={() => { setStep('choice'); setError(null); }}
          className="text-[#1E3A8A] text-sm font-medium self-start -ml-1 mb-4 min-h-[44px] min-w-[44px] flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-[#0F172A]">Quick Setup</h1>
        <p className="text-[#475569] text-sm mt-1 mb-6">A few questions to personalize your plan.</p>

        <form onSubmit={handleGuidedSubmit} className="flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Primary Goal</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGuided((p) => ({ ...p, training_goal: p.training_goal === g ? '' : g }))}
                  className={`min-h-[44px] px-4 rounded-full text-sm font-medium transition-all ${
                    guided.training_goal === g
                      ? 'bg-[#F97316] text-white'
                      : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Experience Level</label>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setGuided((p) => ({ ...p, experience_level: p.experience_level === e ? '' : e }))}
                  className={`min-h-[44px] px-4 rounded-full text-sm font-medium transition-all ${
                    guided.experience_level === e
                      ? 'bg-[#F97316] text-white'
                      : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Days per week</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setGuided((p) => ({ ...p, days_per_week: p.days_per_week === d ? null : d }))}
                  className={`min-h-[44px] min-w-[44px] rounded-full text-sm font-medium transition-all ${
                    guided.days_per_week === d
                      ? 'bg-[#F97316] text-white'
                      : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Session length (min)</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setGuided((p) => ({ ...p, session_duration_minutes: d }))}
                  className={`min-h-[44px] px-4 rounded-full text-sm font-medium transition-all ${
                    guided.session_duration_minutes === d
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Bodyweight (optional)</label>
            <input
              type="text"
              value={guided.bodyweight}
              onChange={(e) => setGuided((p) => ({ ...p, bodyweight: e.target.value }))}
              placeholder="e.g. 75 kg"
              className="w-full min-h-[48px] bg-white border-2 border-[#E2E8F0] rounded-xl px-4 text-[#0F172A] placeholder-[#475569]/70 outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Injuries or limitations (optional)</label>
            <input
              type="text"
              value={guided.injuries}
              onChange={(e) => setGuided((p) => ({ ...p, injuries: e.target.value }))}
              placeholder="e.g. Lower back sensitivity"
              className="w-full min-h-[48px] bg-white border-2 border-[#E2E8F0] rounded-xl px-4 text-[#0F172A] placeholder-[#475569]/70 outline-none focus:border-[#3B82F6]"
            />
          </div>

          {error && <p className="text-sm font-medium text-[#EA580C]">{error}</p>}

          <div className="mt-auto pt-6">
            <PrimaryButton type="submit" loading={loading} disabled={!guided.training_goal || !guided.experience_level}>
              Save Profile
            </PrimaryButton>
          </div>
        </form>
      </div>
    );
  }

  // Step 2b: AI Import
  return (
    <div className="min-h-full flex flex-col px-6 pt-8 pb-8 bg-[#F8FAFC] animate-step-in">
      <button
        onClick={() => { setStep('choice'); setError(null); setProfileText(''); }}
        className="text-[#1E3A8A] text-sm font-medium self-start -ml-1 mb-4 min-h-[44px] min-w-[44px] flex items-center"
      >
        ← Back to Guided Setup
      </button>

      <h1 className="text-2xl font-semibold text-[#0F172A]">Import Training Profile</h1>
      <p className="text-[#475569] text-sm mt-1 mb-4">
        Use your own AI (ChatGPT, Claude, etc.). Copy the prompt, run it there, then paste the AI&apos;s response below. Up to ~{MAX_CHARS} chars.
      </p>

      <Card className="p-4 mb-4 border-2 border-dashed border-[#CBD5F5] bg-white/70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1">
              Step 1 &mdash; Copy this prompt to your AI
            </p>
            <pre className="whitespace-pre-wrap text-xs text-[#0F172A] bg-[#F1F5F9] rounded-lg p-3 max-h-48 overflow-y-auto">
              {PROMPT_TEXT}
            </pre>
          </div>
          <SecondaryButton
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(PROMPT_TEXT);
              } catch {
                // ignore clipboard errors; user can still select manually
              }
            }}
          >
            Copy
          </SecondaryButton>
        </div>
      </Card>

      <label className="text-sm font-medium text-[#0F172A] mb-2">
        Step 2 &mdash; Paste the AI output here
      </label>
      <textarea
        value={profileText}
        onChange={(e) => setProfileText(e.target.value)}
        placeholder="Paste the AI output here (no edits, raw text from your AI)..."
        disabled={loading}
        maxLength={MAX_CHARS + 200}
        className="flex-1 min-h-[160px] w-full p-4 bg-white border-2 border-[#E2E8F0] rounded-[20px] text-[#0F172A] placeholder-[#475569]/70 text-base outline-none focus:border-[#3B82F6] resize-none disabled:opacity-50"
      />

      {detectedPreview && (
        <div className="mt-4 p-4 bg-white rounded-[20px] border-2 border-[#E2E8F0] space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#475569]">Detected</p>
          {detectedPreview.goal && <p><span className="text-[#475569]">Goal:</span> {detectedPreview.goal}</p>}
          {detectedPreview.experience && <p><span className="text-[#475569]">Experience:</span> {detectedPreview.experience}</p>}
          {detectedPreview.days && <p><span className="text-[#475569]">Days/week:</span> {detectedPreview.days}</p>}
          {detectedPreview.bodyweight && <p><span className="text-[#475569]">Bodyweight:</span> {detectedPreview.bodyweight}</p>}
        </div>
      )}

      {error && <p className="mt-4 text-sm font-medium text-[#EA580C]">{error}</p>}

      <div className="mt-6 space-y-3">
        <PrimaryButton onClick={handleImport} disabled={!profileText.trim()} loading={loading}>
          Build My Program
        </PrimaryButton>
      </div>
    </div>
  );
}
