/**
 * Primary CTA button — orange, pill-shaped, high contrast.
 */
export default function PrimaryButton({ children, disabled, loading, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        w-full min-h-[56px] h-14 px-6
        bg-[#F97316] text-white font-semibold
        rounded-full
        shadow-[0_4px_14px_rgba(249,115,22,0.35)]
        transition-all duration-150
        active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="h-5 w-12 rounded animate-pulse bg-white/30" />
      ) : (
        children
      )}
    </button>
  );
}
