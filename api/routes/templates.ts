import { Router, type Response } from "express";
import { z } from "zod";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const ApplyTemplateSchema = z.object({
  templateId: z.string().min(1),
  groupId: z.string().min(1),
  mainTaskName: z.string().min(1, "Main task name is required").max(240),
});

router.get("/", async (_req, res: Response) => {
  const db = getDb();
  const templates = await db.listTemplates();
  res.status(200).json({ success: true, templates });
});

router.post(
  "/apply",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const parsed = ApplyTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input",
        issues: parsed.error.issues.map((i) => i.message),
      });
      return;
    }
    const { templateId, groupId, mainTaskName } = parsed.data;
    const db = getDb();
    const template = await db.getTemplate(templateId);
    if (!template) {
      res.status(404).json({ success: false, error: "Template not found" });
      return;
    }
    const group = await db.getGroup(groupId);
    if (!group || group.userId !== req.userId) {
      res.status(404).json({ success: false, error: "Group not found" });
      return;
    }
    const task = await db.createTask({
      groupId,
      title: mainTaskName,
      templateId,
    });
    const sortedSubs = [...template.subtasks].sort(
      (a, b) => a.order - b.order,
    );
    for (const def of sortedSubs) {
      await db.createSubtask({
        taskId: task.id,
        title: def.title,
        order: def.order,
      });
    }
    const refreshed = await db.getTask(task.id);
    res.status(201).json({ success: true, task: refreshed });
  },
);

export default router;
