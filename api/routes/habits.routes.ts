import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db.js";
import { validate } from "../middleware/validate.js";
import { CreateHabitSchema } from "../validators/habits.validator.js";

const router = Router();
const db = getDb();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const habits = await db.listHabits(req.userId!);
    res.json({ success: true, habits });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, validate(CreateHabitSchema), async (req: AuthRequest, res, next) => {
  try {
    const { title, frequency } = req.body;
    const habit = await db.createHabit(req.userId!, { title, frequency });
    res.status(201).json({ success: true, habit });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/toggle", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { date } = req.body;
    if (!date || typeof date !== "string") {
      res.status(400).json({ success: false, error: "Date is required (YYYY-MM-DD)" });
      return;
    }
    const habit = await db.toggleHabit(req.userId!, req.params.id, date);
    if (!habit) {
      res.status(404).json({ success: false, error: "Habit not found" });
      return;
    }
    res.json({ success: true, habit });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const deleted = await db.deleteHabit(req.userId!, req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Habit not found" });
      return;
    }
    res.json({ success: true, message: "Habit deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
