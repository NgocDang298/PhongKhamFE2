import React, { ReactNode } from "react";
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export default function Alert({
  variant = "info",
  title,
  children,
  className,
  onClose,
}: AlertProps) {
  const variants = {
    success: {
      container: "bg-success-50 border-success-200 text-success-800",
      icon: <IconCheck size={20} className="text-success-600" />,
    },
    error: {
      container: "bg-danger-50 border-danger-200 text-danger-800",
      icon: <IconX size={20} className="text-danger-600" />,
    },
    warning: {
      container: "bg-warning-50 border-warning-200 text-warning-800",
      icon: <IconAlertCircle size={20} className="text-warning-600" />,
    },
    info: {
      container: "bg-primary/10 border-primary/20 text-primary",
      icon: <IconInfoCircle size={20} className="text-primary" />,
    },
  };

  const config = variants[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        config.container,
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        >
          <IconX size={16} />
        </button>
      )}
    </div>
  );
}
