import { activityRepository } from "../repositories/activity.repository.js";
import type { ActivityLog } from "../../shared/types.js";

export class ActivityService {
  static async list(
    userId: string,
    limitParam: string | undefined,
    offsetParam: string | undefined,
  ): Promise<ActivityLog[]> {
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitParam || "50", 10) || 50),
    );
    const offset = Math.max(0, parseInt(offsetParam || "0", 10) || 0);
    return activityRepository.list(userId, limit, offset);
  }
}
