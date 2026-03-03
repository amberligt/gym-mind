/**
 * Card — white surface, 20px radius, soft shadow.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`
        bg-white rounded-[20px]
        shadow-[0_2px_12px_rgba(15,23,42,0.06)]
        p-4
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
