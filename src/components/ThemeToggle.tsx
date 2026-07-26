import { useUIStore } from "../stores/uiStore";
import { Tooltip } from "./Tooltip";

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const isLight = theme === "light";
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";

  return (
    <Tooltip label={label} position="left">
      <button
        aria-label={label}
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-[9999] h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-106 active:scale-95"
        style={{
          backgroundColor: isLight
            ? "var(--color-venice-blue)"
            : "var(--color-ocean)",
          color: isLight ? "#FFFFFF" : "var(--color-noir)",
        }}
      >
        {isLight ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2.1A1 1 0 0 0 8.22 1a10 10 0 1 0 14.76 12.53 1 1 0 0 0-1.34-.53z" />
          </svg>
        )}
      </button>
    </Tooltip>
  );
}
