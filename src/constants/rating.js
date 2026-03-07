/**
 * Single scale for "how was this set?" — used for logging and next-set adjustment.
 * 1 = easy (can go heavier next time)
 * 2 = good (sweet spot)
 * 3 = hard (reduce weight/reps next time)
 */
export const DIFFICULTY_RATINGS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Good' },
  { value: 3, label: 'Hard' },
];

export function getDifficultyLabel(value) {
  if (value == null) return '—';
  const r = DIFFICULTY_RATINGS.find((x) => x.value === value);
  return r ? r.label : String(value);
}

/** For display when we have an average (e.g. 1.5 → "Easy" / "Good") */
export function getAverageDifficultyLabel(avg) {
  if (avg == null || Number.isNaN(avg)) return '—';
  const n = Number(avg);
  if (n < 1.5) return DIFFICULTY_RATINGS[0].label;
  if (n < 2.5) return DIFFICULTY_RATINGS[1].label;
  return DIFFICULTY_RATINGS[2].label;
}
