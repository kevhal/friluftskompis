"use client";

import { useId } from "react";

interface ToggleProps {
  toggled?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Toggle({
  toggled = false,
  onChange,
  label,
  disabled = false,
  className = "",
}: ToggleProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 cursor-pointer select-none font-['Inter',sans-serif] text-sm text-gray-800 ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={toggled}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
          aria-checked={toggled}
        />
        {/* Track */}
        <div
          className={`
            w-[64px] h-[32px] rounded-full transition-colors duration-200
            ${toggled ? "bg-brand" : "bg-gray-300"}
            peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2
          `}
        />
        {/* Thumb */}
        <div
          className={`
            absolute top-[4px] left-[4px]
            w-[24px] h-[24px] rounded-full bg-white shadow
            transition-transform duration-200
            ${toggled ? "translate-x-[32px]" : "translate-x-0"}
          `}
        />
      </div>
      {label && <span>{label}</span>}
    </label>
  );
}
