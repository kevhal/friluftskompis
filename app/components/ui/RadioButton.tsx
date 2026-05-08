"use client";

import { InputHTMLAttributes, useId } from "react";

interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export default function RadioButton({ label, className = "", ...props }: RadioButtonProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 cursor-pointer select-none font-['Inter',sans-serif] text-sm text-gray-800 ${props.disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        id={id}
        type="radio"
        className={`
          w-5 h-5 border-2 border-brand
          text-brand accent-brand
          disabled:cursor-not-allowed
          focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1
        `}
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
