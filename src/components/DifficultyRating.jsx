import { ProgressBar, InlineRatingStrip } from './ActiveExercise';

export default function DifficultyRating({
  exerciseName,
  onRate,
  onSkip,
  flatExercises,
  exerciseIndex,
  totalExercises,
  blockName,
}) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#F8FAFC]">
      {flatExercises && (
        <ProgressBar
          exerciseIndex={exerciseIndex}
          totalExercises={totalExercises}
          flatExercises={flatExercises}
          blockName={blockName || ''}
        />
      )}

      <div className="flex-1 flex flex-col justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#475569] mb-1">How did that set feel?</p>
        <h2 className="text-[20px] font-semibold text-[#0F172A] mb-6 leading-tight">{exerciseName}</h2>

        <InlineRatingStrip
          interactive
          onRate={onRate}
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}
