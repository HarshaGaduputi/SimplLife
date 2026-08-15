import type { Response, NextFunction } from "express";
import { ExportImportService } from "../services/exportImport.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const exportImportController = {
  async exportData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { data, filename } = await ExportImportService.export(req.userId!);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(JSON.stringify(data, null, 2));
    } catch (err) {
      next(err);
    }
  },

  async importData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await ExportImportService.import(req.userId!, req.body);
      res.status(200).json({
        success: true,
        imported: true,
        summary: {
          groups: summary.groupsCount,
          tasks: summary.tasksCount,
          subtasks: summary.subtasksCount,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
