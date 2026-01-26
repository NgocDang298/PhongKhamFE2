import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center text-nowrap text-sm justify-center h-10 gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-sm hover:shadow-md",
    secondary:
      "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary shadow-sm hover:shadow-md",
    outline:
      "border border-primary text-primary hover:bg-primary/10 focus:ring-primary",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger:
      "bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-sm hover:shadow-md",
    destructive:
      "bg-red-50 border border-red-500 text-red-500 hover:text-white hover:bg-red-500 focus:ring-red-500 shadow-sm hover:shadow-md",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <IconLoader2 size={16} className="animate-spin" />}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
