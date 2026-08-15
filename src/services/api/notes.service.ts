import { request } from "./client";
import type { Note } from "../../../shared/types";

export const notesService = {
  list: () =>
    request<{ success: true; notes: Note[] }>("/notes"),

  get: (id: string) =>
    request<{ success: true; note: Note }>(`/notes/${id}`),

  create: (payload: { title: string; content: string; tags?: string[] }) =>
    request<{ success: true; note: Note }>("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: { title?: string; content?: string; tags?: string[] }) =>
    request<{ success: true; note: Note }>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ success: true; message: string }>(`/notes/${id}`, {
      method: "DELETE",
    }),
};
