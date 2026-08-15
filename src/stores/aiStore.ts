import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  streaming?: boolean;
  error?: boolean;
}

interface AIState {
  // Chat
  messages: ChatMessage[];
  isStreaming: boolean;
  chatOpen: boolean;

  // Planner
  dailyPlan: DailyPlanState | null;
  weeklyPlan: string | null;
  planLoading: boolean;

  // Coaching
  habitAdvice: string | null;
  goalAdvice: string | null;
  coachLoading: boolean;

  // Note summary
  noteSummary: NoteSummaryState | null;
  summaryLoading: boolean;

  // Actions
  setChatOpen: (open: boolean) => void;
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string, streaming?: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  clearChat: () => void;
  setDailyPlan: (plan: DailyPlanState | null) => void;
  setWeeklyPlan: (plan: string | null) => void;
  setPlanLoading: (loading: boolean) => void;
  setHabitAdvice: (advice: string | null) => void;
  setGoalAdvice: (advice: string | null) => void;
  setCoachLoading: (loading: boolean) => void;
  setNoteSummary: (summary: NoteSummaryState | null) => void;
  setSummaryLoading: (loading: boolean) => void;
}

export interface DailyPlanState {
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

export interface NoteSummaryState {
  summary: string;
  topics: string[];
  tags: string[];
  questions: string[];
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  isStreaming: false,
  chatOpen: false,
  dailyPlan: null,
  weeklyPlan: null,
  planLoading: false,
  habitAdvice: null,
  goalAdvice: null,
  coachLoading: false,
  noteSummary: null,
  summaryLoading: false,

  setChatOpen: (open) => set({ chatOpen: open }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistantMessage: (content, streaming = false) =>
    set((s) => {
      const msgs = [...s.messages];
      let lastIdx = -1;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          lastIdx = i;
          break;
        }
      }
      if (lastIdx === -1) return s;
      msgs[lastIdx] = { ...msgs[lastIdx], content, streaming };
      return { messages: msgs };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  clearChat: () => set({ messages: [] }),

  setDailyPlan: (dailyPlan) => set({ dailyPlan }),
  setWeeklyPlan: (weeklyPlan) => set({ weeklyPlan }),
  setPlanLoading: (planLoading) => set({ planLoading }),
  setHabitAdvice: (habitAdvice) => set({ habitAdvice }),
  setGoalAdvice: (goalAdvice) => set({ goalAdvice }),
  setCoachLoading: (coachLoading) => set({ coachLoading }),
  setNoteSummary: (noteSummary) => set({ noteSummary }),
  setSummaryLoading: (summaryLoading) => set({ summaryLoading }),
}));
