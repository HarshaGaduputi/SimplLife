import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useUIStore } from "../stores/uiStore";

export function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[10000] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-96">
      {toasts.map((t) => {
        const icon =
          t.kind === "success" ? (
            <CheckCircle2 size={18} />
          ) : t.kind === "error" ? (
            <AlertTriangle size={18} />
          ) : (
            <Info size={18} />
          );
        const accent =
          t.kind === "success"
            ? "var(--color-primary)"
            : t.kind === "error"
              ? "#d97757"
              : "var(--color-primary)";
        return (
          <div
            key={t.id}
            className="pointer-events-auto animate-pop shadow-2xl rounded-2xl border flex items-start gap-3 px-4 py-3"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border-subtle)",
              color: "var(--color-text)",
            }}
          >
            <div style={{ color: accent }}>{icon}</div>
            <div className="flex-1 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>{t.message}</span>
              {t.actionLabel && t.onAction && (
                <button
                  onClick={() => {
                    t.onAction?.();
                    dismiss(t.id);
                  }}
                  className="font-semibold underline hover:no-underline text-xs shrink-0"
                  style={{ color: accent }}
                >
                  {t.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="h-8 w-8 -mr-1 -mt-1 rounded-lg flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
