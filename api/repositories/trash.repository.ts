import { getDb } from "../db.js";
import type { TrashData } from "../../shared/types.js";

export type TrashItemType = "group" | "task" | "subtask";

export const trashRepository = {
  async list(userId: string): Promise<TrashData> {
    const db = getDb();
    return db.listTrash(userId);
  },

  async restore(
    userId: string,
    type: TrashItemType,
    id: string,
  ): Promise<boolean> {
    const db = getDb();
    return db.restoreTrashItem(userId, type, id);
  },

  async empty(userId: string): Promise<number> {
    const db = getDb();
    return db.emptyTrash(userId);
  },

  async deleteItem(
    userId: string,
    type: TrashItemType,
    id: string,
  ): Promise<boolean> {
    const db = getDb();
    return db.deleteTrashItem(userId, type, id);
  },

  async autoEmptyOlderThanDays(days = 30): Promise<number> {
    const db = getDb();
    return db.autoEmptyTrashOlderThanDays(days);
  },
};
