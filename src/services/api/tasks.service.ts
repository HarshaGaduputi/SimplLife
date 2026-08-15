import { request } from "./client";
import type { PriorityLevel, Subtask, Task } from "../../../shared/types";

interface TaskResponse {
  success: true;
  task: Task;
}

interface SubtaskResponse {
  success: true;
  subtask: { id: string; title: string };
}

export type TaskCreatePayload = {
  title: string;
  description?: string | null;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
};

export type TaskUpdatePayload = {
  title?: string;
  description?: string | null;
  completed?: boolean;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
};

export const tasksService = {
  list: (groupId: string) =>
    request<{ success: true; tasks: Task[] }>(`/groups/${groupId}/tasks`),
  listAll: () =>
    request<{ success: true; tasks: Task[] }>(`/tasks/all`),

  create: (groupId: string, payload: TaskCreatePayload) =>
    request<TaskResponse>(`/groups/${groupId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, patch: TaskUpdatePayload) =>
    request<TaskResponse>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  remove: (id: string) =>
    request<{ success: true }>(`/tasks/${id}`, { method: "DELETE" }),

  complete: (id: string) =>
    request<TaskResponse>(`/tasks/${id}/complete`, { method: "PATCH" }),

  uncomplete: (id: string) =>
    request<TaskResponse>(`/tasks/${id}/uncomplete`, { method: "PATCH" }),

  listUpcoming: () =>
    request<{ success: true; today: string; tasks: Task[] }>("/tasks/upcoming"),

  aiSplit: (taskId: string) =>
    request<{ success: true; subtasks: Array<{ id: string; title: string }> }>(
      `/tasks/${taskId}/ai-split`,
      { method: "POST" },
    ),

  createSubtask: (taskId: string, payload: { title: string; order?: number }) =>
    request<SubtaskResponse>(`/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSubtask: (id: string, patch: { title?: string; completed?: boolean; order?: number }) =>
    request<{ success: true; subtask: Subtask }>(`/tasks/subtasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  removeSubtask: (id: string) =>
    request<{ success: true }>(`/tasks/subtasks/${id}`, { method: "DELETE" }),
};
