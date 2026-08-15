import { request } from "./client";
import type { Goal } from "../../../shared/types";

export const goalsService = {
  list: () =>
    request<{ success: true; goals: Goal[] }>("/goals"),

  create: (payload: {
    title: string;
    description?: string | null;
    targetDate?: string | null;
    category?: string | null;
    milestones?: string[];
  }) =>
    request<{ success: true; goal: Goal }>("/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (
    id: string,
    payload: {
      title?: string;
      description?: string | null;
      targetDate?: string | null;
      completed?: boolean;
      category?: string | null;
      progress?: number;
      milestones?: { id: string; title: string; completed: boolean }[];
    }
  ) =>
    request<{ success: true; goal: Goal }>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ success: true; message: string }>(`/goals/${id}`, {
      method: "DELETE",
    }),
};
