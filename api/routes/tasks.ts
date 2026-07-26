import { Router, type Response } from "express";
import { z } from "zod";
import { getDb } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(240).optional(),
  description: z.string().max(2000).nullable().optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
  templateId: z.string().nullable().optional(),
  priority: z.enum(["high", "medium", "low", "none"]).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

const CreateSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().optional(),
});

const UpdateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function userOwnsTask(
  userId: string,
  taskId: string,
): Promise<"ok" | "not_found"> {
  const db = getDb();
  const task = await db.getTask(taskId);
  if (!task || task.deletedAt) return "not_found";
  const group = await db.getGroup(task.groupId);
  if (!group || group.userId !== userId || group.deletedAt) return "not_found";
  return "ok";
}

// GET /api/tasks/upcoming — returns upcoming/due today tasks
router.get("/upcoming", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const allTasks = await db.listAllTasksForUser(req.userId!);
  const todayStr = new Date().toISOString().split("T")[0];

  const upcoming = allTasks
    .filter((t) => !t.completed && t.dueDate)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));

  res.status(200).json({
    success: true,
    today: todayStr,
    tasks: upcoming,
  });
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = UpdateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid input",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }
  const ok = await userOwnsTask(req.userId!, req.params.id);
  if (ok === "not_found") {
    res.status(404).json({ success: false, error: "Not found" });
    return;
  }
  const db = getDb();
  const updated = await db.updateTask(req.params.id, parsed.data);
  res.status(200).json({ success: true, task: updated });
});

router.patch(
  "/:id/complete",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const ok = await userOwnsTask(req.userId!, req.params.id);
    if (ok === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const db = getDb();
    const updated = await db.updateTask(req.params.id, { completed: true });
    res.status(200).json({ success: true, task: updated });
  },
);

router.patch(
  "/:id/uncomplete",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const ok = await userOwnsTask(req.userId!, req.params.id);
    if (ok === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const db = getDb();
    const updated = await db.updateTask(req.params.id, { completed: false });
    res.status(200).json({ success: true, task: updated });
  },
);

router.delete(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const ok = await userOwnsTask(req.userId!, req.params.id);
    if (ok === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const db = getDb();
    await db.deleteTask(req.params.id);
    res.status(200).json({ success: true });
  },
);

router.post(
  "/:id/subtasks",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const parsed = CreateSubtaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input",
        issues: parsed.error.issues.map((i) => i.message),
      });
      return;
    }
    const ok = await userOwnsTask(req.userId!, req.params.id);
    if (ok === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const db = getDb();
    const subtask = await db.createSubtask({
      taskId: req.params.id,
      title: parsed.data.title,
      order: parsed.data.order,
    });
    res.status(201).json({ success: true, subtask });
  },
);

router.patch(
  "/subtasks/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const parsed = UpdateSubtaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input",
        issues: parsed.error.issues.map((i) => i.message),
      });
      return;
    }
    const db = getDb();
    const sub = await db.getSubtask(req.params.id);
    if (!sub || sub.deletedAt) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const ownOk = await userOwnsTask(req.userId!, sub.taskId);
    if (ownOk === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const updated = await db.updateSubtask(req.params.id, parsed.data);
    res.status(200).json({ success: true, subtask: updated });
  },
);

router.delete(
  "/subtasks/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const db = getDb();
    const sub = await db.getSubtask(req.params.id);
    if (!sub || sub.deletedAt) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const ownOk = await userOwnsTask(req.userId!, sub.taskId);
    if (ownOk === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    await db.deleteSubtask(req.params.id);
    res.status(200).json({ success: true });
  },
);

// POST /api/tasks/:id/ai-split
router.post(
  "/:id/ai-split",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const ok = await userOwnsTask(req.userId!, req.params.id);
    if (ok === "not_found") {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const db = getDb();
    const task = await db.getTask(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, error: "Task not found" });
      return;
    }

    if ((task.subtasks || []).length >= 5) {
      res.status(400).json({
        success: false,
        error: "Task already has 5 or more subtasks. Remove some before generating more.",
      });
      return;
    }

    let subtaskNames: string[] = [];
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  'You are a task planning assistant. Given a task name and optional description, generate between 3 and 5 specific, actionable subtasks that logically break down the main task. Return ONLY a JSON array of strings, no explanation, no markdown, no numbering. Example output: ["Book the venue","Send invitations","Order catering"]',
              },
              {
                role: "user",
                content: `Task: ${task.title}. Description: ${task.description || "None"}.`,
              },
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const rawText = json.choices?.[0]?.message?.content || "";
          const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          subtaskNames = JSON.parse(cleaned);
        }
      } catch (err) {
        console.warn("[AI Split] OpenAI request error, using smart fallback:", err);
      }
    }

    // Fallback if no OpenAI key or request failed
    if (!Array.isArray(subtaskNames) || subtaskNames.length === 0) {
      const lower = task.title.toLowerCase();
      if (lower.includes("blog") || lower.includes("write") || lower.includes("article")) {
        subtaskNames = [
          "Outline key points & research topic",
          "Draft initial content paragraphs",
          "Proofread and publish article",
        ];
      } else if (lower.includes("event") || lower.includes("party") || lower.includes("plan")) {
        subtaskNames = [
          "Confirm guest list & date",
          "Book venue or arrange space",
          "Prepare agenda & food/beverages",
        ];
      } else if (lower.includes("study") || lower.includes("exam") || lower.includes("test")) {
        subtaskNames = [
          "Review chapter summary notes",
          "Complete practice problems",
          "Self-test on flashcards",
        ];
      } else if (lower.includes("bug") || lower.includes("fix") || lower.includes("issue")) {
        subtaskNames = [
          "Reproduce bug and inspect logs",
          "Implement fix & write regression test",
          "Verify build and merge PR",
        ];
      } else if (lower.includes("shop") || lower.includes("buy") || lower.includes("grocery")) {
        subtaskNames = [
          "List items needed",
          "Compare prices or check store availability",
          "Pick up items and save receipt",
        ];
      } else {
        subtaskNames = [
          `Gather initial requirements for ${task.title}`,
          `Execute main steps for ${task.title}`,
          `Review & double-check final result`,
        ];
      }
    }

    const createdSubtasks = [];
    let startPos = (task.subtasks || []).length;

    for (const name of subtaskNames) {
      const created = await db.createSubtask({
        taskId: task.id,
        title: name,
        order: startPos++,
      });
      createdSubtasks.push(created);
    }

    await db.logActivity({
      userId: req.userId!,
      action: "ai_split",
      entityType: "task",
      entityName: task.title,
      detail: `AI generated ${createdSubtasks.length} subtasks.`,
    });

    res.status(200).json({ success: true, subtasks: createdSubtasks });
  },
);

export default router;
