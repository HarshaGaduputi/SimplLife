import { request } from "./client";
import type { FocusSession } from "../../../shared/types";

export const focusService = {
  list: () =>
    request<{ success: true; sessions: FocusSession[] }>("/focus"),

  create: (payload: { duration: number; taskTitle?: string | null }) =>
    request<{ success: true; session: FocusSession }>("/focus", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
