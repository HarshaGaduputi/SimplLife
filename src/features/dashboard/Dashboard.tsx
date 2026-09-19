import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2, Redo2, Plus, ChevronDown, Trash2, FileText, ArrowRight, ArrowDownUp, Zap, Flag, Brain } from "lucide-react";
import { groupsService, tasksService, stateService, trashService, HttpError, aiApiService } from "../../services/api";
import { useTasksStore } from "../../stores/tasksStore";
import { useUIStore } from "../../stores/uiStore";
import { useFiltersStore } from "../../stores/filtersStore";
import { useToastStore } from "../../stores/toastStore";
import type { Group, Subtask, Task } from "../../../shared/types";
import { TaskCard } from "../tasks/TaskCard";
import { useAuthStore } from "../../stores/authStore";
import { SmartSearchBar } from "../search/SmartSearchBar";
import { KeyboardShortcutsModal } from "@/layouts/KeyboardShortcutsModal";
import { DailyReviewDialog } from "../daily-review/DailyReviewDialog";
import { Moon } from "lucide-react";

const KEYWORD_MAP: Record<string, string> = {
  blog: "Blog Writing",
  write: "Blog Writing",
  article: "Blog Writing",
  plan: "Event Planning",
  party: "Event Planning",
  event: "Event Planning",
  study: "Study Session",
  exam: "Study Session",
  revision: "Study Session",
  bug: "Bug Fix",
  fix: "Bug Fix",
  issue: "Bug Fix",
  patch: "Bug Fix",
  shop: "Shopping Run",
  buy: "Shopping Run",
  grocery: "Shopping Run",
  client: "Client Task",
  meeting: "Client Task",
  call: "Client Task",
  health: "Health & Fitness",
  gym: "Health & Fitness",
  workout: "Health & Fitness",
  read: "Reading List",
  book: "Reading List",
  chapter: "Reading List",
  week: "Weekly Goals",
  goal: "Weekly Goals",
  target: "Weekly Goals",
  project: "Work Project",
  launch: "Work Project",
  deploy: "Work Project",
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [reviewOpen, setReviewOpen] = useState(false);

  const groups = useTasksStore((s) => s.groups);
  const tasksByGroup = useTasksStore((s) => s.tasksByGroup);
  const setGroups = useTasksStore((s) => s.setGroups);
  const setTasks = useTasksStore((s) => s.setTasks);
  const pushHistory = useTasksStore((s) => s.pushHistory);
  const undo = useTasksStore((s) => s.undo);
  const redo = useTasksStore((s) => s.redo);
  const historyIndex = useTasksStore((s) => s.historyIndex);
  const history = useTasksStore((s) => s.history);
  const setLoading = useTasksStore((s) => s.setLoading);
  const loaded = useTasksStore((s) => s.loaded);
  const setLoaded = useTasksStore((s) => s.setLoaded);

  const searchQuery = useFiltersStore((s) => s.searchQuery);
  const filterPriority = useFiltersStore((s) => s.filterPriority);
  const filterDueDate = useFiltersStore((s) => s.filterDueDate);
  const filterGroup = useFiltersStore((s) => s.filterGroup);
  const filterStatus = useFiltersStore((s) => s.filterStatus);

  const toast = useToastStore((s) => s.toast);
  const user = useAuthStore((s) => s.user);

  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1 && history.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await groupsService.list();
        if (cancelled) return;
        setGroups(res.groups);
        const emptyMap: Record<string, Task[]> = {};
        for (const g of res.groups) emptyMap[g.id] = [];
        useTasksStore.setState((s) => ({
          ...s,
          tasksByGroup: { ...s.tasksByGroup, ...emptyMap },
        }));
        for (const g of res.groups) {
          try {
            const tres = await tasksService.list(g.id);
            if (cancelled) return;
            setTasks(g.id, tres.tasks);
          } catch {
            /* ignore per group failure */
          }
        }
        setLoaded(true);
      } catch (e) {
        const h = e as HttpError;
        if (h.status !== 401) {
          toast({
            kind: "error",
            message: "Could not load your groups. Please refresh.",
          });
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, setGroups, setTasks, setLoaded, setLoading, toast]);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await groupsService.create(name);
      const fresh = await groupsService.list();
      setGroups(fresh.groups);
      setTasks(res.group.id, []);
      setNewGroupName("");
      toast({ kind: "success", message: `Group "${res.group.name}" created.` });
    } catch (e) {
      toast({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not create group. Try again.",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleAddTask(groupId: string, title: string) {
    const t = title.trim();
    if (!t) return;
    try {
      pushHistory("add-task", { groupId });
      await tasksService.create(groupId, { title: t });
      const full = await tasksService.list(groupId);
      setTasks(groupId, full.tasks);
    } catch (e) {
      toast({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not add task.",
      });
    }
  }

  const handleUndo = useCallback(() => {
    toast({ kind: "info", message: "Undo is currently disabled in cloud mode." });
  }, [toast]);

  const handleRedo = useCallback(() => {
    toast({ kind: "info", message: "Redo is currently disabled in cloud mode." });
  }, [toast]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.key.toLowerCase() === "z" && e.shiftKey) ||
        e.key.toLowerCase() === "y"
      ) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo, handleRedo]);

  const todayStr = new Date().toISOString().split("T")[0];

  const passesFilters = useCallback((t: Task, groupId: string): boolean => {
    if (filterGroup !== "all" && filterGroup !== groupId) return false;
    if (filterStatus === "active" && t.completed) return false;
    if (filterStatus === "completed" && !t.completed) return false;

    if (filterPriority !== "all") {
      if (filterPriority === "none" && t.priority && t.priority !== "none") return false;
      if (filterPriority !== "none" && t.priority !== filterPriority) return false;
    }

    if (filterDueDate !== "all") {
      if (!t.dueDate) return false;
      const datePart = t.dueDate.split("T")[0];
      if (filterDueDate === "overdue" && (datePart >= todayStr || t.completed)) return false;
      if (filterDueDate === "today" && datePart !== todayStr) return false;
      if (filterDueDate === "upcoming" && datePart <= todayStr) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inDesc = (t.description || "").toLowerCase().includes(q);
      const inSubs = (t.subtasks || []).some((s) => s.title.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inSubs) return false;
    }

    return true;
  }, [filterGroup, filterStatus, filterPriority, filterDueDate, todayStr, searchQuery]);

  const activeTasksByGroup = useMemo(() => {
    const out: Record<string, Task[]> = {};
    for (const g of groups) {
      out[g.id] = (tasksByGroup[g.id] || []).filter(
        (t) => !t.completed && passesFilters(t, g.id),
      );
    }
    return out;
  }, [groups, tasksByGroup, passesFilters]);

  const completedByGroup = useMemo(() => {
    const out: Record<string, Task[]> = {};
    for (const g of groups) {
      out[g.id] = (tasksByGroup[g.id] || []).filter(
        (t) => t.completed && passesFilters(t, g.id),
      );
    }
    return out;
  }, [groups, tasksByGroup, passesFilters]);

  const completedCount = groups.reduce(
    (acc, g) => acc + (completedByGroup[g.id]?.length || 0),
    0,
  );

  // Calculate Today's Focus tasks
  const todaysFocusTasks = useMemo(() => {
    let allActive: { task: Task; groupId: string }[] = [];
    for (const g of groups) {
      const active = (tasksByGroup[g.id] || []).filter(t => !t.completed);
      for (const t of active) {
        allActive.push({ task: t, groupId: g.id });
      }
    }
    
    // 1. Get tasks due today
    let focus = allActive.filter(t => t.task.dueDate === todayStr);
    
    // 2. If fewer than 3, backfill with high priority
    if (focus.length < 3) {
      const highPrio = allActive.filter(t => t.task.priority === "high" && !focus.includes(t));
      focus = [...focus, ...highPrio];
    }
    
    // 3. If still fewer than 3, backfill with medium priority
    if (focus.length < 3) {
      const medPrio = allActive.filter(t => t.task.priority === "medium" && !focus.includes(t));
      focus = [...focus, ...medPrio];
    }

    return focus.slice(0, 3);
  }, [groups, tasksByGroup, todayStr]);

  return (
    <div className="p-4 md:p-6 lg:p-8">

      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="chip">Dashboard</div>
          <h1 className="mt-3 text-3xl md:text-4xl text-balance">
            Welcome back, {user?.name?.split(" ")[0] ?? "friend"}.
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-2xl text-lg">
            Let's focus on what matters today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReviewOpen(true)}
            className="h-10 px-3 rounded-lg flex items-center gap-2 font-bold bg-surface border border-border-subtle text-text-strong hover:bg-surface-alt transition-colors"
            title="Daily Review"
          >
            <Moon size={16} className="text-[var(--color-primary)]" />
            <span className="hidden sm:inline">Review</span>
          </button>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-10 w-10 rounded-lg flex items-center justify-center border border-border-subtle text-text-strong disabled:opacity-40 hover:bg-surface-alt transition-colors"
            title="Undo (Ctrl/⌘ Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-10 w-10 rounded-lg flex items-center justify-center border border-border-subtle text-text-strong disabled:opacity-40 hover:bg-surface-alt transition-colors"
            title="Redo (Ctrl/⌘ Shift Z)"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </header>

      {/* Today's Focus Hero Widget */}
      {todaysFocusTasks.length > 0 && (
        <section className="mb-8 p-6 md:p-8 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap size={120} className="text-primary" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2 text-text-strong mb-6">
              <Zap className="text-primary" size={20} /> Today's Focus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {todaysFocusTasks.map(({ task, groupId }) => (
                <div key={task.id} className="bg-surface border border-border-subtle p-4 rounded-2xl hover:border-primary/50 transition-colors shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle">
                        {groups.find(g => g.id === groupId)?.name || "Group"}
                      </span>
                      {task.priority === "high" && <Flag size={12} className="text-danger" />}
                    </div>
                    <h3 className="font-semibold text-text-strong text-sm line-clamp-2">{task.title}</h3>
                  </div>
                  <button 
                    onClick={() => navigate(`/focus?taskId=${task.id}`)}
                    className="mt-4 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1"
                  >
                    Start Focus <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Smart Search Bar */}
      <SmartSearchBar />

      {/* Create Group Card */}
      <form
        onSubmit={handleCreateGroup}
        className="mb-8 flex items-center gap-3 h-12"
      >
        <div
          className="h-12 w-12 rounded-lg shrink-0 flex items-center justify-center border border-border bg-surface text-text-muted"
        >
          <FileText size={20} />
        </div>
        <input
          className="input h-12 flex-1"
          placeholder="Group name…"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          required
          maxLength={60}
        />
        <button
          id="btn-create-group"
          className="btn-primary h-12 px-4"
          disabled={creating}
          aria-label="Create group"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Create</span>
        </button>
      </form>

      {loaded && groups.length === 0 ? (
        <EmptyState onCreate={() => setNewGroupName("Personal")} />
      ) : (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {groups.map((g, i) => (
              <GroupPanel
                key={g.id}
                index={i}
                group={g}
                activeTasks={activeTasksByGroup[g.id] || []}
                completedTasks={completedByGroup[g.id] || []}
                onAddTask={(title) => handleAddTask(g.id, title)}
                highlightQuery={searchQuery}
              />
            ))}
          </div>

          {completedCount > 0 && (
            <CompletedSection
              groups={groups}
              byGroup={completedByGroup}
              highlightQuery={searchQuery}
            />
          )}
        </>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />

      {/* Daily Review Dialog */}
      <DailyReviewDialog open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="card p-8 text-center"
    >
      <div
        className="mx-auto h-16 w-16 rounded-xl flex items-center justify-center mb-6 bg-surface-alt text-text-strong"
      >
        <Plus size={26} />
      </div>
      <h3 className="text-2xl">
        Create your first group.
      </h3>
      <p className="mt-3 text-text-muted max-w-lg mx-auto">
        Think of groups as the people or categories you work with — "Harsha",
        "Kitchen reno", "Client X" — name them whatever makes sense to you.
      </p>
      <button onClick={onCreate} className="btn-primary mt-6">
        <Plus size={18} />
        Start with a "Personal" group
      </button>
    </div>
  );
}

function GroupPanel({
  group,
  index,
  activeTasks,
  completedTasks,
  onAddTask,
  highlightQuery = "",
}: {
  group: Group;
  index: number;
  activeTasks: Task[];
  completedTasks: Task[];
  onAddTask: (title: string) => void;
  highlightQuery?: string;
}) {
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const setGroups = useTasksStore((s) => s.setGroups);
  const setTasks = useTasksStore((s) => s.setTasks);
  const pushHistory = useTasksStore((s) => s.pushHistory);
  const toast = useToastStore((s) => s.toast);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const setTrashBadgeCount = useUIStore((s) => s.setTrashBadgeCount);

  type SortOption = "default" | "priority" | "dueDate";
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const delay = (index % 6) * 40;

  // Smart Template Suggestion Debounce
  useEffect(() => {
    const val = newTask.trim().toLowerCase();
    if (val.length < 4) {
      setSuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      let matched: string | null = null;
      for (const [kw, tplName] of Object.entries(KEYWORD_MAP)) {
        if (val.includes(kw)) {
          matched = tplName;
          break;
        }
      }
      setSuggestion(matched);
    }, 300);

    return () => clearTimeout(timer);
  }, [newTask]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask("");
    setSuggestion(null);
  };

  async function rename() {
    const newName = nameDraft.trim();
    if (!newName || newName === group.name) {
      setEditingName(false);
      setNameDraft(group.name);
      return;
    }
    try {
      pushHistory("rename-group", { groupId: group.id, oldName: group.name });
      await groupsService.update(group.id, { name: newName });
      const fresh = await groupsService.list();
      setGroups(fresh.groups);
      toast({ kind: "success", message: "Group renamed." });
    } catch {
      toast({ kind: "error", message: "Could not rename group." });
    } finally {
      setEditingName(false);
    }
  }

  async function remove() {
    const ok = window.confirm(
      `Move group "${group.name}" to Trash?`,
    );
    if (!ok) return;
    try {
      await groupsService.remove(group.id);
      const fresh = await groupsService.list();
      setGroups(fresh.groups);
      setTasks(group.id, []);

      const trashRes = await trashService.list();
      setTrashBadgeCount(
        (trashRes.groups?.length || 0) +
          (trashRes.tasks?.length || 0) +
          (trashRes.subtasks?.length || 0),
      );

      toast({
        kind: "info",
        message: `Group "${group.name}" moved to Trash.`,
        actionLabel: "[Restore]",
        onAction: async () => {
          await trashService.restore("group", group.id);
          const restoredGroups = await groupsService.list();
          setGroups(restoredGroups.groups);
          const tRes = await tasksService.list(group.id);
          setTasks(group.id, tRes.tasks);
        },
      });
    } catch {
      toast({ kind: "error", message: "Could not delete group." });
    }
  }

  const priorityWeight = { high: 3, medium: 2, low: 1, none: 0 };
  const sortedActiveTasks = useMemo(() => {
    if (sortBy === "default") return activeTasks;
    return [...activeTasks].sort((a, b) => {
      if (sortBy === "priority") {
        const wA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        const wB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
        if (wA !== wB) return wB - wA; // High priority first
        return a.order - b.order;
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return a.order - b.order;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    });
  }, [activeTasks, sortBy]);

  async function handleAIPrioritize() {
    if (activeTasks.length < 2) {
      toast({ kind: "info", message: "Need at least 2 tasks to prioritize." });
      return;
    }
    setIsPrioritizing(true);
    try {
      const res = await aiApiService.prioritizeTasks(activeTasks.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate
      })));
      
      pushHistory("ai-prioritize", { groupId: group.id });
      // Apply priorities locally and to server
      const newTasks = [...activeTasks];
      for (const p of res.priorities) {
        const task = newTasks.find(t => t.id === p.id);
        if (task && task.priority !== p.priority) {
          task.priority = p.priority as any;
          await tasksService.update(p.id, { priority: p.priority as any });
        }
      }
      const fresh = await tasksService.list(group.id);
      setTasks(group.id, fresh.tasks);
      setSortBy("priority");
      toast({ kind: "success", message: "Tasks prioritized by AI" });
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setIsPrioritizing(false);
    }
  }

  return (
    <section
      className="card card-hover flex flex-col fade-in-up min-h-[280px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <input
              autoFocus
              className="input py-2 px-3"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={rename}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setNameDraft(group.name);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              onDoubleClick={() => {
                setNameDraft(group.name);
                setEditingName(true);
              }}
              className="text-left group/header"
            >
              <h2 className="text-xl md:text-2xl font-bold truncate">
                {group.name}
              </h2>
            </button>
          )}
          <div className="text-xs text-text-muted mt-1">
            {activeTasks.length} active · {completedTasks.length} done
          </div>
        </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                aria-label="Sort tasks"
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt transition-colors"
              >
                <ArrowDownUp size={16} />
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border z-40 p-1 bg-surface border-border-subtle shadow-lg">
                  <button
                    onClick={() => { handleAIPrioritize(); setSortMenuOpen(false); }}
                    disabled={isPrioritizing}
                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs rounded-lg hover:bg-surface-alt text-primary font-medium"
                  >
                    <Brain size={12} />
                    {isPrioritizing ? "Prioritizing..." : "AI Prioritize"}
                  </button>
                  <div className="h-px w-full bg-border-subtle my-1" />
                  <button
                    onClick={() => { setSortBy("default"); setSortMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-surface-alt ${sortBy === "default" ? "font-bold text-primary" : ""}`}
                  >
                    Default Order
                  </button>
                  <button
                    onClick={() => { setSortBy("priority"); setSortMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-surface-alt ${sortBy === "priority" ? "font-bold text-primary" : ""}`}
                  >
                    Priority
                  </button>
                  <button
                    onClick={() => { setSortBy("dueDate"); setSortMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-surface-alt ${sortBy === "dueDate" ? "font-bold text-primary" : ""}`}
                  >
                    Due Date
                  </button>
                </div>
              )}
            </div>
            <button
              aria-label={`Delete group ${group.name}`}
              onClick={remove}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-text-muted hover:text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
      </header>

      <div className="space-y-2 flex-1">
        {activeTasks.length === 0 && (
          <div
            className="rounded-2xl border border-dashed border-border-subtle p-4 text-sm text-center"
          >
            <span className="text-text-muted">
              No tasks match your filter.
            </span>
          </div>
        )}
        {sortedActiveTasks.map((t, i) => (
          <TaskCard
            key={t.id}
            groupId={group.id}
            task={t}
            indexHint={i}
            highlightQuery={highlightQuery}
          />
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            className="input"
            placeholder="Add a task…"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            maxLength={240}
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="btn-primary h-11 w-11 shrink-0 px-0 disabled:opacity-40"
            aria-label="Add task"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Smart Template Suggestion Pill */}
        {suggestion && (
          <button
            type="button"
            onClick={() =>
              navigate(`/templates?highlight=${encodeURIComponent(suggestion)}`)
            }
            className="self-start chip transition-transform hover:scale-102"
          >
            Try the [{suggestion}] template <ArrowRight size={13} />
          </button>
        )}
      </form>
    </section>
  );
}

function CompletedSection({
  groups,
  byGroup,
  highlightQuery = "",
}: {
  groups: Group[];
  byGroup: Record<string, Task[]>;
  highlightQuery?: string;
}) {
  const total = groups.reduce((a, g) => a + (byGroup[g.id]?.length || 0), 0);
  const [open, setOpen] = useState(true);
  return (
    <section className="mt-8 border-t border-border pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <div className="text-sm font-medium text-text-muted">
          Completed ({total})
        </div>
        <ChevronDown
          size={18}
          className={
            "transition-transform duration-200 text-text-muted " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div className="mt-6 space-y-6">
          {groups.map((g) => {
            const items = byGroup[g.id] || [];
            if (items.length === 0) return null;
            return (
              <div key={g.id} className="space-y-2">
                <div className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
                  {g.name}
                </div>
                <div className="space-y-2">
                  {items.map((t, i) => (
                    <TaskCard
                      key={t.id}
                      groupId={g.id}
                      task={t}
                      indexHint={i}
                      muted
                      highlightQuery={highlightQuery}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export type { Subtask };
