/**
 * Secondary button — blue outline, pill-shaped.
 */
export default function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`
        min-h-[48px] h-12 px-6
        border-2 border-[#1E3A8A] text-[#1E3A8A]
        bg-white font-medium
        rounded-full
        transition-all duration-150
        active:opacity-80 disabled:opacity-50
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
