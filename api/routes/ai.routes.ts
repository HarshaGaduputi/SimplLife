import { Router, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { aiSafety } from '../middleware/aiSafety.js';
import { aiService } from '../services/ai.service.js';
import { getDb } from '../db.js';
import { validate } from '../middleware/validate.js';
import { config } from '../config/index.js';
import { AiChatSchema, AiBreakdownSchema, AiPrioritizeSchema, AiSummarizeNoteSchema, AiSearchSchema, AiEmailSchema } from '../validators/ai.validator.js';

const router = Router();

// Build workspace context from DB
async function buildContext(userId: string) {
  const db = getDb();
  const [allTasksRes, goalsRes, habitsRes, notesRes] = await Promise.allSettled([
    db.listAllTasksForUser(userId),
    db.listGoals(userId),
    db.listHabits(userId),
    db.listNotes(userId),
  ]);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: allTasksRes.status === 'fulfilled' ? (allTasksRes.value || []).map((t: any) => ({
      title: t.title,
      completed: t.completed,
      dueDate: t.dueDate,
      priority: t.priority,
    })) : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goals: goalsRes.status === 'fulfilled' ? goalsRes.value.map((g: any) => ({
      title: g.title,
      progress: g.progress,
      targetDate: g.targetDate,
    })) : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    habits: habitsRes.status === 'fulfilled' ? habitsRes.value.map((h: any) => ({
      title: h.title,
      streak: h.streak,
    })) : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notes: notesRes.status === 'fulfilled' ? notesRes.value.map((n: any) => ({
      title: n.title,
      tags: n.tags,
    })) : [],
  };
}

// ── GET /api/ai/status ───────────────────────────────────────────────────────
router.get('/status', (req, res) => {
  res.json({ success: true, configured: !!config.ai.apiKey });
});

// ── POST /api/ai/chat ────────────────────────────────────────────────────────
// Regular chat (non-streaming)
router.post('/chat', requireAuth, validate(AiChatSchema), aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const { message } = req.body as { message: string; history?: { role: string; content: string }[] };
    const context = await buildContext(req.userId!);
    const reply = await aiService.chat(message, context);
    res.json({ success: true, reply });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/ai/stream ──────────────────────────────────────────────────────
// Streaming chat via SSE
router.post('/stream', requireAuth, validate(AiChatSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { message } = req.body as { message: string };
    const context = await buildContext(req.userId!);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    await aiService.chatStream(message, context, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    next(e);
  }
});

// ── POST /api/ai/breakdown ───────────────────────────────────────────────────
router.post('/breakdown', requireAuth, validate(AiBreakdownSchema), aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskTitle } = req.body as { taskTitle: string };
    const context = await buildContext(req.userId!);
    const subtasks = await aiService.breakdownTask(taskTitle, context);
    res.json({ success: true, subtasks });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/ai/prioritize ──────────────────────────────────────────────────
router.post('/prioritize', requireAuth, validate(AiPrioritizeSchema), aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const { tasks } = req.body as { tasks: { id: string; title: string; dueDate?: string | null }[] };
    const context = await buildContext(req.userId!);
    const priorities = await aiService.prioritizeTasks(tasks, context);
    res.json({ success: true, priorities });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/ai/plan/daily ───────────────────────────────────────────────────
router.get('/plan/daily', requireAuth, aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const context = await buildContext(req.userId!);
    const plan = await aiService.generateDailyPlan(context);
    res.json({ success: true, plan });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/ai/plan/weekly ──────────────────────────────────────────────────
router.get('/plan/weekly', requireAuth, aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const context = await buildContext(req.userId!);
    const plan = await aiService.generateWeeklyPlan(context);
    res.json({ success: true, plan });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/ai/summarize/note ──────────────────────────────────────────────
router.post('/summarize/note', requireAuth, validate(AiSummarizeNoteSchema), aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const { content } = req.body as { content: string };
    const summary = await aiService.summarizeNote(content);
    res.json({ success: true, ...summary });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/ai/coach/habits ─────────────────────────────────────────────────
router.get('/coach/habits', requireAuth, aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const db = getDb();
    const habits = await db.listHabits(req.userId!);
    const advice = await aiService.coachHabits(habits);
    res.json({ success: true, advice });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/ai/coach/goals ──────────────────────────────────────────────────
router.get('/coach/goals', requireAuth, aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const db = getDb();
    const goals = await db.listGoals(req.userId!);
    const advice = await aiService.coachGoals(goals);
    res.json({ success: true, advice });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/ai/search ──────────────────────────────────────────────────────
router.post('/search', requireAuth, validate(AiSearchSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { query } = req.body as { query: string };
    const context = await buildContext(req.userId!);
    const items = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(context.tasks || []).map((t: any, i: number) => ({ id: `task-${i}`, title: t.title, type: 'task' })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(context.goals || []).map((g: any, i: number) => ({ id: `goal-${i}`, title: g.title, type: 'goal' })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(context.notes || []).map((n: any, i: number) => ({ id: `note-${i}`, title: n.title, type: 'note' })),
    ];
    const results = await aiService.semanticSearch(query, items);
    res.json({ success: true, results });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/ai/email ───────────────────────────────────────────────────────
router.post('/email', requireAuth, validate(AiEmailSchema), aiSafety, async (req: AuthRequest, res: Response, next) => {
  try {
    const { type, context: ctx } = req.body as { type: 'followup' | 'meeting' | 'status' | 'thankyou'; context: string };
    const email = await aiService.generateEmail(type, ctx);
    res.json({ success: true, email });
  } catch (e) {
    next(e);
  }
});

export default router;
