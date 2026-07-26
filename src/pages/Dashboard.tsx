import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2, Redo2, Plus, ChevronDown, Trash2, FileText, ArrowRight } from "lucide-react";
import { api, HttpError } from "../lib/api";
import { useTasksStore, useUIStore } from "../stores/uiStore";
import type { Group, Subtask, Task } from "../../shared/types";
import { TaskCard } from "../components/TaskCard";
import { useAuthStore } from "../stores/authStore";
import { SmartSearchBar } from "../components/SmartSearchBar";
import { NotificationBanner } from "../components/NotificationBanner";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";

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

  const searchQuery = useUIStore((s) => s.searchQuery);
  const filterPriority = useUIStore((s) => s.filterPriority);
  const filterDueDate = useUIStore((s) => s.filterDueDate);
  const filterGroup = useUIStore((s) => s.filterGroup);
  const filterStatus = useUIStore((s) => s.filterStatus);

  const toast = useUIStore((s) => s.toast);
  const user = useAuthStore((s) => s.user);

  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1 && history.length > 0;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.listGroups();
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
            const tres = await api.listTasks(g.id);
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
      const res = await api.createGroup(name);
      const fresh = await api.listGroups();
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
      await api.createTask(groupId, { title: t });
      const full = await api.listTasks(groupId);
      setTasks(groupId, full.tasks);
    } catch (e) {
      toast({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not add task.",
      });
    }
  }

  async function handleUndo() {
    if (!undo()) return;
    toast({ kind: "info", message: "Undo" });
    try {
      // State sync with backend
      const groupsToSync = groups.map((g) => ({
        ...g,
        tasks: tasksByGroup[g.id] || [],
      }));
      await api.syncState(groupsToSync);
    } catch {
      /* ignore sync error */
    }
  }

  async function handleRedo() {
    if (!redo()) return;
    toast({ kind: "info", message: "Redo" });
    try {
      const groupsToSync = groups.map((g) => ({
        ...g,
        tasks: tasksByGroup[g.id] || [],
      }));
      await api.syncState(groupsToSync);
    } catch {
      /* ignore sync error */
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        void handleUndo();
      } else if (
        (e.key.toLowerCase() === "z" && e.shiftKey) ||
        e.key.toLowerCase() === "y"
      ) {
        e.preventDefault();
        void handleRedo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canUndo, canRedo]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper filter logic per task
  function passesFilters(t: Task, groupId: string): boolean {
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
  }

  const activeTasksByGroup = useMemo(() => {
    const out: Record<string, Task[]> = {};
    for (const g of groups) {
      out[g.id] = (tasksByGroup[g.id] || []).filter(
        (t) => !t.completed && passesFilters(t, g.id),
      );
    }
    return out;
  }, [groups, tasksByGroup, searchQuery, filterPriority, filterDueDate, filterGroup, filterStatus]);

  const completedByGroup = useMemo(() => {
    const out: Record<string, Task[]> = {};
    for (const g of groups) {
      out[g.id] = (tasksByGroup[g.id] || []).filter(
        (t) => t.completed && passesFilters(t, g.id),
      );
    }
    return out;
  }, [groups, tasksByGroup, searchQuery, filterPriority, filterDueDate, filterGroup, filterStatus]);

  const completedCount = groups.reduce(
    (acc, g) => acc + (completedByGroup[g.id]?.length || 0),
    0,
  );

  return (
    <div className="p-5 md:p-8 lg:p-10">
      {/* Due date push notification banner */}
      <NotificationBanner />

      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="chip">Dashboard</div>
          <h1 className="mt-3 text-3xl md:text-4xl text-balance">
            Welcome back, {user?.name?.split(" ")[0] ?? "friend"}.
          </h1>
          <p className="mt-2 text-text-muted max-w-2xl">
            Tasks grouped by people and categories. Track progress cleanly, with smart filters and instant restore.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-10 w-10 rounded-xl flex items-center justify-center border disabled:opacity-40 hover:bg-surface-alt transition-colors"
            style={{
              borderColor: "var(--color-border-subtle)",
              color: "var(--color-text-strong)",
            }}
            title="Undo (Ctrl/⌘ Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-10 w-10 rounded-xl flex items-center justify-center border disabled:opacity-40 hover:bg-surface-alt transition-colors"
            style={{
              borderColor: "var(--color-border-subtle)",
              color: "var(--color-text-strong)",
            }}
            title="Redo (Ctrl/⌘ Shift Z)"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </header>

      {/* Smart Search Bar */}
      <SmartSearchBar />

      {/* Create Group Card */}
      <form
        onSubmit={handleCreateGroup}
        className="card mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div
          className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center"
          style={{
            background: "color-mix(in srgb, var(--color-primary) 24%, transparent)",
            color: "var(--color-text-strong)",
          }}
        >
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: "var(--color-text-strong)" }}>
            Create a group
          </div>
          <div className="text-xs text-text-muted">
            e.g. "Harsha", "Shopping", or "Marketing"
          </div>
        </div>
        <div className="flex items-center gap-2 sm:min-w-[420px]">
          <input
            className="input"
            placeholder="Group name…"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
            maxLength={60}
          />
          <button
            id="btn-create-group"
            className="btn-primary h-11 px-5"
            disabled={creating}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </form>

      {loaded && groups.length === 0 ? (
        <EmptyState onCreate={() => setNewGroupName("Personal")} />
      ) : (
        <>
          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            }}
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
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="rounded-3xl border p-10 text-center"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div
        className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 24%, transparent)",
          color: "var(--color-text-strong)",
        }}
      >
        <Plus size={26} />
      </div>
      <h3 className="text-2xl" style={{ color: "var(--color-text-strong)" }}>
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
  const toast = useUIStore((s) => s.toast);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const setTrashBadgeCount = useUIStore((s) => s.setTrashBadgeCount);

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
      await api.updateGroup(group.id, { name: newName });
      const fresh = await api.listGroups();
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
      await api.deleteGroup(group.id);
      const fresh = await api.listGroups();
      setGroups(fresh.groups);
      setTasks(group.id, []);

      const trashRes = await api.listTrash();
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
          await api.restoreTrashItem("group", group.id);
          const restoredGroups = await api.listGroups();
          setGroups(restoredGroups.groups);
          const tRes = await api.listTasks(group.id);
          setTasks(group.id, tRes.tasks);
        },
      });
    } catch {
      toast({ kind: "error", message: "Could not delete group." });
    }
  }

  return (
    <section
      className="card card-hover flex flex-col fade-in-up"
      style={{ animationDelay: `${delay}ms`, minHeight: 320 }}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <input
              autoFocus
              className="input"
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
              style={{ padding: "0.5rem 0.75rem" }}
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
              <h2
                className="font-display font-bold text-xl md:text-2xl truncate"
                style={{ color: "var(--color-text-strong)" }}
              >
                {group.name}
              </h2>
            </button>
          )}
          <div className="text-xs text-text-muted mt-1">
            {activeTasks.length} active · {completedTasks.length} done
          </div>
        </div>
        <button
          aria-label={`Delete group ${group.name}`}
          onClick={remove}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </header>

      <div className="space-y-2.5 flex-1">
        {activeTasks.length === 0 && (
          <div
            className="rounded-xl border border-dashed p-5 text-sm text-center"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <span className="text-text-muted">
              No tasks match your filter.
            </span>
          </div>
        )}
        {activeTasks.map((t, i) => (
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
            className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-transform hover:scale-102"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
              color: "var(--color-primary)",
              borderRadius: "6px",
            }}
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
  const [open, setOpen] = useState(true);
  return (
    <section
      className="mt-10 rounded-3xl border overflow-hidden"
      style={{
        background: "var(--color-completed-bg)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M20 6L9 17l-5-5"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <div
              className="font-display font-bold text-lg md:text-xl"
              style={{ color: "var(--color-text-strong)" }}
            >
              Completed tasks ({groups.reduce((a, g) => a + (byGroup[g.id]?.length || 0), 0)})
            </div>
            <div className="text-xs text-text-muted">
              {groups.reduce((a, g) => a + (byGroup[g.id]?.length || 0), 0)} tasks
              across {groups.filter((g) => (byGroup[g.id]?.length || 0) > 0).length} groups
            </div>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={
            "transition-transform duration-200 text-text-muted " +
            (open ? "rotate-180" : "")
          }
        />
      </button>
      {open && (
        <div
          className="px-5 md:px-6 pb-6 grid gap-5"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          }}
        >
          {groups.map((g) => {
            const items = byGroup[g.id] || [];
            if (items.length === 0) return null;
            return (
              <div key={g.id} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">
                  [{g.name}]
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
