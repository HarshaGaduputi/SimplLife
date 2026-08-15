import type { Response, NextFunction } from "express";
import { ActivityService } from "../services/activity.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const activityController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await ActivityService.list(
        req.userId!,
        req.query.limit as string | undefined,
        req.query.offset as string | undefined,
      );
      res.status(200).json({ success: true, logs });
    } catch (err) {
      next(err);
    }
  },
};
