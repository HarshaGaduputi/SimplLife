export type ThemeMode = "light" | "dark";
export type PriorityLevel = "high" | "medium" | "low" | "none";

export interface User {
  id: string;
  name: string;
  email: string;
  digestEmailsEnabled?: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  userId: string;
  name: string;
  order: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  order: number;
  templateId: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface TemplateSubtaskDef {
  title: string;
  order: number;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description: string;
  mainTaskTitle: string;
  subtasks: TemplateSubtaskDef[];
  builtin?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: "group" | "task" | "subtask" | "template" | "user";
  entityName: string;
  detail: string | null;
  createdAt: string;
}

export interface TrashData {
  groups: (Group & { taskCount?: number })[];
  tasks: (Task & { groupName?: string })[];
  subtasks: (Subtask & { taskTitle?: string; groupName?: string })[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateGroupRequest { name: string; }
export interface UpdateGroupRequest { name?: string; }

export interface CreateTaskRequest {
  title: string;
  description?: string;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  completed?: boolean;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
}

export interface CreateSubtaskRequest {
  title: string;
  order?: number;
}

export interface UpdateSubtaskRequest {
  title?: string;
  completed?: boolean;
  order?: number;
}

export interface ApplyTemplateRequest {
  templateId: string;
  groupId: string;
  mainTaskName: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ExportData {
  exported_at: string;
  user: { name: string; email: string };
  groups: {
    name: string;
    position: number;
    tasks: {
      name: string;
      description: string | null;
      priority: PriorityLevel | null;
      due_date: string | null;
      is_completed: boolean;
      position: number;
      subtasks: { name: string; is_completed: boolean; position: number }[];
    }[];
  }[];
}

