import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db.js";
import { validate } from "../middleware/validate.js";
import { CreateGoalSchema, UpdateGoalSchema } from "../validators/goals.validator.js";

const router = Router();
const db = getDb();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const goals = await db.listGoals(req.userId!);
    res.json({ success: true, goals });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, validate(CreateGoalSchema), async (req: AuthRequest, res, next) => {
  try {
    const { title, description, targetDate, category, milestones } = req.body;
    const goal = await db.createGoal(req.userId!, {
      title,
      description,
      targetDate,
      category,
      milestones,
    });
    res.status(201).json({ success: true, goal });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAuth, validate(UpdateGoalSchema), async (req: AuthRequest, res, next) => {
  try {
    const { title, description, targetDate, completed, category, progress, milestones } = req.body;
    const goal = await db.updateGoal(req.userId!, req.params.id, {
      title,
      description,
      targetDate,
      completed,
      category,
      progress,
      milestones,
    });
    if (!goal) {
      res.status(404).json({ success: false, error: "Goal not found" });
      return;
    }
    res.json({ success: true, goal });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const deleted = await db.deleteGoal(req.userId!, req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Goal not found" });
      return;
    }
    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
