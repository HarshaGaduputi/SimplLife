import type { Response, NextFunction } from "express";
import { TrashService } from "../services/trash.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const trashController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trash = await TrashService.list(req.userId!);
      res.status(200).json({ success: true, ...trash });
    } catch (err) {
      next(err);
    }
  },

  async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TrashService.restore(req.userId!, req.params.type, req.params.id);
      res.status(200).json({ success: true, message: "Item restored successfully" });
    } catch (err) {
      next(err);
    }
  },

  async empty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await TrashService.empty(req.userId!);
      res.status(200).json({
        success: true,
        message: `Trash emptied. ${count} items permanently deleted.`,
        count,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TrashService.deleteItem(req.userId!, req.params.type, req.params.id);
      res.status(200).json({ success: true, message: "Permanently deleted item" });
    } catch (err) {
      next(err);
    }
  },
};
