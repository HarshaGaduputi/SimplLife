import { create } from "zustand";
import { authService, HttpError } from "../services/api";
import type { User } from "../../shared/types";

interface AuthState {
  user: User | null;
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,

  clearError: () => set({ error: null }),
  setUser: (u) => set({ user: u }),


  signUp: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register(payload);
      set({ user: res.user, loading: false, hydrated: true });
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
      const res = await authService.login(payload);
      set({ user: res.user, loading: false, hydrated: true });
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

  signOut: async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    set({ user: null, error: null });
  },

  hydrate: async () => {
    set({ loading: true });
    try {
      const res = await authService.me();
      set({ user: res.user, hydrated: true, loading: false });
    } catch {
      set({ user: null, hydrated: true, loading: false });
    }
  },
}));
