/** Centralized app-wide constants */

export const APP_NAME = "SimplLife" as const;

export const TOKEN_KEY = "simpllife-token" as const;
export const THEME_KEY = "simpllife-theme" as const;

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api";

export const HISTORY_MAX = 50 as const;
export const TOAST_DURATION_MS = 5500 as const;
export const DEBOUNCE_MS = 300 as const;
export const SEARCH_MIN_CHARS = 1 as const;
export const SUGGESTION_MIN_CHARS = 4 as const;
export const AI_SUBTASK_CAP = 5 as const;
