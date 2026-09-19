import { getDb } from "../db.js";

export const AnalyticsService = {
  async getAnalytics(userId: string) {
    const db = getDb();
    return db.getAnalytics(userId);
  }
};
