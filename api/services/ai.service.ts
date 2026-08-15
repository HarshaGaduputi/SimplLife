import { config } from '../config/index.js';
import { z } from 'zod';

export class AIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor() {
    const aiCfg = (config as Record<string, unknown> & { ai?: Record<string, unknown> }).ai;
    this.apiKey = String(aiCfg?.apiKey ?? process.env.AI_API_KEY ?? '');
    this.baseUrl = String(aiCfg?.baseUrl ?? process.env.AI_BASE_URL ?? 'https://api.openai.com/v1');
    this.model = String(aiCfg?.model ?? process.env.AI_MODEL ?? 'gpt-4o-mini');
    this.temperature = Number(aiCfg?.temperature ?? process.env.AI_TEMPERATURE ?? 0.7);
    this.maxTokens = Number(aiCfg?.maxTokens ?? process.env.AI_MAX_TOKENS ?? 1024);

    if (!this.apiKey) {
      console.warn('[AIService] No API key configured – AI features will return mock responses.');
    }
  }

  private buildPayload(systemPrompt: string, userMessage: string, jsonMode = false) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    const payload: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    };
    if (jsonMode) payload.response_format = { type: 'json_object' };
    return payload;
  }

  async callLLM(systemPrompt: string, userMessage: string, jsonMode = false): Promise<string> {
    if (!this.apiKey) return this.mockResponse(userMessage);
    const payload = this.buildPayload(systemPrompt, userMessage, jsonMode);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI provider error: ${response.status} ${err}`);
    }
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? '';
  }

  async streamLLM(
    systemPrompt: string,
    userMessage: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    if (!this.apiKey) {
      const mock = this.mockResponse(userMessage);
      for (const word of mock.split(' ')) {
        onChunk(word + ' ');
        await new Promise((r) => setTimeout(r, 40));
      }
      return;
    }
    const payload = this.buildPayload(systemPrompt, userMessage);
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ ...payload, stream: true }),
    });
    if (!res.body) throw new Error('No response body for streaming');
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      for (const line of text.split('\n').filter((l: string) => l.startsWith('data:'))) {
        const jsonStr = line.replace(/^data: /, '').trim();
        if (jsonStr === '[DONE]') return;
        try {
          const parsed = JSON.parse(jsonStr) as { choices?: { delta?: { content?: string } }[] };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch {
          // malformed SSE chunk – skip
        }
      }
    }
  }

  // ===================== Prompt Methods =====================

  async chat(userMessage: string, context: AIContext): Promise<string> {
    const system = buildSystemPrompt(context);
    return this.callLLM(system, userMessage);
  }

  async chatStream(
    userMessage: string,
    context: AIContext,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const system = buildSystemPrompt(context);
    return this.streamLLM(system, userMessage, onChunk);
  }

  async breakdownTask(taskTitle: string, context: AIContext): Promise<string[]> {
    const system = buildSystemPrompt(context);
    const prompt = `Break down this task into 3-7 actionable subtasks: "${taskTitle}". Return ONLY a JSON array of strings: {"subtasks": ["step1", "step2", ...]}`;
    const raw = await this.callLLM(system, prompt, true);
    try {
      const parsed = JSON.parse(raw);
      return parsed.subtasks ?? [];
    } catch {
      return [];
    }
  }

  async prioritizeTasks(tasks: { id: string; title: string; dueDate?: string | null }[], context: AIContext): Promise<{ id: string; priority: string; reason: string }[]> {
    const system = buildSystemPrompt(context);
    const taskList = tasks.map((t, i) => `${i + 1}. ${t.title}${t.dueDate ? ' (due: ' + t.dueDate + ')' : ''}`).join('\n');
    const prompt = `Prioritize these tasks from most to least urgent. For each, assign "high", "medium", or "low" priority and give a one-sentence reason. Return JSON: {"priorities": [{"id": "...", "priority": "high|medium|low", "reason": "..."}]}\n\nTasks:\n${taskList}`;
    const raw = await this.callLLM(system, prompt, true);
    try {
      const parsed = JSON.parse(raw);
      return parsed.priorities ?? [];
    } catch {
      return [];
    }
  }

  async generateDailyPlan(context: AIContext): Promise<DailyPlan> {
    const system = buildSystemPrompt(context);
    const prompt = `Create an optimized daily schedule for today based on the user's tasks, goals, and habits. Return JSON with this exact shape:
{
  "morning": [{"time": "09:00", "activity": "...", "duration": 60, "type": "focus|break|habit"}],
  "afternoon": [...],
  "evening": [...],
  "priorities": ["top priority 1", "top priority 2", "top priority 3"],
  "tip": "one productivity tip for today"
}`;
    const raw = await this.callLLM(system, prompt, true);
    try {
      return JSON.parse(raw) as DailyPlan;
    } catch {
      return { morning: [], afternoon: [], evening: [], priorities: [], tip: 'Stay focused and take regular breaks.' };
    }
  }

  async generateWeeklyPlan(context: AIContext): Promise<string> {
    const system = buildSystemPrompt(context);
    const prompt = 'Generate a structured weekly plan summary. Include: key priorities, workload balance, goal alignment, and any risks. Format as readable markdown.';
    return this.callLLM(system, prompt);
  }

  async summarizeNote(content: string): Promise<NoteSummary> {
    const system = 'You are a helpful note summarization assistant. Be concise and accurate.';
    const prompt = `Summarize this note, extract key topics, and suggest relevant tags. Return JSON:
{"summary": "...", "topics": ["..."], "tags": ["..."], "questions": ["..."]}

Note content:
${content}`;
    const raw = await this.callLLM(system, prompt, true);
    try {
      return JSON.parse(raw) as NoteSummary;
    } catch {
      return { summary: '', topics: [], tags: [], questions: [] };
    }
  }

  async coachHabits(habits: { title: string; streak: number; history: Record<string, boolean> }[]): Promise<string> {
    const system = 'You are a habit coaching expert. Analyze the user\'s habit data and give personalized, encouraging advice.';
    const summary = habits.map(h => `- ${h.title}: ${h.streak} day streak, ${Object.values(h.history).filter(Boolean).length} completions in last month`).join('\n');
    return this.callLLM(system, `Analyze these habits and give coaching tips:\n${summary}`);
  }

  async coachGoals(goals: { title: string; progress: number; targetDate: string | null; completed: boolean }[]): Promise<string> {
    const system = 'You are a goal achievement coach. Analyze the user\'s goals and give actionable recommendations.';
    const summary = goals.map(g => `- ${g.title}: ${g.progress}% complete${g.targetDate ? ', due ' + g.targetDate : ''}${g.completed ? ' (ACHIEVED)' : ''}`).join('\n');
    return this.callLLM(system, `Analyze these goals and give recommendations:\n${summary}`);
  }

  async semanticSearch(query: string, items: { id: string; title: string; content?: string; type: string }[]): Promise<{ id: string; type: string; score: number }[]> {
    const system = 'You are a semantic search engine. Return the most relevant items for the query.';
    const itemList = items.map((item, i) => `${i}: [${item.type}] ${item.title}${item.content ? ': ' + item.content.slice(0, 100) : ''}`).join('\n');
    const prompt = `Query: "${query}"\n\nItems:\n${itemList}\n\nReturn the top 5 most relevant item indices as JSON: {"results": [{"index": 0, "score": 0.95}, ...]}`;
    const raw = await this.callLLM(system, prompt, true);
    try {
      const parsed = JSON.parse(raw) as { results?: { index: number; score: number }[] };
      return (parsed.results ?? []).map((r) => ({
        id: items[r.index]?.id ?? '',
        type: items[r.index]?.type ?? '',
        score: r.score,
      })).filter((r) => r.id);
    } catch {
      return [];
    }
  }

  async generateEmail(type: 'followup' | 'meeting' | 'status' | 'thankyou', context: string): Promise<string> {
    const system = 'You are a professional email writing assistant. Write clear, concise, professional emails.';
    const typeMap = {
      followup: 'follow-up',
      meeting: 'meeting invitation',
      status: 'status update',
      thankyou: 'thank-you',
    };
    return this.callLLM(system, `Write a professional ${typeMap[type]} email. Context: ${context}`);
  }

  private mockResponse(userMessage: string): string {
    return `I'm SimplLife's AI assistant. You asked: "${userMessage.slice(0, 80)}..."\n\nNo AI API key is configured yet. To enable full AI features, add AI_API_KEY to your .env file. I can help you manage tasks, plan your day, coach habits, and much more once connected.`;
  }
}

// ===================== Context Builder =====================

export interface AIContext {
  tasks?: { title: string; completed: boolean; dueDate?: string | null; priority?: string | null }[];
  goals?: { title: string; progress: number; targetDate?: string | null }[];
  habits?: { title: string; streak: number }[];
  notes?: { title: string; tags: string[] }[];
  recentActivity?: string[];
}

function buildSystemPrompt(context: AIContext): string {
  const parts: string[] = [
    'You are SimplLife AI, a personal productivity assistant that helps users manage tasks, plan their day, track habits, and achieve goals.',
    'Always be concise, helpful, and actionable. Never delete data or make irreversible changes without explicit user confirmation.',
  ];

  if (context.tasks && context.tasks.length > 0) {
    const activeTasks = context.tasks.filter(t => !t.completed);
    parts.push(`\nCurrent active tasks (${activeTasks.length}): ${activeTasks.slice(0, 10).map(t => `"${t.title}"${t.dueDate ? ' (due: ' + t.dueDate + ')' : ''}${t.priority ? ' [' + t.priority + ']' : ''}`).join(', ')}`);
  }
  if (context.goals && context.goals.length > 0) {
    parts.push(`\nActive goals: ${context.goals.slice(0, 5).map(g => `"${g.title}" (${g.progress}%)`).join(', ')}`);
  }
  if (context.habits && context.habits.length > 0) {
    parts.push(`\nHabits: ${context.habits.slice(0, 5).map(h => `"${h.title}" (${h.streak} day streak)`).join(', ')}`);
  }

  return parts.join('\n');
}

// ===================== Types =====================

export interface DailyPlan {
  morning: PlanBlock[];
  afternoon: PlanBlock[];
  evening: PlanBlock[];
  priorities: string[];
  tip: string;
}

export interface PlanBlock {
  time: string;
  activity: string;
  duration: number;
  type: 'focus' | 'break' | 'habit' | 'meeting';
}

export interface NoteSummary {
  summary: string;
  topics: string[];
  tags: string[];
  questions: string[];
}

export function validateResponse<T>(jsonStr: string, schema: z.ZodSchema<T>): T {
  const parsed = JSON.parse(jsonStr);
  return schema.parse(parsed);
}

export const aiService = new AIService();
