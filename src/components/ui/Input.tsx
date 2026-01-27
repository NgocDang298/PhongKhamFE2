import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, icon, fullWidth, className, type, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            className="text-sm font-semibold text-primary"
            htmlFor={props.id}
          >
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full px-4 py-2 rounded-lg border transition-all duration-200 text-sm",
              "bg-white text-gray-800 placeholder:text-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              icon && "pl-10",
              isPassword && "pr-10",
              error
                ? "border-danger-500 focus:ring-danger-500"
                : "border-gray-300 hover:border-gray-400",
              className
            )}
            {...props}
          />
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 z-10 flex items-center justify-center pointer-events-none">
              {icon}
            </span>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
            >
              {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
            </button>
          )}
        </div>
        {error && <span className="text-sm text-danger-500">{error}</span>}
        {helperText && !error && (
          <span className="text-sm text-gray-500 italic">({helperText})</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
