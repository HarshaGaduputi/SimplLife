import { request } from "./client";
import type { JournalEntry } from "../../../shared/types";

export const journalService = {
  list: () =>
    request<{ success: true; journalEntries: JournalEntry[] }>("/journal"),

  get: (date: string) =>
    request<{ success: true; entry: JournalEntry | null }>(`/journal/${date}`),

  save: (payload: {
    date: string;
    mood: "great" | "good" | "okay" | "bad" | "terrible";
    gratitude?: string;
    reflection?: string;
  }) =>
    request<{ success: true; entry: JournalEntry }>("/journal", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
