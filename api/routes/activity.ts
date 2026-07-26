import { Router, type Response } from "express";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/activity?limit=50&offset=0
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) || "50", 10)),
  );
  const offset = Math.max(0, parseInt((req.query.offset as string) || "0", 10));

  const db = getDb();
  const logs = await db.listActivity(req.userId!, limit, offset);
  res.status(200).json({ success: true, logs });
});

export default router;
