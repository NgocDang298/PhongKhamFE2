import React from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <IconLoader2
      size={sizes[size]}
      className={cn("animate-spin text-primary", className)}
    />
  );
}
