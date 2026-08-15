import { getDb } from "../db.js";
import type { Subtask } from "../../shared/types.js";

export type CreateSubtaskParams = {
  taskId: string;
  title: string;
  order?: number;
};

export type UpdateSubtaskParams = {
  title?: string;
  completed?: boolean;
  order?: number;
};

export const subtaskRepository = {
  async create(params: CreateSubtaskParams): Promise<Subtask> {
    const db = getDb();
    return db.createSubtask(params);
  },

  async getById(id: string): Promise<Subtask | null> {
    const db = getDb();
    return db.getSubtask(id);
  },

  async update(id: string, patch: UpdateSubtaskParams): Promise<Subtask | null> {
    const db = getDb();
    return db.updateSubtask(id, patch);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    return db.deleteSubtask(id);
  },
};
