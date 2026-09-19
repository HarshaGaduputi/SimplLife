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
  description: string | null;
  coverImage: string | null;
  color: string | null;
  icon: string | null;
  archived: boolean;
  favorite: boolean;
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
  goalId?: string | null;
  dependsOnId?: string | null;
  startDate?: string | null;
  estimatedDuration?: number | null; // in minutes
  actualDuration?: number | null; // in minutes
  tags?: string[];
  recurring?: "daily" | "weekly" | "monthly" | null;
  comments?: { id: string; author: string; text: string; createdAt: string }[];
  attachments?: { name: string; url: string; size: number }[];
  pinned?: boolean;
  favorite?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completed: boolean;
  category: string | null;
  progress: number; // percentage 0 to 100
  milestones: { id: string; title: string; completed: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly";
  history: Record<string, boolean>; // YYYY-MM-DD -> completed
  streak: number;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  duration: number; // in minutes
  taskTitle?: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: "great" | "good" | "okay" | "bad" | "terrible";
  gratitude: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  type: "event" | "task_deadline" | "schedule";
  reminderAt: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
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
  entityType: "group" | "task" | "subtask" | "template" | "user" | "goal" | "habit" | "note" | "journal" | "event";
  entityName: string;
  detail: string | null;
  createdAt: string;
}

// ================= Enterprise Types =================
export type Role = "owner" | "admin" | "manager" | "member" | "guest" | "viewer";

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  type: "personal" | "shared" | "team" | "organization" | "enterprise";
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMembership {
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
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

export interface CreateGroupRequest {
  name: string;
  description?: string;
  coverImage?: string;
  color?: string;
  icon?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string | null;
  coverImage?: string | null;
  color?: string | null;
  icon?: string | null;
  archived?: boolean;
  favorite?: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  tags?: string[];
  recurring?: "daily" | "weekly" | "monthly" | null;
  pinned?: boolean;
  favorite?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  completed?: boolean;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  tags?: string[];
  recurring?: "daily" | "weekly" | "monthly" | null;
  pinned?: boolean;
  favorite?: boolean;
  comments?: { id: string; author: string; text: string; createdAt: string }[];
  attachments?: { name: string; url: string; size: number }[];
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
