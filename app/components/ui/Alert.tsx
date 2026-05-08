"use client";

type AlertType = "info" | "success" | "warning" | "error";

interface AlertProps {
  type?: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const typeClasses: Record<AlertType, { wrapper: string; icon: string; text: string }> = {
  info:    { wrapper: "bg-[#dbeafe] border-[#1d4ed8]", icon: "ℹ️", text: "text-[#1d4ed8]" },
  success: { wrapper: "bg-[#d4ffcf] border-[#0f8402]", icon: "✅", text: "text-[#0f8402]" },
  warning: { wrapper: "bg-[#ffdac2] border-[#e15b02]", icon: "⚠️", text: "text-[#e15b02]" },
  error:   { wrapper: "bg-[#ffcece] border-[#bf0000]", icon: "❌", text: "text-[#bf0000]" },
};

export default function Alert({
  type = "info",
  message,
  onClose,
  className = "",
}: AlertProps) {
  const { wrapper, icon, text } = typeClasses[type];

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-['Inter',sans-serif] ${wrapper} ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className={`flex-1 font-medium ${text}`}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Lukk varsel"
          className={`${text} opacity-60 hover:opacity-100 transition-opacity ml-2`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
