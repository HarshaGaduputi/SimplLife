import { Router, type Response } from "express";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import type { ExportData } from "../../shared/types.js";

const router = Router();

// GET /api/export
router.get("/export", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const data = await db.exportData(req.userId!);
  if (!data) {
    res.status(404).json({ success: false, error: "User data not found" });
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const filename = `tasknest-export-${todayStr}.json`;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(JSON.stringify(data, null, 2));
});

// POST /api/import
router.post("/import", requireAuth, async (req: AuthRequest, res: Response) => {
  let bodyData: ExportData | null = null;

  if (typeof req.body === "object" && req.body !== null) {
    if (req.body.groups) {
      bodyData = req.body as ExportData;
    } else if (typeof req.body.file === "string") {
      try {
        bodyData = JSON.parse(req.body.file);
      } catch {
        /* invalid JSON string */
      }
    }
  }

  if (!bodyData || !Array.isArray(bodyData.groups)) {
    res.status(400).json({
      success: false,
      error: "Invalid file format. Must contain a 'groups' array.",
    });
    return;
  }

  // Validate group and task structures
  for (const g of bodyData.groups) {
    if (typeof g.name !== "string" || !g.name.trim()) {
      res.status(400).json({
        success: false,
        error: "Invalid file format: Each group must have a valid name string.",
      });
      return;
    }
    if (Array.isArray(g.tasks)) {
      for (const t of g.tasks) {
        if (typeof t.name !== "string" || !t.name.trim()) {
          res.status(400).json({
            success: false,
            error: "Invalid file format: Each task must have a valid name string.",
          });
          return;
        }
      }
    }
  }

  const db = getDb();
  const summary = await db.importData(req.userId!, bodyData);

  res.status(200).json({
    success: true,
    imported: true,
    summary: {
      groups: summary.groupsCount,
      tasks: summary.tasksCount,
      subtasks: summary.subtasksCount,
    },
  });
});

export default router;
