import { useEffect, useState, useCallback } from "react";
import { Trash2, RotateCcw, ChevronDown, AlertTriangle } from "lucide-react";
import { trashService } from "../../services/api";
import { useUIStore } from "../../stores/uiStore";
import { useToastStore } from "../../stores/toastStore";
import type { TrashData } from "../../../shared/types";

export function TrashPage() {
  const [trash, setTrash] = useState<TrashData>({ groups: [], tasks: [], subtasks: [] });
  const [loading, setLoading] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [confirmEmptyModal, setConfirmEmptyModal] = useState(false);

  const toast = useToastStore((s) => s.toast);
  const setTrashBadgeCount = useUIStore((s) => s.setTrashBadgeCount);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await trashService.list();
      setTrash({
        groups: res.groups || [],
        tasks: res.tasks || [],
        subtasks: res.subtasks || [],
      });
      const count =
        (res.groups?.length || 0) +
        (res.tasks?.length || 0) +
        (res.subtasks?.length || 0);
      setTrashBadgeCount(count);
    } catch {
      toast({ kind: "error", message: "Could not load trash items." });
    } finally {
      setLoading(false);
    }
  }, [toast, setTrashBadgeCount]);

  useEffect(() => {
    void loadTrash();
  }, [loadTrash]);


  async function handleRestore(type: "group" | "task" | "subtask", id: string) {
    try {
      await trashService.restore(type, id);
      toast({ kind: "success", message: "Item restored successfully." });
      await loadTrash();
    } catch {
      toast({ kind: "error", message: "Could not restore item." });
    }
  }

  async function handleDeletePermanent(type: "group" | "task" | "subtask", id: string) {
    const ok = window.confirm("Delete forever? This cannot be undone.");
    if (!ok) return;
    try {
      await trashService.deleteItem(type, id);
      toast({ kind: "info", message: "Item permanently deleted." });
      await loadTrash();
    } catch {
      toast({ kind: "error", message: "Could not delete item permanently." });
    }
  }

  async function handleEmptyTrash() {
    try {
      const res = await trashService.empty();
      toast({ kind: "success", message: res.message });
      setConfirmEmptyModal(false);
      await loadTrash();
    } catch {
      toast({ kind: "error", message: "Could not empty trash." });
    }
  }

  function formatRelativeDays(dateStr?: string | null) {
    if (!dateStr) return "recently";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Deleted today";
    if (days === 1) return "Deleted 1 day ago";
    return `Deleted ${days} days ago`;
  }

  const totalCount =
    trash.groups.length + trash.tasks.length + trash.subtasks.length;

  return (
    <div className="p-6 md:p-8 lg:p-12">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="chip">Recycle Bin</div>
          <h1 className="mt-3 text-balance">Recycle Bin</h1>
          <p className="mt-2 text-text-muted">
            Items are permanently deleted after 30 days.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={() => setConfirmEmptyModal(true)}
            className="btn-secondary h-11"
            style={{ color: "var(--color-danger)" }}
          >
            <Trash2 size={18} />
            Empty trash
          </button>
        )}
      </header>

      {loading ? (
        <div className="p-12 text-center text-text-muted animate-pulse">
          Loading Recycle Bin…
        </div>
      ) : totalCount === 0 ? (
        <div
          className="rounded-3xl border p-12 text-center max-w-xl mx-auto"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <div
            className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
              color: "var(--color-text-strong)",
            }}
          >
            <Trash2 size={26} />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: "var(--color-text-strong)" }}>
            Recycle bin is empty.
          </h3>
          <p className="mt-2 text-text-muted text-sm">
            Deleted groups, tasks, and subtasks will appear here for 30 days before being automatically removed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deleted Groups Section */}
          {trash.groups.length > 0 && (
            <section
              className="card overflow-hidden p-0"
            >
              <button
                type="button"
                onClick={() => setGroupsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-base text-text-strong"
              >
                <span>Deleted Groups ({trash.groups.length})</span>
                <ChevronDown
                  size={18}
                  className={"transition-transform " + (groupsOpen ? "rotate-180" : "")}
                />
              </button>
              {groupsOpen && (
                <div className="px-6 pb-6 space-y-2 border-t border-border-subtle">
                  {trash.groups.map((g) => (
                    <div
                      key={g.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-border-subtle bg-surface-alt"
                    >
                      <div>
                        <div className="font-semibold text-sm text-text-strong">
                          📁 {g.name}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatRelativeDays(g.deletedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore("group", g.id)}
                          className="btn-secondary h-8 px-3 text-xs"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button
                          onClick={() => handleDeletePermanent("group", g.id)}
                          className="h-8 rounded-lg px-3 text-xs font-medium hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
                          style={{ color: "var(--color-danger)" }}
                        >
                          Delete permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Deleted Tasks Section */}
          {trash.tasks.length > 0 && (
            <section
              className="card overflow-hidden p-0"
            >
              <button
                type="button"
                onClick={() => setTasksOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-base text-text-strong"
              >
                <span>Deleted Tasks ({trash.tasks.length})</span>
                <ChevronDown
                  size={18}
                  className={"transition-transform " + (tasksOpen ? "rotate-180" : "")}
                />
              </button>
              {tasksOpen && (
                <div className="px-6 pb-6 space-y-2 border-t border-border-subtle">
                  {trash.tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-border-subtle bg-surface-alt"
                    >
                      <div>
                        <div className="font-semibold text-sm text-text-strong">
                          {t.title}{" "}
                          <span className="text-xs text-text-muted font-normal">
                            (in {t.groupName})
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatRelativeDays(t.deletedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore("task", t.id)}
                          className="btn-secondary h-8 px-3 text-xs"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button
                          onClick={() => handleDeletePermanent("task", t.id)}
                          className="h-8 rounded-lg px-3 text-xs font-medium hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
                          style={{ color: "var(--color-danger)" }}
                        >
                          Delete permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Deleted Subtasks Section */}
          {trash.subtasks.length > 0 && (
            <section
              className="card overflow-hidden p-0"
            >
              <button
                type="button"
                onClick={() => setSubtasksOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-base text-text-strong"
              >
                <span>Deleted Subtasks ({trash.subtasks.length})</span>
                <ChevronDown
                  size={18}
                  className={"transition-transform " + (subtasksOpen ? "rotate-180" : "")}
                />
              </button>
              {subtasksOpen && (
                <div className="px-6 pb-6 space-y-2 border-t border-border-subtle">
                  {trash.subtasks.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-border-subtle bg-surface-alt"
                    >
                      <div>
                        <div className="font-semibold text-sm text-text-strong">
                          {s.title}{" "}
                          <span className="text-xs text-text-muted font-normal">
                            (under {s.taskTitle})
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatRelativeDays(s.deletedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore("subtask", s.id)}
                          className="btn-secondary h-8 px-3 text-xs"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button
                          onClick={() => handleDeletePermanent("subtask", s.id)}
                          className="h-8 rounded-lg px-3 text-xs font-medium hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
                          style={{ color: "var(--color-danger)" }}
                        >
                          Delete permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Empty Trash Danger Modal */}
      {confirmEmptyModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text-strong)_55%,transparent)] animate-fade-in">
          <div className="dialog w-full max-w-md overflow-hidden p-6 text-center">
            <div
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:
                  "color-mix(in srgb, var(--color-danger) 14%, transparent)",
                color: "var(--color-danger)",
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-strong)" }}>
              Permanently empty recycle bin?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              This will permanently delete all {totalCount} items in the trash. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmEmptyModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                className="btn-secondary"
                style={{ color: "var(--color-danger)" }}
              >
                Yes, empty trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
