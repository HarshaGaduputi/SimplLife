import { Router, type Response } from "express";
import { z } from "zod";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const CreateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
});

const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(60).optional(),
});

router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const groups = await db.listGroups(req.userId!);
  res.status(200).json({ success: true, groups });
});

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = CreateGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const db = getDb();
  const group = await db.createGroup(req.userId!, parsed.data.name);
  res.status(201).json({ success: true, group });
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = UpdateGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const db = getDb();
  const group = await db.getGroup(req.params.id);
  if (!group || group.userId !== req.userId) {
    res.status(404).json({ success: false, error: "Not found" });
    return;
  }
  const updated = await db.updateGroup(req.params.id, parsed.data);
  res.status(200).json({ success: true, group: updated });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const group = await db.getGroup(req.params.id);
  if (!group || group.userId !== req.userId) {
    res.status(404).json({ success: false, error: "Not found" });
    return;
  }
  await db.deleteGroup(req.params.id);
  res.status(200).json({ success: true });
});

// Tasks by group
const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(240),
  description: z.string().max(2000).nullish(),
  order: z.number().int().optional(),
  templateId: z.string().nullable().optional(),
  priority: z.enum(["high", "medium", "low", "none"]).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

router.get(
  "/:id/tasks",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const group = await db.getGroup(req.params.id);
    if (!group || group.userId !== req.userId) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const tasks = await db.listTasksByGroup(req.params.id);
    res.status(200).json({ success: true, tasks });
  },
);

router.post(
  "/:id/tasks",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const parsed = CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input",
        issues: parsed.error.issues.map((i) => i.message),
      });
      return;
    }
    const db = getDb();
    const group = await db.getGroup(req.params.id);
    if (!group || group.userId !== req.userId) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const { title, description, order, templateId, priority, dueDate } = parsed.data;
    const task = await db.createTask({
      groupId: req.params.id,
      title,
      description,
      order,
      templateId,
      priority,
      dueDate,
    });
    res.status(201).json({ success: true, task });
  },
);


export default router;
