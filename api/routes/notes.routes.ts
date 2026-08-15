import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDb } from "../db.js";
import type { AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { CreateNoteSchema, UpdateNoteSchema } from "../validators/notes.validator.js";
const router = Router();
const db = getDb();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notes = await db.listNotes(req.userId!);
    res.json({ success: true, notes });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const note = await db.getNote(req.params.id);
    if (!note || note.userId !== req.userId) {
      res.status(404).json({ success: false, error: "Note not found" });
      return;
    }
    res.json({ success: true, note });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, validate(CreateNoteSchema), async (req: AuthRequest, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const note = await db.createNote(req.userId!, { title, content: content ?? "", tags });
    res.status(201).json({ success: true, note });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAuth, validate(UpdateNoteSchema), async (req: AuthRequest, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const note = await db.updateNote(req.userId!, req.params.id, { title, content, tags });
    if (!note) {
      res.status(404).json({ success: false, error: "Note not found" });
      return;
    }
    res.json({ success: true, note });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const deleted = await db.deleteNote(req.userId!, req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Note not found" });
      return;
    }
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
