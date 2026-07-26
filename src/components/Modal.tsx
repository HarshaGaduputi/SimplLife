import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClass = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={
          "relative z-10 w-full " +
          maxWidthClass +
          " rounded-t-3xl sm:rounded-2xl shadow-2xl animate-pop overflow-hidden"
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        {(title || onClose) && (
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <h3
              className="font-display text-lg font-semibold"
              style={{ color: "var(--color-text-strong)" }}
            >
              {title}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="h-9 w-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div
            className="px-5 py-4 border-t flex items-center justify-end gap-2"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
