import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClass = "max-w-md",
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus Trap
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement.focus();
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-desc" : undefined}
        className={cn(
          "relative z-10 w-full rounded-t-dialog sm:rounded-dialog shadow-lg animate-pop overflow-hidden bg-surface border border-border-subtle",
          maxWidthClass
        )}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
            <div>
              {title && (
                <h3 id="dialog-title" className="text-h3 font-semibold text-text-strong">
                  {title}
                </h3>
              )}
              {description && (
                <p id="dialog-desc" className="text-xs text-text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="h-9 w-9 rounded-btn flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-6 text-body text-text">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-alt flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
