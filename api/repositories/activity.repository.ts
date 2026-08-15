import { getDb } from "../db.js";
import type { ActivityLog } from "../../shared/types.js";

export type ActivityLogParams = {
  userId: string;
  action: string;
  entityType: "group" | "task" | "subtask" | "template" | "user";
  entityName: string;
  detail?: string | null;
};

export const activityRepository = {
  async log(params: ActivityLogParams): Promise<ActivityLog> {
    const db = getDb();
    return db.logActivity(params);
  },

  async list(userId: string, limit = 50, offset = 0): Promise<ActivityLog[]> {
    const db = getDb();
    return db.listActivity(userId, limit, offset);
  },
};
