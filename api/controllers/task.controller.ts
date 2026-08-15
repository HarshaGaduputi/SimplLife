import type { Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const taskController = {
  async getUpcoming(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.getUpcoming(req.userId!);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.update(req.userId!, req.params.id, req.body);
      res.status(200).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.complete(req.userId!, req.params.id);
      res.status(200).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  },

  async uncomplete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.uncomplete(req.userId!, req.params.id);
      res.status(200).json({ success: true, task });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TaskService.delete(req.userId!, req.params.id);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async createSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subtask = await TaskService.createSubtask(
        req.userId!,
        req.params.id,
        req.body,
      );
      res.status(201).json({ success: true, subtask });
    } catch (err) {
      next(err);
    }
  },

  async updateSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subtask = await TaskService.updateSubtask(
        req.userId!,
        req.params.id,
        req.body,
      );
      res.status(200).json({ success: true, subtask });
    } catch (err) {
      next(err);
    }
  },

  async deleteSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TaskService.deleteSubtask(req.userId!, req.params.id);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async aiSplit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subtasks = await TaskService.aiSplit(req.userId!, req.params.id);
      res.status(200).json({ success: true, subtasks });
    } catch (err) {
      next(err);
    }
  },
  async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await TaskService.listAll(req.userId!);
      res.status(200).json({ success: true, tasks });
    } catch (err) {
      next(err);
    }
  },
};
