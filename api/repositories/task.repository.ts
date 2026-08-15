import { getDb } from "../db.js";
import type { Task, PriorityLevel } from "../../shared/types.js";

export type CreateTaskParams = {
  groupId: string;
  title: string;
  description?: string | null;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
};

export type UpdateTaskParams = {
  title?: string;
  description?: string | null;
  completed?: boolean;
  order?: number;
  templateId?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
};

export const taskRepository = {
  async listByGroup(groupId: string): Promise<Task[]> {
    const db = getDb();
    return db.listTasksByGroup(groupId);
  },

  async listAllForUser(userId: string): Promise<Task[]> {
    const db = getDb();
    return db.listAllTasksForUser(userId);
  },

  async getById(id: string): Promise<Task | null> {
    const db = getDb();
    return db.getTask(id);
  },

  async create(params: CreateTaskParams): Promise<Task> {
    const db = getDb();
    return db.createTask(params);
  },

  async update(id: string, patch: UpdateTaskParams): Promise<Task | null> {
    const db = getDb();
    return db.updateTask(id, patch);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    return db.deleteTask(id);
  },
};
