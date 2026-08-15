import { getDb } from "../db.js";
import type { Group } from "../../shared/types.js";

export const groupRepository = {
  async list(userId: string): Promise<Group[]> {
    const db = getDb();
    return db.listGroups(userId);
  },

  async getById(id: string): Promise<Group | null> {
    const db = getDb();
    return db.getGroup(id);
  },

  async create(userId: string, name: string): Promise<Group> {
    const db = getDb();
    return db.createGroup(userId, name);
  },

  async update(
    id: string,
    patch: { name?: string; order?: number },
  ): Promise<Group | null> {
    const db = getDb();
    return db.updateGroup(id, patch);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    return db.deleteGroup(id);
  },
};
