import { InputHTMLAttributes, useId } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export default function InputField({
  label,
  hint,
  error,
  className = "",
  ...props
}: InputFieldProps) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1 font-['Inter',sans-serif] ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full rounded-lg border px-4 py-3 text-sm text-gray-900
          placeholder:text-gray-400
          transition-colors duration-150
          outline-none
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand-light"
          }
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        `}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {(hint || error) && (
        <p
          id={`${id}-hint`}
          className={`text-xs ${error ? "text-red-600" : "text-gray-500"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
