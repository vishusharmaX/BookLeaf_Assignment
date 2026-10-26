import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-charcoal placeholder-[#8A9992] transition-colors focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600 disabled:bg-ivory-100 disabled:opacity-75 ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[#DCD0C0]"
          } ${className}`}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-charcoal-muted">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
