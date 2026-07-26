import { Router, type Response } from "express";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import type { ExportData } from "../../shared/types.js";

const router = Router();

// PATCH /api/state/sync
router.patch("/sync", requireAuth, async (req: AuthRequest, res: Response) => {
  const { groups } = req.body;
  if (!Array.isArray(groups)) {
    res.status(400).json({ success: false, error: "Invalid state snapshot payload" });
    return;
  }

  const db = getDb();
  // Build export-shaped snapshot for import sync
  const snapshot: ExportData = {
    exported_at: new Date().toISOString(),
    user: { name: "", email: "" },
    groups: groups.map((g: any) => ({
      name: g.name,
      position: g.order ?? 0,
      tasks: (g.tasks || []).map((t: any) => ({
        name: t.title || t.name,
        description: t.description || null,
        priority: t.priority || "none",
        due_date: t.dueDate || t.due_date || null,
        is_completed: !!t.completed,
        position: t.order ?? 0,
        subtasks: (t.subtasks || []).map((s: any) => ({
          name: s.title || s.name,
          is_completed: !!s.completed,
          position: s.order ?? 0,
        })),
      })),
    })),
  };

  const summary = await db.importData(req.userId!, snapshot);
  res.status(200).json({ success: true, synced: true, summary });
});

export default router;
