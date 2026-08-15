import type { Request, Response, NextFunction } from "express";
import { TemplateService } from "../services/template.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const templateController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await TemplateService.list();
      res.status(200).json({ success: true, templates });
    } catch (err) {
      next(err);
    }
  },

  async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TemplateService.apply({
        userId: req.userId!,
        ...req.body,
      });
      res.status(201).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  },
};
