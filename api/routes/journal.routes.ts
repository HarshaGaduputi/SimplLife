import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { getDb } from "../db.js";
import { validate } from "../middleware/validate.js";
import { SaveJournalSchema } from "../validators/journal.validator.js";

const router = Router();
const db = getDb();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const journalEntries = await db.listJournal(req.userId!);
    res.json({ success: true, journalEntries });
  } catch (e) {
    next(e);
  }
});

router.get("/:date", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const entry = await db.getJournal(req.userId!, req.params.date);
    res.json({ success: true, entry });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, validate(SaveJournalSchema), async (req: AuthRequest, res, next) => {
  try {
    const { date, mood, gratitude, reflection } = req.body;
    const entry = await db.saveJournal(req.userId!, date, {
      mood,
      gratitude: gratitude ?? "",
      reflection: reflection ?? "",
    });
    res.status(201).json({ success: true, entry });
  } catch (e) {
    next(e);
  }
});

export default router;
