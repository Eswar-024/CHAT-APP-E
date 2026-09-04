import { useState } from "react";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

function InputBox({
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  error,
  htmlFor,
  disabled,
  icon: Icon,
  autoComplete,
  label,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-900"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={htmlFor}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          type={actualType}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${htmlFor}-error` : undefined}
          className={`w-full rounded-2xl border-2 bg-white py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none ${
            Icon ? "pl-11" : "pl-4"
          } ${isPasswordType ? "pr-11" : "pr-4"} ${
            error
              ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
              : "border-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 shadow-[2px_2px_0px_rgba(15,23,42,1)]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 transition-colors hover:text-slate-950 focus:outline-none"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <div className="min-h-[20px] pt-1">
        {error ? (
          <p
            id={`${htmlFor}-error`}
            className="flex items-center gap-1 text-xs font-bold text-red-600 animate-fadeIn"
          >
            <FiAlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default InputBox;
