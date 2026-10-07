import { request } from "./client.js";

export interface AnalyticsMetrics {
  completedTasks: number;
  completionRate: number;
  totalFocusMinutes: number;
  completedGoals: number;
  totalGoals: number;
  activeHabitsCount: number;
  bestStreak: number;
  completedTasksCountByDate: Record<string, number>;
}

export const analyticsService = {
  get: () => request<AnalyticsMetrics>("/analytics"),
};
