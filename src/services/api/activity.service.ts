import { request } from "./client.js";
import type { ActivityLog } from "../../../shared/types.js";

export const activityService = {
  list: async (limit = 50, offset = 0): Promise<{ logs: ActivityLog[] }> => {
    return request<{ logs: ActivityLog[] }>(`/activity?limit=${limit}&offset=${offset}`);
  },
};
