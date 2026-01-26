import React, { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export default function Textarea({
  label,
  error,
  helperText,
  fullWidth,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label className="text-sm font-semibold text-primarygray-700" htmlFor={props.id}>
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-4 py-2 rounded-lg border transition-all duration-200",
          "bg-white text-gray-800 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          "resize-y min-h-[100px]",
          error
            ? "border-danger-500 focus:ring-danger-500"
            : "border-gray-300 hover:border-gray-400",
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-danger-500">{error}</span>}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
}
