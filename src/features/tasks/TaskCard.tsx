import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  GripVertical,
  Trash2,
  Plus,
  AlignLeft,
  MoreHorizontal,
  Wand2,
  Calendar,
  Flag,
} from "lucide-react";
import type { PriorityLevel, Subtask, Task } from "../../../shared/types";
import { tasksService, trashService, HttpError } from "../../services/api";
import { useTasksStore } from "../../stores/tasksStore";
import { useUIStore } from "../../stores/uiStore";
import { useToastStore } from "../../stores/toastStore";
import { calculateTaskRisk } from "../dashboard/taskRisk";

export function TaskCard({
  groupId,
  task,
  indexHint,
  muted,
  highlightQuery = "",
}: {
  groupId: string;
  task: Task;
  indexHint?: number;
  muted?: boolean;
  highlightQuery?: string;
}) {
  const patchTask = useTasksStore((s) => s.patchTask);
  const patchSubtask = useTasksStore((s) => s.patchSubtask);
  const addSubtask = useTasksStore((s) => s.addSubtask);
  const removeSubtask = useTasksStore((s) => s.removeSubtask);
  const pushHistory = useTasksStore((s) => s.pushHistory);
  const setTasks = useTasksStore((s) => s.setTasks);
  const removeTask = useTasksStore((s) => s.removeTask);

  const toast = useToastStore((s) => s.toast);
  const setTrashBadgeCount = useUIStore((s) => s.setTrashBadgeCount);

  const [titleDraft, setTitleDraft] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [descOpen, setDescOpen] = useState(!!task.description);
  const [descDraft, setDescDraft] = useState(task.description ?? "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [newSub, setNewSub] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setTitleDraft(task.title);
    setDescDraft(task.description ?? "");
    if (!task.description && !editingDesc) setDescOpen(false);
  }, [task.id, task.title, task.description, editingDesc]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  // Cmd+D shortcut when card focused
  function handleCardKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      setDescOpen(true);
      setEditingDesc(true);
    }
  }

  async function commitTitle() {
    const next = titleDraft.trim();
    setEditingTitle(false);
    if (!next || next === task.title) {
      setTitleDraft(task.title);
      return;
    }
    try {
      pushHistory("edit-task-title", { taskId: task.id, before: task.title });
      patchTask(groupId, task.id, { title: next });
      await tasksService.update(task.id, { title: next });
    } catch (e) {
      patchTask(groupId, task.id, { title: task.title });
      setTitleDraft(task.title);
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function commitDesc() {
    const nextRaw = descDraft;
    const next = nextRaw.trim().length === 0 ? null : nextRaw;
    setEditingDesc(false);
    if (next === task.description) return;
    try {
      pushHistory("edit-task-desc", { taskId: task.id, before: task.description });
      patchTask(groupId, task.id, { description: next });
      await tasksService.update(task.id, { description: next });
      if (!next) setDescOpen(false);
    } catch (e) {
      patchTask(groupId, task.id, { description: task.description });
      setDescDraft(task.description ?? "");
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function setPriority(priority: PriorityLevel) {
    if (priority === task.priority) return;
    try {
      pushHistory("set-priority", { taskId: task.id, before: task.priority });
      patchTask(groupId, task.id, { priority });
      await tasksService.update(task.id, { priority });
    } catch (e) {
      patchTask(groupId, task.id, { priority: task.priority });
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function setDueDate(dateStr: string | null) {
    if (dateStr === task.dueDate) return;
    try {
      pushHistory("set-due-date", { taskId: task.id, before: task.dueDate });
      patchTask(groupId, task.id, { dueDate: dateStr });
      await tasksService.update(task.id, { dueDate: dateStr });
    } catch (e) {
      patchTask(groupId, task.id, { dueDate: task.dueDate });
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function toggleComplete() {
    const next = !task.completed;
    try {
      pushHistory("toggle-complete", { taskId: task.id, before: task.completed });
      patchTask(groupId, task.id, { completed: next });
      if (next) await tasksService.complete(task.id);
      else await tasksService.uncomplete(task.id);
      const fresh = await tasksService.list(groupId);
      setTasks(groupId, fresh.tasks);
      toast({
        kind: next ? "success" : "info",
        message: next ? "Task completed — great work." : "Task restored.",
      });
    } catch (e) {
      patchTask(groupId, task.id, { completed: task.completed });
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function deleteTask() {
    try {
      pushHistory("delete-task", { taskId: task.id, before: task });
      removeTask(groupId, task.id);
      await tasksService.remove(task.id);

      // update trash count
      const trashRes = await trashService.list();
      const total =
        (trashRes.groups?.length || 0) +
        (trashRes.tasks?.length || 0) +
        (trashRes.subtasks?.length || 0);
      setTrashBadgeCount(total);

      toast({
        kind: "info",
        message: `Task "${task.title}" moved to Trash.`,
        actionLabel: "[Restore]",
        onAction: async () => {
          await trashService.restore("task", task.id);
          const fresh = await tasksService.list(groupId);
          setTasks(groupId, fresh.tasks);
          const updatedTrash = await trashService.list();
          setTrashBadgeCount(
            (updatedTrash.groups?.length || 0) +
              (updatedTrash.tasks?.length || 0) +
              (updatedTrash.subtasks?.length || 0),
          );
        },
      });
    } catch (e) {
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function handleAiSplit() {
    if ((task.subtasks || []).length >= 5) return;
    setAiLoading(true);
    try {
      pushHistory("ai-split", { taskId: task.id, beforeSubs: task.subtasks });
      const res = await tasksService.aiSplit(task.id);
      const fresh = await tasksService.list(groupId);
      setTasks(groupId, fresh.tasks);
      setSubtasksOpen(true);
      toast({
        kind: "success",
        message: `${res.subtasks.length} subtasks generated by AI.`,
      });
    } catch (e) {
      toast({ kind: "error", message: (e as Error).message });
    } finally {
      setAiLoading(false);
    }
  }

  async function addSub() {
    const t = newSub.trim();
    if (!t) return;
    try {
      pushHistory("add-subtask", { taskId: task.id });
      const res = await tasksService.createSubtask(task.id, { title: t });
      addSubtask(groupId, task.id, res.subtask as Subtask);
      const fresh = await tasksService.list(groupId);
      setTasks(groupId, fresh.tasks);
      setNewSub("");
    } catch (e) {
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function toggleSub(sub: Subtask) {
    const next = !sub.completed;
    try {
      pushHistory("toggle-sub", { id: sub.id, before: sub.completed });
      patchSubtask(groupId, task.id, sub.id, { completed: next });
      await tasksService.updateSubtask(sub.id, { completed: next });
    } catch (e) {
      patchSubtask(groupId, task.id, sub.id, { completed: sub.completed });
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  async function deleteSub(sub: Subtask) {
    try {
      pushHistory("delete-sub", { sub });
      removeSubtask(groupId, task.id, sub.id);
      await tasksService.removeSubtask(sub.id);

      toast({
        kind: "info",
        message: `Subtask "${sub.title}" moved to Trash.`,
        actionLabel: "[Restore]",
        onAction: async () => {
          await trashService.restore("subtask", sub.id);
          const fresh = await tasksService.list(groupId);
          setTasks(groupId, fresh.tasks);
        },
      });
    } catch (e) {
      addSubtask(groupId, task.id, sub);
      toast({ kind: "error", message: (e as HttpError).message });
    }
  }

  // Priority color map
  const priorityColor =
    task.priority === "high"
      ? "var(--color-danger)"
      : task.priority === "medium"
        ? "var(--color-warning)"
        : task.priority === "low"
          ? "var(--color-success)"
          : undefined;

  // Due Date Badge color logic
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
  const isToday = task.dueDate === todayStr;

  const dueDateChipStyle = isOverdue
    ? {
        background:
          "color-mix(in srgb, var(--color-danger) 12%, transparent)",
        color: "var(--color-danger)",
        borderColor: "color-mix(in srgb, var(--color-danger) 46%, transparent)",
      }
    : isToday
      ? {
          background:
            "color-mix(in srgb, var(--color-warning) 14%, transparent)",
          color: "var(--color-warning)",
          borderColor:
            "color-mix(in srgb, var(--color-warning) 46%, transparent)",
        }
      : {
          background:
            "color-mix(in srgb, var(--color-primary) 10%, transparent)",
          color: "var(--color-text-strong)",
          borderColor: "var(--color-border-subtle)",
        };

  const risk = calculateTaskRisk(task);
  const riskColor = 
    risk.level === "high" ? "var(--color-danger)" : 
    risk.level === "medium" ? "var(--color-warning)" : 
    "var(--color-text-muted)";

  const subs = task.subtasks || [];
  void indexHint;

  function renderHighlightedText(text: string) {
    if (!highlightQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${highlightQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightQuery.toLowerCase() ? (
        <mark key={i} className="mark">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }

  return (
    <article
      ref={cardRef as React.RefObject<HTMLElement>}
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      className={
        "rounded-2xl border transition-all duration-200 relative group/task overflow-hidden outline-none " +
        (muted ? "" : "card-hover")
      }
      style={{
        background: muted ? "var(--color-completed-bg)" : "var(--color-surface)",
        borderColor: priorityColor ? priorityColor : "var(--color-border-subtle)",
        borderLeftWidth: priorityColor ? "4px" : "1px",
      }}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          className="mt-0.5 h-5 w-5 rounded shrink-0 border-2 flex items-center justify-center transition-colors duration-150"
          onClick={toggleComplete}
          style={{
            background: task.completed ? "var(--color-primary)" : "transparent",
            borderColor: task.completed ? "var(--color-primary)" : "var(--color-border)",
            color: "var(--color-primary-foreground)",
          }}
          aria-label={task.completed ? "Mark as not done" : "Mark as done"}
        >
          {task.completed && (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path
                d="M3.5 8.5l3 3 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Priority Flag Selector */}
            <div className="relative group/prio">
              <button
                type="button"
                className="h-6 px-2 rounded-full flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest transition-colors"
                style={{
                  background: priorityColor
                    ? `color-mix(in srgb, ${priorityColor} 14%, transparent)`
                    : "transparent",
                  color: priorityColor || "var(--color-text-muted)",
                }}
                title="Change Priority"
              >
                <Flag size={12} fill={priorityColor || "none"} />
                {task.priority && task.priority !== "none" && <span>{task.priority}</span>}
              </button>

              <div className="absolute left-0 top-full mt-1 hidden group-hover/prio:flex flex-col gap-1 p-2 rounded-2xl border z-30 bg-surface border-border-subtle">
                <button
                  onClick={() => setPriority("high")}
                  className="px-2 py-1 text-xs text-left rounded-lg hover:bg-surface-alt font-medium flex items-center gap-1"
                  style={{ color: "var(--color-danger)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--color-danger)" }}
                  />{" "}
                  High
                </button>
                <button
                  onClick={() => setPriority("medium")}
                  className="px-2 py-1 text-xs text-left rounded-lg hover:bg-surface-alt font-medium flex items-center gap-1"
                  style={{ color: "var(--color-warning)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--color-warning)" }}
                  />{" "}
                  Medium
                </button>
                <button
                  onClick={() => setPriority("low")}
                  className="px-2 py-1 text-xs text-left rounded-lg hover:bg-surface-alt font-medium flex items-center gap-1"
                  style={{ color: "var(--color-success)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--color-success)" }}
                  />{" "}
                  Low
                </button>
                <button
                  onClick={() => setPriority("none")}
                  className="px-2 py-1 text-xs text-left rounded-lg hover:bg-surface-alt font-medium text-text-muted flex items-center gap-1"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-text-muted) 55%, transparent)",
                    }}
                  />{" "}
                  None
                </button>
              </div>
            </div>

            {/* Due Date Chip / Picker */}
            <div className="relative flex items-center gap-1 text-xs">
              <Calendar size={13} className="text-text-muted" />
              <input
                type="date"
                value={task.dueDate || ""}
                onChange={(e) => setDueDate(e.target.value || null)}
                className="bg-transparent text-xs outline-none cursor-pointer rounded px-1 border"
                style={dueDateChipStyle}
              />
            </div>

            {/* Task Risk Badge */}
            {!task.completed && risk.level !== "none" && risk.level !== "low" && (
              <div 
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                style={{ 
                  color: riskColor, 
                  borderColor: `color-mix(in srgb, ${riskColor} 40%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${riskColor} 10%, transparent)`
                }}
                title={risk.reason}
              >
                {risk.level === "high" ? "At Risk" : "Review"}
              </div>
            )}
          </div>

          {editingTitle ? (
            <input
              ref={titleRef}
              className="input-compact text-base"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setTitleDraft(task.title);
                  setEditingTitle(false);
                }
              }}
              maxLength={240}
            />
          ) : (
            <button
              type="button"
              className="w-full text-left"
              onClick={() => !task.completed && setEditingTitle(true)}
            >
              <div
                className={
                  "font-semibold text-base text-balance break-words text-text-strong " +
                  (task.completed ? "line-through opacity-60" : "")
                }
              >
                {renderHighlightedText(task.title)}
              </div>
            </button>
          )}

          {task.templateId && (
            <div className="mt-2">
              <span className="chip">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
                Templated
              </span>
            </div>
          )}

          {(task.description || descOpen) && (
            <div className="mt-2">
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-strong transition-colors mb-2"
                onClick={() => setDescOpen((v) => !v)}
              >
                <AlignLeft size={14} />
                <span>{task.description ? "Description" : "Add description (⌘D)"}</span>
                <ChevronDown
                  size={13}
                  className={"transition-transform " + (descOpen ? "rotate-180" : "")}
                />
              </button>
              {descOpen &&
                (editingDesc ? (
                  <textarea
                    autoFocus
                    className="textarea min-h-[96px] resize-y text-sm"
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    onBlur={commitDesc}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                        (e.target as HTMLTextAreaElement).blur();
                      if (e.key === "Escape") {
                        setDescDraft(task.description ?? "");
                        setEditingDesc(false);
                      }
                    }}
                    placeholder="Add notes, context, or links…"
                    maxLength={2000}
                  />
                ) : (
                  <button
                    type="button"
                    className="w-full text-left rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap hover:bg-surface-alt transition-colors"
                    onClick={() => setEditingDesc(true)}
                    style={{
                      background: task.description
                        ? "color-mix(in srgb, var(--color-page) 70%, transparent)"
                        : undefined,
                      border: task.description
                        ? "1px solid var(--color-border-subtle)"
                        : "1px dashed var(--color-border-subtle)",
                      color: "var(--color-text)",
                    }}
                  >
                    {task.description ? (
                      renderHighlightedText(task.description)
                    ) : (
                      <span className="text-text-muted">Click to add notes or context…</span>
                    )}
                  </button>
                ))}
            </div>
          )}

          <div className="mt-3">
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold transition-colors text-text-strong"
              onClick={() => setSubtasksOpen((v) => !v)}
            >
              <GripVertical size={14} className="text-text-muted" />
              Subtasks
              {subs.length > 0 && (
                <span className="chip-subtle !py-0 !px-2 h-5">
                  {subs.filter((s) => s.completed).length}/{subs.length}
                </span>
              )}
              <ChevronDown
                size={14}
                className={
                  "ml-auto transition-transform text-text-muted " +
                  (subtasksOpen ? "rotate-180" : "")
                }
              />
            </button>
            {subtasksOpen && (
              <div className="mt-2 space-y-2">
                {subs.map((s) => (
                  <SubtaskRow
                    key={s.id}
                    sub={s}
                    onToggle={() => toggleSub(s)}
                    onDelete={() => deleteSub(s)}
                    groupId={groupId}
                    taskId={task.id}
                    highlightQuery={highlightQuery}
                  />
                ))}
                <div className="flex items-center gap-2">
                  <input
                    className="input-compact h-8 text-xs"
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSub();
                      }
                    }}
                    placeholder="Add a subtask…"
                    maxLength={200}
                  />
                  <button
                    onClick={addSub}
                    disabled={!newSub.trim()}
                    className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center disabled:opacity-40 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
                    aria-label="Add subtask"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hover Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 focus-within:opacity-100 transition-opacity">
          {/* AI Auto-split Magic Wand Button */}
          <button
            type="button"
            onClick={handleAiSplit}
            disabled={aiLoading || subs.length >= 5}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-alt disabled:opacity-30 transition-colors"
            title={
              subs.length >= 5
                ? "Remove some subtasks before generating more."
                : "AI: generate subtasks"
            }
          >
            {aiLoading ? (
              <span className="animate-spin text-xs">🌀</span>
            ) : (
              <Wand2 size={15} />
            )}
          </button>

          <div className="relative">
            <button
              aria-label="Task actions"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt"
              onClick={() => setShowMenu((v) => !v)}
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-2xl border z-40 p-1 bg-surface border-border-subtle"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setEditingTitle(true);
                  }}
                  className="w-full text-left px-3 py-1 text-xs rounded-lg hover:bg-surface-alt"
                >
                  Rename task
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setDescOpen(true);
                    setEditingDesc(true);
                  }}
                  className="w-full text-left px-3 py-1 text-xs rounded-lg hover:bg-surface-alt"
                >
                  Edit description
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    void deleteTask();
                  }}
                  className="w-full text-left px-3 py-1 text-xs rounded-lg"
                  style={{
                    color: "var(--color-danger)",
                  }}
                >
                  Move to Trash
                </button>
              </div>
            )}
          </div>

          <button
            aria-label="Delete task"
            onClick={deleteTask}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function SubtaskRow({
  sub,
  onToggle,
  onDelete,
  groupId,
  taskId,
  highlightQuery = "",
}: {
  sub: Subtask;
  onToggle: () => void;
  onDelete: () => void;
  groupId: string;
  taskId: string;
  highlightQuery?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(sub.title);
  const patchSubtask = useTasksStore((s) => s.patchSubtask);
  const toast = useToastStore((s) => s.toast);

  useEffect(() => setDraft(sub.title), [sub.id, sub.title]);

  async function commit() {
    const v = draft.trim();
    setEditing(false);
    if (!v || v === sub.title) {
      setDraft(sub.title);
      return;
    }
    try {
      patchSubtask(groupId, taskId, sub.id, { title: v });
      await tasksService.updateSubtask(sub.id, { title: v });
      setDraft(v);
    } catch (e) {
      patchSubtask(groupId, taskId, sub.id, { title: sub.title });
      setDraft(sub.title);
      toast({ kind: "error", message: (e as Error).message });
    }
  }

  function renderText(text: string) {
    if (!highlightQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${highlightQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightQuery.toLowerCase() ? (
        <mark key={i} className="mark">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 group/sub bg-surface-alt hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-surface-alt))]"
    >
      <button
        onClick={onToggle}
        className="h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center"
        style={{
          background: sub.completed ? "var(--color-primary)" : "transparent",
          borderColor: sub.completed ? "var(--color-primary)" : "var(--color-border)",
          color: "var(--color-primary-foreground)",
        }}
        aria-label={sub.completed ? "Mark subtask not done" : "Mark subtask done"}
      >
        {sub.completed && (
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
            <path
              d="M3.5 8.5l3 3 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraft(sub.title);
              setEditing(false);
            }
          }}
          className="flex-1 input-compact h-8 text-xs"
          maxLength={200}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={
            "flex-1 text-left text-sm truncate " +
            (sub.completed ? "line-through opacity-60" : "")
          }
          style={{ color: "var(--color-text)" }}
        >
          {renderText(sub.title)}
        </button>
      )}
      <button
        aria-label="Delete subtask"
        onClick={onDelete}
        className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center opacity-0 group-hover/sub:opacity-100 text-text-muted hover:text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] transition-opacity"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
