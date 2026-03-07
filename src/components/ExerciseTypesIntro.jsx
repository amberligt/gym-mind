/**
 * Exercise Types — intro screen: Back, title, subtitle, 4 type cards, footer banner.
 * Matches spec: light background, rounded cards with colored icon squares, peach banner.
 */
const EXERCISE_TYPES = [
  {
    id: 'weight',
    title: 'Weight Exercise',
    description: 'Standard strength training with weight and reps',
    iconBg: '#4285F4',
    Icon: WeightIcon,
  },
  {
    id: 'superset',
    title: 'Superset',
    description: 'Two exercises performed back-to-back',
    iconBg: '#9C27B0',
    Icon: SupersetIcon,
  },
  {
    id: 'timed',
    title: 'Timed Exercise',
    description: 'Hold or perform for a set duration',
    iconBg: '#FF9800',
    Icon: TimedIcon,
  },
  {
    id: 'cardio',
    title: 'Cardio',
    description: 'Warm-up, cardio, or cooldown activity',
    iconBg: '#F44336',
    Icon: CardioIcon,
  },
];

function WeightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="5" height="8" rx="1" />
      <rect x="15" y="8" width="5" height="8" rx="1" />
      <path d="M9 12h6" />
    </svg>
  );
}

function SupersetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="12" r="3.5" />
      <circle cx="16" cy="12" r="3.5" />
      <path d="M11.5 12h1" />
    </svg>
  );
}

function TimedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function CardioIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export default function ExerciseTypesIntro({ onBack }) {
  return (
    <div className="min-h-full flex flex-col bg-[#F5F5F5]">
      <div className="shrink-0 px-6 pt-6 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[#4A4A4A] font-medium text-base min-h-[44px] min-w-[44px] -ml-2"
        >
          <span aria-hidden>←</span>
          <span>Back</span>
        </button>
      </div>

      <div className="flex-1 px-6 pt-2 pb-8 overflow-y-auto">
        <h1 className="text-[28px] font-bold leading-tight text-[#2D2D2D]">Exercise Types</h1>
        <p className="text-sm text-[#757575] mt-2">Select a logging style to preview</p>

        <div className="mt-8 space-y-4">
          {EXERCISE_TYPES.map(({ id, title, description, iconBg, Icon }) => (
            <div
              key={id}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              <div
                className="w-[56px] h-[56px] rounded-[14px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: iconBg }}
              >
                <Icon />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-[#2D2D2D] text-[15px]">{title}</h2>
                <p className="text-[13px] text-[#757575] mt-1 leading-snug">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl px-5 py-4 bg-[#FFF3E0]">
          <p className="text-[14px] text-[#2D2D2D] leading-snug">
            Each type is optimized for quick logging during your workout
          </p>
        </div>
      </div>
    </div>
  );
}
