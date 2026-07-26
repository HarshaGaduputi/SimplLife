import type { ActivityLog, ExportData, PriorityLevel, Task, TrashData, User } from "../../shared/types";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
  auth?: boolean;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = "tasknest-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export interface ApiError {
  success: false;
  error: string;
  issues?: string[];
  status: number;
}

export class HttpError extends Error {
  status: number;
  issues?: string[];
  constructor(message: string, status: number, issues?: string[]) {
    super(message);
    this.status = status;
    this.issues = issues;
    this.name = "HttpError";
  }
}

async function request<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, auth = true, headers, ...rest } = options;
  const url = new URL(BASE_URL + path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url.toString(), {
    ...rest,
    headers: finalHeaders,
  });
  let body: unknown;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const isObj = body && typeof body === "object";
    const err = (isObj && (body as { error?: string }).error) || res.statusText;
    const issues =
      isObj && Array.isArray((body as { issues?: unknown }).issues)
        ? ((body as { issues: unknown[] }).issues as string[])
        : undefined;
    throw new HttpError(err, res.status, issues);
  }
  return body as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ success: true; token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ success: true; token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),
  logout: () =>
    request<{ success: true; message: string }>("/auth/logout", {
      method: "POST",
    }),
  me: () => request<{ success: true; user: User }>("/auth/me"),
  patchUser: (patch: { name?: string; digestEmailsEnabled?: boolean }) =>
    request<{ success: true; user: User }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  // Groups
  listGroups: () =>
    request<{
      success: true;
      groups: Array<{
        id: string;
        userId: string;
        name: string;
        order: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/groups"),
  createGroup: (name: string) =>
    request<{ success: true; group: { id: string; name: string } }>("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  updateGroup: (id: string, patch: { name?: string }) =>
    request<{ success: true; group: { id: string; name: string } }>(
      `/groups/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      },
    ),
  deleteGroup: (id: string) =>
    request<{ success: true }>(`/groups/${id}`, { method: "DELETE" }),

  // Tasks (by group)
  listTasks: (groupId: string) =>
    request<{
      success: true;
      tasks: Task[];
    }>(`/groups/${groupId}/tasks`),
  createTask: (
    groupId: string,
    payload: {
      title: string;
      description?: string | null;
      order?: number;
      templateId?: string | null;
      priority?: PriorityLevel | null;
      dueDate?: string | null;
    },
  ) =>
    request<{ success: true; task: Task }>(`/groups/${groupId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Task-level updates
  updateTask: (
    id: string,
    patch: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      order?: number;
      templateId?: string | null;
      priority?: PriorityLevel | null;
      dueDate?: string | null;
    },
  ) =>
    request<{ success: true; task: Task }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteTask: (id: string) =>
    request<{ success: true }>(`/tasks/${id}`, { method: "DELETE" }),
  completeTask: (id: string) =>
    request<{ success: true; task: Task }>(`/tasks/${id}/complete`, {
      method: "PATCH",
    }),
  uncompleteTask: (id: string) =>
    request<{ success: true; task: Task }>(`/tasks/${id}/uncomplete`, {
      method: "PATCH",
    }),
  listUpcomingTasks: () =>
    request<{ success: true; today: string; tasks: Task[] }>(
      "/tasks/upcoming",
    ),

  // Subtasks
  createSubtask: (
    taskId: string,
    payload: { title: string; order?: number },
  ) =>
    request<{ success: true; subtask: { id: string; title: string } }>(
      `/tasks/${taskId}/subtasks`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  updateSubtask: (
    id: string,
    patch: { title?: string; completed?: boolean; order?: number },
  ) =>
    request<{ success: true; subtask: { id: string } }>(
      `/tasks/subtasks/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      },
    ),
  deleteSubtask: (id: string) =>
    request<{ success: true }>(`/tasks/subtasks/${id}`, { method: "DELETE" }),

  // AI Auto-Split
  aiSplitTask: (taskId: string) =>
    request<{ success: true; subtasks: Array<{ id: string; title: string }> }>(
      `/tasks/${taskId}/ai-split`,
      { method: "POST" },
    ),

  // Templates
  listTemplates: () =>
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
    }>("/templates", { auth: false }),
  applyTemplate: (payload: {
    templateId: string;
    groupId: string;
    mainTaskName: string;
  }) =>
    request<{ success: true; task: Task }>("/templates/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Contact
  contact: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) =>
    request<{ success: true; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),

  // Trash / Soft delete
  listTrash: () => request<{ success: true } & TrashData>("/trash"),
  restoreTrashItem: (type: "group" | "task" | "subtask", id: string) =>
    request<{ success: true; message: string }>(`/trash/restore/${type}/${id}`, {
      method: "POST",
    }),
  emptyTrash: () =>
    request<{ success: true; message: string; count: number }>("/trash/empty", {
      method: "DELETE",
    }),
  deleteTrashItem: (type: "group" | "task" | "subtask", id: string) =>
    request<{ success: true; message: string }>(`/trash/item/${type}/${id}`, {
      method: "DELETE",
    }),

  // Activity Log
  listActivity: (limit = 50, offset = 0) =>
    request<{ success: true; logs: ActivityLog[] }>(
      `/activity?limit=${limit}&offset=${offset}`,
    ),

  // Export / Import
  exportData: async (): Promise<ExportData> => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new HttpError("Export failed", res.status);
    return (await res.json()) as ExportData;
  },
  importData: (data: ExportData) =>
    request<{
      success: true;
      imported: true;
      summary: { groups: number; tasks: number; subtasks: number };
    }>("/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // State Sync
  syncState: (groups: any[]) =>
    request<{ success: true; synced: boolean }>("/state/sync", {
      method: "PATCH",
      body: JSON.stringify({ groups }),
    }),
};
