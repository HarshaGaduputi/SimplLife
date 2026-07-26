import { create } from "zustand";
import { api, setToken, getToken, HttpError } from "../lib/api";
import type { User } from "../../shared/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  signUp: (payload: { name: string; email: string; password: string }) => Promise<
    | { success: true }
    | { success: false; error: string; issues?: string[] }
  >;
  signIn: (payload: { email: string; password: string }) => Promise<
    | { success: true }
    | { success: false; error: string; issues?: string[] }
  >;
  signOut: () => void;
  setUser: (u: User | null) => void;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  hydrated: false,
  error: null,

  clearError: () => set({ error: null }),
  setUser: (u) => set({ user: u }),


  signUp: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.register(payload);
      setToken(res.token);
      set({ user: res.user, token: res.token, loading: false, hydrated: true });
      return { success: true as const };
    } catch (e) {
      const err = e as HttpError;
      set({ loading: false, error: err.message });
      return {
        success: false as const,
        error: err.message,
        issues: err.issues,
      };
    }
  },

  signIn: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.login(payload);
      setToken(res.token);
      set({ user: res.user, token: res.token, loading: false, hydrated: true });
      return { success: true as const };
    } catch (e) {
      const err = e as HttpError;
      set({ loading: false, error: err.message });
      return {
        success: false as const,
        error: err.message,
        issues: err.issues,
      };
    }
  },

  signOut: () => {
    setToken(null);
    set({ user: null, token: null, error: null });
  },

  hydrate: async () => {
    const token = getToken();
    if (!token) {
      set({ hydrated: true, user: null, token: null });
      return;
    }
    set({ token, loading: true });
    try {
      const res = await api.me();
      set({ user: res.user, hydrated: true, loading: false });
    } catch {
      setToken(null);
      set({ user: null, token: null, hydrated: true, loading: false });
    }
    void get;
  },
}));
