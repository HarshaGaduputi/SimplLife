import { create } from "zustand";
import type { Group, PriorityLevel, Subtask, Task } from "../../shared/types";

type ThemeMode = "light" | "dark";

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export type PriorityFilter = "all" | PriorityLevel;
export type DueDateFilter = "all" | "overdue" | "today" | "upcoming";
export type StatusFilter = "all" | "active" | "completed";

interface UIState {
  theme: ThemeMode;
  sidebarOpenMobile: boolean;
  toasts: Toast[];
  shortcutsModalOpen: boolean;
  trashBadgeCount: number;

  // Search & Filter state
  searchQuery: string;
  filterPriority: PriorityFilter;
  filterDueDate: DueDateFilter;
  filterGroup: string; // 'all' or groupId
  filterStatus: StatusFilter;

  // Actions
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebarMobile: () => void;
  setSidebarMobile: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setTrashBadgeCount: (count: number) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  setSearchQuery: (query: string) => void;
  setFilterPriority: (p: PriorityFilter) => void;
  setFilterDueDate: (d: DueDateFilter) => void;
  setFilterGroup: (g: string) => void;
  setFilterStatus: (s: StatusFilter) => void;
  resetFilters: () => void;
}

function readTheme(): ThemeMode {
  try {
    const root = document.documentElement;
    if (root.classList.contains("theme-dark")) return "dark";
    if (root.classList.contains("theme-light")) return "light";
    const stored = localStorage.getItem("tasknest-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyTheme(theme: ThemeMode): void {
  try {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem("tasknest-theme", theme);
  } catch {
    /* ignore */
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: typeof document !== "undefined" ? readTheme() : "light",
  sidebarOpenMobile: false,
  toasts: [],
  shortcutsModalOpen: false,
  trashBadgeCount: 0,

  searchQuery: "",
  filterPriority: "all",
  filterDueDate: "all",
  filterGroup: "all",
  filterStatus: "all",

  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },

  toggleSidebarMobile: () => set((s) => ({ sidebarOpenMobile: !s.sidebarOpenMobile })),
  setSidebarMobile: (open) => set({ sidebarOpenMobile: open }),
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setTrashBadgeCount: (count) => set({ trashBadgeCount: count }),

  toast: (t) => {
    const id = Math.random().toString(36).slice(2, 10);
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 5500);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterDueDate: (d) => set({ filterDueDate: d }),
  setFilterGroup: (g) => set({ filterGroup: g }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  resetFilters: () =>
    set({
      searchQuery: "",
      filterPriority: "all",
      filterDueDate: "all",
      filterGroup: "all",
      filterStatus: "all",
    }),
}));

export type TasksByGroup = Record<string, Task[]>;

interface TasksState {
  groups: Group[];
  tasksByGroup: TasksByGroup;
  loading: boolean;
  loaded: boolean;
  history: Array<{
    type: string;
    payload: unknown;
    prev: TasksByGroup;
    next: TasksByGroup | null;
  }>;
  historyIndex: number;

  setGroups: (g: Group[]) => void;
  setTasks: (groupId: string, tasks: Task[]) => void;
  patchTask: (groupId: string, taskId: string, patch: Partial<Task>) => void;
  addTask: (groupId: string, task: Task) => void;
  removeTask: (groupId: string, taskId: string) => void;
  patchSubtask: (
    groupId: string,
    taskId: string,
    subtaskId: string,
    patch: Partial<Subtask>,
  ) => void;
  addSubtask: (groupId: string, taskId: string, subtask: Subtask) => void;
  removeSubtask: (groupId: string, taskId: string, subtaskId: string) => void;

  pushHistory: (type: string, payload: unknown) => void;
  undo: () => boolean;
  redo: () => boolean;
  setLoaded: (v: boolean) => void;
  setLoading: (v: boolean) => void;
}

const cloneTasks = (t: TasksByGroup): TasksByGroup =>
  Object.fromEntries(
    Object.entries(t).map(([k, v]) => [
      k,
      v.map((x) => ({
        ...x,
        subtasks: x.subtasks ? x.subtasks.map((s) => ({ ...s })) : [],
      })),
    ]),
  );

export const useTasksStore = create<TasksState>((set, get) => ({
  groups: [],
  tasksByGroup: {},
  loading: false,
  loaded: false,
  history: [],
  historyIndex: -1,

  setGroups: (g) => set({ groups: g }),
  setTasks: (groupId, tasks) =>
    set((s) => ({ tasksByGroup: { ...s.tasksByGroup, [groupId]: tasks } })),
  setLoaded: (v) => set({ loaded: v }),
  setLoading: (v) => set({ loading: v }),

  patchTask: (groupId, taskId, patch) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      const next = list.map((t) =>
        t.id === taskId ? ({ ...t, ...patch } as Task) : t,
      );
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: next } };
    }),

  addTask: (groupId, task) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: [...list, task] } };
    }),

  removeTask: (groupId, taskId) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      return {
        tasksByGroup: {
          ...s.tasksByGroup,
          [groupId]: list.filter((t) => t.id !== taskId),
        },
      };
    }),

  patchSubtask: (groupId, taskId, subtaskId, patch) =>
    set((s) => {
      const list = s.tasksByGroup[groupId] ?? [];
      const next = list.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).map((s2) =>
            s2.id === subtaskId ? ({ ...s2, ...patch } as Subtask) : s2,
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
          subtasks: (t.subtasks || []).filter((s2) => s2.id !== subtaskId),
        } as Task;
      });
      return { tasksByGroup: { ...s.tasksByGroup, [groupId]: next } };
    }),

  pushHistory: (type, payload) => {
    const prev = cloneTasks(get().tasksByGroup);
    const newEntry = { type, payload, prev, next: null };
    const list = get().history.slice(0, get().historyIndex + 1);
    list.push(newEntry);
    const trimmed = list.length > 50 ? list.slice(list.length - 50) : list;
    set({ history: trimmed, historyIndex: trimmed.length - 1 });
  },

  undo: () => {
    const idx = get().historyIndex;
    if (idx < 0) return false;
    const entry = get().history[idx];
    const curr = cloneTasks(get().tasksByGroup);
    const updatedHistory = get().history.map((h, i) =>
      i === idx ? { ...h, next: curr } : h,
    );
    set({
      tasksByGroup: entry.prev,
      history: updatedHistory,
      historyIndex: idx - 1,
    });
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
