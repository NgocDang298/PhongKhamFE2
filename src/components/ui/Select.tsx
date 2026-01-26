import React, { SelectHTMLAttributes, ReactNode } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  options: readonly SelectOption[] | SelectOption[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  helperText,
  icon,
  fullWidth,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label className="text-sm font-medium text-gray-700" htmlFor={props.id}>
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <select
          className={cn(
            "w-full px-4 py-2 rounded-lg border transition-all duration-200 appearance-none",
            "bg-white text-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "cursor-pointer h-10",
            icon && "pl-10",
            error
              ? "border-danger-500 focus:ring-danger-500"
              : "border-gray-300 hover:border-gray-400",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <span className="text-sm text-danger-500">{error}</span>}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
}
