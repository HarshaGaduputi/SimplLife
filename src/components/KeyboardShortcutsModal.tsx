import { Keyboard, X } from "lucide-react";
import { useUIStore } from "../stores/uiStore";

export function KeyboardShortcutsModal() {
  const open = useUIStore((s) => s.shortcutsModalOpen);
  const setOpen = useUIStore((s) => s.setShortcutsModalOpen);

  if (!open) return null;

  const shortcuts = [
    { key: "?", description: "Open keyboard shortcuts modal" },
    { key: "Cmd + K / Ctrl + K", description: "Focus search bar" },
    { key: "Cmd + D / Ctrl + D", description: "Add/edit description for focused task" },
    { key: "Cmd + Z / Ctrl + Z", description: "Undo last action" },
    { key: "Cmd + Shift + Z / Ctrl + Y", description: "Redo action" },
    { key: "Alt + G", description: "Create new group" },
    { key: "Alt + T", description: "Navigate to Templates" },
    { key: "Alt + S", description: "Navigate to Settings" },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-6 md:p-8"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-subtle mb-6">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                color: "var(--color-text-strong)",
              }}
            >
              <Keyboard size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text-strong)" }}>
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-text-muted">Master SimplLife with quick keystrokes</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-surface-alt text-text-muted hover:text-text-strong"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 p-3 rounded-2xl border"
              style={{
                background: "var(--color-surface-alt)",
                borderColor: "var(--color-border-subtle)",
              }}
            >
              <span className="text-sm font-medium">{s.description}</span>
              <kbd
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border shadow-xs"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-strong)",
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-subtle flex justify-end">
          <button onClick={() => setOpen(false)} className="btn-primary px-6">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
