/**
 * Profile — training phase, fields, strength numbers, Recalculate CTA.
 * Whole card tappable. Orange + Blue.
 */
import PrimaryButton from './ui/PrimaryButton';

export default function ProfileView({ profile, onBack, onRecalculate }) {
  const p = profile?.profile_json ?? {};
  const items = [
    ['Primary Goal', p.training_goal],
    ['Experience', p.experience_level ? `${p.experience_level}${p.experience_years != null ? ` (${p.experience_years} yrs)` : ''}` : null],
    ['Days per week', p.days_per_week],
    ['Bodyweight', p.bodyweight],
    ['Injuries', p.injuries],
  ];
  const strength = p.strength_numbers;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F8FAFC]">
      <div className="shrink-0 px-6 pt-6 pb-2">
        <button
          onClick={onBack}
          className="text-[#1E3A8A] font-medium text-base min-h-[44px] min-w-[44px] -ml-2 flex items-center"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <h1 className="text-2xl font-semibold text-[#0F172A]">Your Profile</h1>
        <p className="text-sm text-[#475569] mt-1">Training Phase: Strength Block Week 3/6</p>

        <div className="mt-6 space-y-4">
          {items.filter(([, v]) => v).map(([label, value], i) => (
            <button
              key={i}
              type="button"
              onClick={() => {}}
              className="w-full text-left bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4 border-2 border-transparent hover:border-[#E2E8F0] transition-colors min-h-[56px]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1">{label}</p>
              <p className="text-base font-medium text-[#0F172A]">{value}</p>
            </button>
          ))}

          {strength && Object.keys(strength).length > 0 && (
            <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">Strength Numbers</p>
              <div className="space-y-2">
                {Object.entries(strength)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-sm text-[#475569] capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-[#0F172A]">{v}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {p.skill_goals?.length > 0 && (
            <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Skill Goals</p>
              <div className="flex flex-wrap gap-2">
                {p.skill_goals.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
        <PrimaryButton onClick={onRecalculate ?? onBack}>
          Recalculate Program
        </PrimaryButton>
      </div>
    </div>
  );
}
