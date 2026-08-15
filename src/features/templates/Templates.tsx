import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layers3, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { templatesService, groupsService, tasksService, HttpError } from "../../services/api";
import { useTasksStore } from "../../stores/tasksStore";
import { useToastStore } from "../../stores/toastStore";
import { useAuthStore } from "../../stores/authStore";
import type { Group, Template } from "../../../shared/types";

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const groups = useTasksStore((s) => s.groups);
  const setGroups = useTasksStore((s) => s.setGroups);
  const setTasks = useTasksStore((s) => s.setTasks);
  const toast = useToastStore((s) => s.toast);
  const navigate = useNavigate();

  const [modal, setModal] = useState<{ template: Template; isChange: boolean } | null>(null);
  const [applyState, setApplyState] = useState({
    groupId: "",
    mainTaskName: "",
    submitting: false,
    groups: [] as Group[],
    loadingGroups: false,
  });

  const [searchParams] = useSearchParams();
  const highlightParam = searchParams.get("highlight");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await templatesService.list();
        if (cancelled) return;
        setTemplates(res.templates as unknown as Template[]);

        if (highlightParam) {
          setTimeout(() => {
            const el = document.getElementById(
              `tpl-card-${highlightParam.toLowerCase().replace(/\s+/g, "-")}`,
            );
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.classList.add("ring-4", "ring-primary", "animate-pulse");
              setTimeout(() => {
                el.classList.remove("ring-4", "ring-primary", "animate-pulse");
              }, 3000);
            }
          }, 200);
        }
      } catch {
        toast({ kind: "error", message: "Could not load templates." });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast, highlightParam]);


  async function openApply(tpl: Template) {
    if (!user) {
      navigate("/login", { state: { from: "/templates" } });
      return;
    }
    setApplyState({
      groupId: applyState.groupId,
      mainTaskName: tpl.mainTaskTitle,
      submitting: false,
      groups: applyState.groups,
      loadingGroups: true,
    });
    setModal({ template: tpl, isChange: false });
    try {
      // Ensure we have up-to-date groups
      if (groups.length === 0) {
        const res = await groupsService.list();
        setGroups(res.groups as unknown as Group[]);
        setApplyState((s) => ({
          ...s,
          groups: res.groups as unknown as Group[],
          groupId: s.groupId || res.groups[0]?.id || "",
          loadingGroups: false,
        }));
      } else {
        setApplyState((s) => ({
          ...s,
          groups: groups as unknown as Group[],
          groupId: s.groupId || groups[0]?.id || "",
          loadingGroups: false,
        }));
      }
    } catch {
      toast({ kind: "error", message: "Could not load your groups." });
      setApplyState((s) => ({ ...s, loadingGroups: false }));
    }
  }

  async function confirmApply() {
    if (!modal) return;
    if (!applyState.groupId) {
      toast({ kind: "info", message: "Create a group in the dashboard first, or pick one above." });
      return;
    }
    const name = applyState.mainTaskName.trim();
    if (!name) {
      toast({ kind: "info", message: "Please name the main task." });
      return;
    }
    setApplyState((s) => ({ ...s, submitting: true }));
    try {
      await templatesService.apply({
        templateId: modal.template.id,
        groupId: applyState.groupId,
        mainTaskName: name,
      });
      // Refresh dashboard tasks for this group
      try {
        const res = await tasksService.list(applyState.groupId);
        setTasks(applyState.groupId, res.tasks as never);
      } catch {
        /* ignore */
      }
      toast({
        kind: "success",
        message: `"${name}" added with ${modal.template.subtasks.length} subtasks.`,
      });
      setModal(null);
    } catch (e) {
      const h = e as HttpError;
      toast({
        kind: "error",
        message: h.message || "Could not apply this template.",
      });
    } finally {
      setApplyState((s) => ({ ...s, submitting: false }));
    }
  }

  return (
    <div>
      <section className="container pt-12 pb-12">
        <div className="chip inline-flex">
          <Layers3 size={14} />
          10 ready-made templates
        </div>
        <h1 className="mt-6 text-balance max-w-3xl">Task Templates</h1>
        <p className="mt-4 text-base text-text-muted max-w-2xl">
          Pick a template to use as a starting structure for a main task. One
          template per main task — if a task already has a template, you can change
          it instead.
        </p>
        {!user && (
          <div className="mt-6 card max-w-3xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 style={{ color: "var(--color-text-strong)" }}>
                  Sign in to apply templates
                </h3>
                <p className="mt-2 text-sm text-text-muted max-w-xl">
                  You can browse all 10 templates right here. To add one to one of
                  your groups, sign in (or create an account) first — it takes seconds.
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/login" className="btn-primary">
                  Sign in
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn-secondary">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="container pb-12">
        {loading ? (
          <div
            className="rounded-3xl border p-12 text-center"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border-subtle)",
            }}
          >
            <Loader2 className="animate-spin inline-block mb-3" size={22} />
            <div className="text-text-muted">Loading templates…</div>
          </div>
        ) : (
          <div
            className="grid gap-6 stagger"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            }}
          >
            {templates.map((t, i) => (
              <TemplateCard
                key={t.id}
                tpl={t}
                index={i}
                onApply={() => openApply(t)}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal
            ? `${modal.isChange ? "Change template" : "Use this template"} · ${modal.template.name}`
            : "Use template"
        }
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setModal(null)}
              disabled={applyState.submitting}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={confirmApply}
              disabled={applyState.submitting || applyState.loadingGroups}
            >
              {applyState.submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {modal?.isChange ? "Change" : "Apply"}
            </button>
          </>
        }
      >
        {modal && (
          <div className="space-y-6">
            <p className="text-sm text-text-muted">{modal.template.description}</p>
            <div>
              <label
                htmlFor="tpl-group"
                className="text-sm font-medium block mb-1"
                style={{ color: "var(--color-text-strong)" }}
              >
                Group to add it to
              </label>
              {applyState.loadingGroups ? (
                <div className="input flex items-center gap-2 text-text-muted">
                  <Loader2 size={16} className="animate-spin" />
                  Loading your groups…
                </div>
              ) : applyState.groups.length === 0 ? (
                <div
                  className="rounded-2xl p-4 border border-dashed text-sm"
                  style={{ borderColor: "var(--color-border-subtle)" }}
                >
                  <div className="text-text-muted">
                    You don't have any groups yet.{" "}
                    <Link
                      to="/dashboard"
                      className="font-semibold underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Create your first group in the dashboard
                    </Link>
                    , then come back here.
                  </div>
                </div>
              ) : (
                <select
                  id="tpl-group"
                  className="select"
                  value={applyState.groupId}
                  onChange={(e) =>
                    setApplyState((s) => ({ ...s, groupId: e.target.value }))
                  }
                >
                  {applyState.groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label
                htmlFor="tpl-name"
                className="text-sm font-medium block mb-1"
                style={{ color: "var(--color-text-strong)" }}
              >
                Main task name
              </label>
              <input
                id="tpl-name"
                className="input"
                value={applyState.mainTaskName}
                onChange={(e) =>
                  setApplyState((s) => ({ ...s, mainTaskName: e.target.value }))
                }
                maxLength={240}
              />
              <p className="mt-2 text-xs text-text-muted">
                This will be the name of the top-level task created in your group.
              </p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "var(--color-page)" }}>
              <div className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-3">
                Preview
              </div>
              <TemplatePreview tpl={modal.template} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TemplateCard({
  tpl,
  onApply,
  index,
}: {
  tpl: Template;
  onApply: () => void;
  index: number;
}) {
  const delay = (index % 6) * 50;
  const sortedSubs = [...tpl.subtasks].sort((a, b) => a.order - b.order);
  return (
    <article
      id={`tpl-card-${tpl.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="card card-hover flex flex-col fade-in-up transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 24%, transparent)",
          color: "var(--color-text-strong)",
        }}
      >
        <Layers3 size={22} />
      </div>
      <h3 className="mb-1" style={{ color: "var(--color-text-strong)" }}>
        {tpl.name}
      </h3>
      <p className="text-sm text-text-muted min-h-[3rem]">{tpl.description}</p>
      <div className="mt-4 mb-6 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded shrink-0 border-2"
            style={{
              borderColor: "var(--color-primary)",
            }}
          />
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-strong)" }}>
            {tpl.mainTaskTitle}
          </span>
        </div>
        <div className="pl-6 flex flex-wrap gap-1">
          {sortedSubs.slice(0, 3).map((s) => (
            <span key={s.order} className="chip-subtle">
              {s.title}
            </span>
          ))}
          {sortedSubs.length > 3 && (
            <span className="chip-subtle">+{sortedSubs.length - 3} more</span>
          )}
        </div>
      </div>
      <button className="btn-primary mt-auto justify-center w-full" onClick={onApply}>
        <ArrowRight size={16} />
        Use this template
      </button>
    </article>
  );
}

function TemplatePreview({ tpl }: { tpl: Template }) {
  const subs = [...tpl.subtasks].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-1">
      <div
        className="rounded-2xl border p-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded shrink-0 border-2"
            style={{ borderColor: "var(--color-border)" }}
          />
          <div className="text-sm font-semibold" style={{ color: "var(--color-text-strong)" }}>
            Main task name you chose
          </div>
        </div>
        {subs.length > 0 && (
          <div className="mt-3 pl-6 space-y-1">
            {subs.map((s) => (
              <div key={s.order} className="flex items-center gap-2 py-0.5">
                <span
                  className="h-3.5 w-3.5 rounded shrink-0 border"
                  style={{ borderColor: "var(--color-border)" }}
                />
                <span className="text-xs text-text">{s.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
