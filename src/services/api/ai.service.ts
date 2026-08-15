import { request } from './client';
import { BASE_URL } from '@/constants/config';

export const aiApiService = {
  checkStatus: () => request<{ success: boolean; configured: boolean }>('/ai/status'),

  // Chat (non-streaming)
  chat: (message: string) =>
    request<{ success: boolean; reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Streaming chat via SSE – returns an AbortController
  streamChat: (
    message: string,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
  ): AbortController => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/ai/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
          signal: controller.signal,
          credentials: 'include',
        });
        if (!res.ok || !res.body) { onError('AI request failed'); return; }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split('\n').filter(l => l.startsWith('data:'))) {
            const data = line.replace(/^data: /, '').trim();
            if (data === '[DONE]') { onDone(); return; }
            try {
              const parsed = JSON.parse(data) as { chunk?: string };
              if (parsed.chunk) onChunk(parsed.chunk);
            } catch {
              // malformed SSE chunk — skip
            }
          }
        }
        onDone();
      } catch (e: unknown) {
        if ((e as { name?: string })?.name !== 'AbortError') onError((e as Error)?.message || 'Streaming error');
      }
    })();
    return controller;
  },

  breakdownTask: (taskTitle: string) =>
    request<{ success: boolean; subtasks: string[] }>('/ai/breakdown', {
      method: 'POST',
      body: JSON.stringify({ taskTitle }),
    }),

  prioritizeTasks: (tasks: { id: string; title: string; dueDate?: string | null }[]) =>
    request<{ success: boolean; priorities: { id: string; priority: string; reason: string }[] }>(
      '/ai/prioritize',
      { method: 'POST', body: JSON.stringify({ tasks }) },
    ),

  getDailyPlan: () =>
    request<{
      success: boolean;
      plan: {
        morning: { time: string; activity: string; duration: number; type: string }[];
        afternoon: { time: string; activity: string; duration: number; type: string }[];
        evening: { time: string; activity: string; duration: number; type: string }[];
        priorities: string[];
        tip: string;
      };
    }>('/ai/plan/daily'),

  getWeeklyPlan: () => request<{ success: boolean; plan: string }>('/ai/plan/weekly'),

  summarizeNote: (content: string) =>
    request<{ success: boolean; summary: string; topics: string[]; tags: string[]; questions: string[] }>(
      '/ai/summarize/note',
      { method: 'POST', body: JSON.stringify({ content }) },
    ),

  getHabitCoaching: () => request<{ success: boolean; advice: string }>('/ai/coach/habits'),

  getGoalCoaching: () => request<{ success: boolean; advice: string }>('/ai/coach/goals'),

  semanticSearch: (query: string) =>
    request<{ success: boolean; results: { id: string; type: string; score: number }[] }>(
      '/ai/search',
      { method: 'POST', body: JSON.stringify({ query }) },
    ),

  generateEmail: (type: 'followup' | 'meeting' | 'status' | 'thankyou', context: string) =>
    request<{ success: boolean; email: string }>('/ai/email', {
      method: 'POST',
      body: JSON.stringify({ type, context }),
    }),
};
