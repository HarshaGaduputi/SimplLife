import { request } from "./client";
import type { User } from "../../../shared/types";

interface AuthResponse {
  success: true;
  user: User;
}

export const authService = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ success: true; message: string }>("/auth/logout", {
      method: "POST",
    }),

  me: () => request<{ success: true; user: User }>("/auth/me"),

  updateMe: (patch: { name?: string; digestEmailsEnabled?: boolean }) =>
    request<{ success: true; user: User }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};
