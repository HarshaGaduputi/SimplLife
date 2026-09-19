import type { Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const analyticsController = {
  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getAnalytics(req.userId!);
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  },
};
