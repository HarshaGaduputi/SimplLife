import { Router, type Response } from "express";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/trash
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const trash = await db.listTrash(req.userId!);
  res.status(200).json({ success: true, ...trash });
});

// POST /api/trash/restore/:type/:id
router.post(
  "/restore/:type/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const { type, id } = req.params;
    if (type !== "group" && type !== "task" && type !== "subtask") {
      res.status(400).json({ success: false, error: "Invalid entity type" });
      return;
    }
    const db = getDb();
    const ok = await db.restoreTrashItem(req.userId!, type, id);
    if (!ok) {
      res.status(404).json({ success: false, error: "Item not found in trash" });
      return;
    }
    res.status(200).json({ success: true, message: "Item restored successfully" });
  },
);

// DELETE /api/trash/empty
router.delete("/empty", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const count = await db.emptyTrash(req.userId!);
  res.status(200).json({
    success: true,
    message: `Trash emptied. ${count} items permanently deleted.`,
    count,
  });
});

// DELETE /api/trash/item/:type/:id
router.delete(
  "/item/:type/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const { type, id } = req.params;
    if (type !== "group" && type !== "task" && type !== "subtask") {
      res.status(400).json({ success: false, error: "Invalid entity type" });
      return;
    }
    const db = getDb();
    const ok = await db.deleteTrashItem(req.userId!, type, id);
    if (!ok) {
      res.status(404).json({ success: false, error: "Item not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Permanently deleted item" });
  },
);

export default router;
