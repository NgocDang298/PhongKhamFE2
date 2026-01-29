import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/15 text-emerald-600",
  warning: "bg-amber-500/15 text-amber-600",
  danger: "bg-rose-500/15 text-rose-600",
  info: "bg-blue-500/15 text-blue-600",
  purple: "bg-violet-500/15 text-violet-600",
  gray: "bg-slate-500/15 text-slate-600",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-semibold rounded-full inline-block whitespace-nowrap",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
