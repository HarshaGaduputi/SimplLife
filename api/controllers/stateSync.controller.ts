import type { Response, NextFunction } from "express";
import { StateSyncService } from "../services/stateSync.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const stateSyncController = {
  async sync(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await StateSyncService.sync(req.userId!, req.body);
      res.status(200).json({ success: true, synced: true, summary });
    } catch (err) {
      next(err);
    }
  },
};
