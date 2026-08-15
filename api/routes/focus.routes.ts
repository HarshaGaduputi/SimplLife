import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db.js";
import { validate } from "../middleware/validate.js";
import { CreateFocusSessionSchema } from "../validators/focus.validator.js";

const router = Router();
const db = getDb();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const sessions = await db.listFocusSessions(req.userId!);
    res.json({ success: true, sessions });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, validate(CreateFocusSessionSchema), async (req: AuthRequest, res, next) => {
  try {
    const { duration, taskTitle } = req.body;
    const session = await db.createFocusSession(req.userId!, duration, taskTitle);
    res.status(201).json({ success: true, session });
  } catch (e) {
    next(e);
  }
});

export default router;
