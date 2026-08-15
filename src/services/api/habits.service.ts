import { request } from "./client";
import type { Habit } from "../../../shared/types";

export const habitsService = {
  list: () =>
    request<{ success: true; habits: Habit[] }>("/habits"),

  create: (payload: { title: string; frequency: "daily" | "weekly" | "monthly" }) =>
    request<{ success: true; habit: Habit }>("/habits", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggle: (id: string, date: string) =>
    request<{ success: true; habit: Habit }>(`/habits/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ date }),
    }),

  delete: (id: string) =>
    request<{ success: true; message: string }>(`/habits/${id}`, {
      method: "DELETE",
    }),
};
