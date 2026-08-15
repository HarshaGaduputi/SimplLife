import { create } from "zustand";
import type { Group, Subtask, Task } from "../../shared/types";
import { HISTORY_MAX } from "../constants/config";

export type TasksByGroup = Record<string, Task[]>;

interface HistoryEntry {
  type: string;
  payload: unknown;
  prev: TasksByGroup;
  next: TasksByGroup | null;
}

interface TasksState {
  groups: Group[];
  tasksByGroup: TasksByGroup;
  loading: boolean;
  loaded: boolean;
  history: HistoryEntry[];
  historyIndex: number;

  setGroups: (g: Group[]) => void;
  setTasks: (groupId: string, tasks: Task[]) => void;
  setLoaded: (v: boolean) => void;
  setLoading: (v: boolean) => void;

  patchTask: (groupId: string, taskId: string, patch: Partial<Task>) => void;
  addTask: (groupId: string, task: Task) => void;
  removeTask: (groupId: string, taskId: string) => void;

  patchSubtask: (groupId: string, taskId: string, subtaskId: string, patch: Partial<Subtask>) => void;
  addSubtask: (groupId: string, taskId: string, subtask: Subtask) => void;
  removeSubtask: (groupId: string, taskId: string, subtaskId: string) => void;

  pushHistory: (type: string, payload: unknown) => void;
  undo: () => boolean;
  redo: () => boolean;
}

function cloneTasks(t: TasksByGroup): TasksByGroup {
  return Object.fromEntries(
    Object.entries(t).map(([k, v]) => [
      k,
      v.map((x) => ({ ...x, subtasks: x.subtasks ? x.subtasks.map((s) => ({ ...s })) : [] })),
    ]),
  );
}

export const useTasksStore = create<TasksState>((set, get) => ({
  groups: [],
  tasksByGroup: {},
  loading: false,
  loaded: false,
  history: [],
  historyIndex: -1,

  setGroups: (g) => set({ groups: g }),
  setTasks: (groupId, tasks) => set((s) => ({ tasksByGroup: { ...s.tasksByGroup, [groupId]: tasks } })),
  setLoaded: (v) => set({ loaded: v }),
  setLoading: (v) => set({ loading: v }),

  patchTask: (groupId, taskId, patch) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      const next = list.map((t) => (t.id === taskId ? ({ ...t, ...patch } as Task) : t));
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: next } };
    }),

  addTask: (groupId, task) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: [...list, task] } };
    }),

  removeTask: (groupId, taskId) =>
    set((s) => ({
      tasksByGroup: {
        ...s.tasksByGroup,
        [groupId]: (s.tasksByGroup[groupId] ?? []).filter((t) => t.id !== taskId),
      },
    })),

  patchSubtask: (groupId, taskId, subtaskId, patch) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      const next = list.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).map((sub) =>
            sub.id === subtaskId ? ({ ...sub, ...patch } as Subtask) : sub,
          ),
        } as Task;
      });
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: next } };
    }),

  addSubtask: (groupId, taskId, subtask) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      const next = list.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: [...(t.subtasks || []), subtask] } as Task;
      });
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: next } };
    }),

  removeSubtask: (groupId, taskId, subtaskId) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      const next = list.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).filter((sub) => sub.id !== subtaskId),
        } as Task;
      });
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: next } };
    }),

  pushHistory: (type, payload) => {
    const prev = cloneTasks(get().tasksByGroup);
    const entry: HistoryEntry = { type, payload, prev, next: null };
    const list = get().history.slice(0, get().historyIndex + 1);
    list.push(entry);
    const trimmed = list.length > HISTORY_MAX ? list.slice(list.length - HISTORY_MAX) : list;
    set({ history: trimmed, historyIndex: trimmed.length - 1 });
  },

  undo: () => {
    const idx = get().historyIndex;
    if (idx < 0) return false;
    const entry = get().history[idx];
    const curr = cloneTasks(get().tasksByGroup);
    const updatedHistory = get().history.map((h, i) => (i === idx ? { ...h, next: curr } : h));
    set({ tasksByGroup: entry.prev, history: updatedHistory, historyIndex: idx - 1 });
    return true;
  },

  redo: () => {
    const idx = get().historyIndex + 1;
    if (idx >= get().history.length) return false;
    const entry = get().history[idx];
    if (!entry.next) return false;
    set({ tasksByGroup: entry.next, historyIndex: idx });
    return true;
  },
}));
