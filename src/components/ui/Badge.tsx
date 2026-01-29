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
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  danger: "bg-rose-500/15 text-rose-600 border-rose-500/20",
  info: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  purple: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  gray: "bg-slate-500/15 text-slate-600 border-slate-500/20",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-bold rounded-full inline-block whitespace-nowrap border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
