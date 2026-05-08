import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-brand text-white border border-brand",
    "hover:bg-brand-hover hover:border-brand-hover",
    "active:bg-brand-active active:border-brand-active",
    "disabled:bg-brand-muted disabled:border-brand-muted disabled:cursor-not-allowed",
  ].join(" "),

  secondary: [
    "bg-white text-brand border border-brand",
    "hover:bg-brand-light/30",
    "active:bg-brand-light/60",
    "disabled:text-brand-muted disabled:border-brand-muted disabled:cursor-not-allowed",
  ].join(" "),

  text: [
    "bg-transparent text-brand border border-transparent underline-offset-2",
    "hover:underline",
    "active:text-brand-active",
    "disabled:text-brand-muted disabled:cursor-not-allowed disabled:no-underline",
  ].join(" "),
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-2xl px-5 py-3
        text-sm font-medium font-['Inter',sans-serif]
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
