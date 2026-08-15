import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-14 p-1 rounded-full border transition-colors duration-300"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun size={14} className={isDark ? "opacity-50" : "opacity-0"} style={{ color: "var(--color-text-muted)" }} />
        <Moon size={14} className={isDark ? "opacity-0" : "opacity-50"} style={{ color: "var(--color-text-muted)" }} />
      </div>
      <div
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-300 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {isDark ? <Moon size={12} /> : <Sun size={12} />}
      </div>
    </button>
  );
}
