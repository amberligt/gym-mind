/**
 * Streak badge — orange pill with flame icon.
 */
export default function StreakBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F97316] text-white text-sm font-semibold rounded-full">
      <FlameIcon />
      {count} Day Streak
    </span>
  );
}

function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 23c4.97 0 9-3.582 9-8s-4.03-8-9-8c-1.5 0-2.89.416-4.09 1.14C7.5 8 6 9.5 6 12c0 2.5 1.5 4 3.91 4.14.56-.72 1.34-1.14 2.19-1.14 1.74 0 3.15 1.41 3.15 3.15 0 1.74-1.41 3.15-3.15 3.15-2.31 0-4.1-1.88-4.1-4.2 0-2.32 1.79-4.2 4.1-4.2.65 0 1.26.16 1.8.44-.39-.83-.6-1.74-.6-2.69 0-3.31 2.69-6 6-6s6 2.69 6 6c0 4.42-3.58 8-8 8z" />
    </svg>
  );
}
