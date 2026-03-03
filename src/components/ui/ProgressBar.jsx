/**
 * Progress bar — blue fill, border background.
 */
export default function ProgressBar({ value = 0, max = 100, className = '' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`h-2 rounded-full bg-[#E2E8F0] overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full bg-[#1E3A8A] transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
