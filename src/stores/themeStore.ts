import { create } from "zustand";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_KEY = "simpllife-theme";

function readTheme(): ThemeMode {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    if (root.classList.contains("theme-dark")) return "dark";
    if (root.classList.contains("theme-light")) return "light";
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  }
  return "dark"; // Default to dark initially
}

function applyTheme(theme: ThemeMode): void {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem(THEME_KEY, theme);
  }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = readTheme();
  applyTheme(initial);
  return {
    theme: initial,
    setTheme: (t) => {
      applyTheme(t);
      set({ theme: t });
    },
    toggleTheme: () => {
      const next = get().theme === "dark" ? "light" : "dark";
      applyTheme(next);
      set({ theme: next });
    },
  };
});
