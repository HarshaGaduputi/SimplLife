import type { Response, NextFunction } from "express";
import { GroupService } from "../services/group.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const groupController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const groups = await GroupService.list(req.userId!);
      res.status(200).json({ success: true, groups });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.create(req.userId!, req.body.name);
      res.status(201).json({ success: true, group });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.update(req.userId!, req.params.id, req.body);
      res.status(200).json({ success: true, group });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await GroupService.delete(req.userId!, req.params.id);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async listTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await GroupService.listTasks(req.userId!, req.params.id);
      res.status(200).json({ success: true, tasks });
    } catch (err) {
      next(err);
    }
  },

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await GroupService.createTask(req.userId!, req.params.id, req.body);
      res.status(201).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  },
};
