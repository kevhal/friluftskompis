"use client";

interface BadgeProps {
  label: string;
  actionable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function Badge({
  label,
  actionable = false,
  onRemove,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full bg-brand-light text-brand-dark
        px-3 py-0.5 text-xs font-medium font-['Inter',sans-serif]
        ${className}
      `}
    >
      {label}
      {actionable && (
        <button
          onClick={onRemove}
          aria-label={`Fjern ${label}`}
          className="text-brand-dark opacity-60 hover:opacity-100 transition-opacity leading-none"
        >
          ✕
        </button>
      )}
    </span>
  );
}
