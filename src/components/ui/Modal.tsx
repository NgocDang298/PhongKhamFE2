import React, { ReactNode, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full bg-white rounded-xl shadow-2xl animate-slideInUp",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-primary">{title}</h2>
            )}
            {showCloseButton && (
              <button
                className="rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <IconX size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-4 flex items-center gap-4 border-t border-gray-200 bg-gray-50 rounded-b-xl self-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
