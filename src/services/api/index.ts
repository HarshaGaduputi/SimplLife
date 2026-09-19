import { request } from "./client";
export { request, HttpError } from "./client";
export { authService } from "./auth.service";
export { groupsService } from "./groups.service";
export { tasksService } from "./tasks.service";
export { goalsService } from "./goals.service";
export { habitsService } from "./habits.service";
export { focusService } from "./focus.service";
export { notesService } from "./notes.service";
export { journalService } from "./journal.service";
export { aiApiService } from "./ai.service";
export { calendarService } from "./calendar.service";
export { activityService } from "./activity.service";

import type { ActivityLog, ExportData, TrashData, Task } from "../../../shared/types";

export const trashService = {
  list: () => request<{ success: true } & TrashData>("/trash"),

  restore: (type: "group" | "task" | "subtask", id: string) =>
    request<{ success: true; message: string }>(`/trash/restore/${type}/${id}`, {
      method: "POST",
    }),

  empty: () =>
    request<{ success: true; message: string; count: number }>("/trash/empty", {
      method: "DELETE",
    }),

  deleteItem: (type: "group" | "task" | "subtask", id: string) =>
    request<{ success: true; message: string }>(`/trash/item/${type}/${id}`, {
      method: "DELETE",
    }),
};

export const activityService = {
  list: (limit = 50, offset = 0) =>
    request<{ success: true; logs: ActivityLog[] }>(
      `/activity?limit=${limit}&offset=${offset}`,
    ),
};

export const exportService = {
  exportData: () => request<ExportData>("/export"),

  importData: (data: ExportData) =>
    request<{
      success: true;
      imported: true;
      summary: { groups: number; tasks: number; subtasks: number };
    }>("/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const stateService = {
  sync: (groups: unknown[]) =>
    request<{ success: true; synced: boolean }>("/state/sync", {
      method: "PATCH",
      body: JSON.stringify({ groups }),
    }),
};

export const contactService = {
  send: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: true; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const templatesService = {
  list: () =>
    request<{
      success: true;
      templates: Array<{
        id: string;
        slug: string;
        name: string;
        description: string;
        mainTaskTitle: string;
        subtasks: Array<{ title: string; order: number }>;
      }>;
    }>("/templates"),

  apply: (payload: { templateId: string; groupId: string; mainTaskName: string }) =>
    request<{ success: true; task: Task }>("/templates/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
