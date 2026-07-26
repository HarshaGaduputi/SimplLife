import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Download,
  Upload,
  AlertTriangle,
  Mail,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  Pencil,
  Flag,
  Calendar,
  AlignLeft,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { api, HttpError } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import type { ActivityLog, ExportData } from "../../shared/types";

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const toast = useUIStore((s) => s.toast);

  const [exporting, setExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const [digestEnabled, setDigestEnabled] = useState(
    user?.digestEmailsEnabled !== false,
  );
  const [updatingDigest, setUpdatingDigest] = useState(false);

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityOffset, setActivityOffset] = useState(0);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unsubscribe URL parameter handling
  useEffect(() => {
    if (searchParams.get("unsubscribe") === "1") {
      void (async () => {
        try {
          const res = await api.patchUser({ digestEmailsEnabled: false });
          setUser(res.user);
          setDigestEnabled(false);
          toast({
            kind: "info",
            message: "You've been unsubscribed from daily digest emails.",
          });
        } catch {
          /* ignore */
        }
      })();
    }
  }, [searchParams, setUser, toast]);

  useEffect(() => {
    if (user) setDigestEnabled(user.digestEmailsEnabled !== false);
  }, [user]);

  // Load activity logs
  useEffect(() => {
    async function loadLogs() {
      setLoadingActivity(true);
      try {
        const res = await api.listActivity(50, 0);
        setActivities(res.logs || []);
        if ((res.logs || []).length < 50) setHasMoreActivity(false);
      } catch {
        /* ignore */
      } finally {
        setLoadingActivity(false);
      }
    }
    void loadLogs();
  }, []);

  async function loadMoreActivity() {
    const nextOffset = activityOffset + 50;
    try {
      const res = await api.listActivity(50, nextOffset);
      if (res.logs.length > 0) {
        setActivities((prev) => [...prev, ...res.logs]);
        setActivityOffset(nextOffset);
        if (res.logs.length < 50) setHasMoreActivity(false);
      } else {
        setHasMoreActivity(false);
      }
    } catch {
      toast({ kind: "error", message: "Could not load more activity." });
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const todayStr = new Date().toISOString().split("T")[0];

      const a = document.createElement("a");
      a.href = url;
      a.download = `tasknest-export-${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ kind: "success", message: "Data exported successfully." });
    } catch (e) {
      toast({
        kind: "error",
        message: e instanceof Error ? e.message : "Export failed.",
      });
    } finally {
      setExporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }

  async function handleConfirmImport() {
    if (!selectedFile) return;
    setImporting(true);
    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text) as ExportData;

      const res = await api.importData(parsed);
      toast({
        kind: "success",
        message: `Import successful — ${res.summary.groups} groups, ${res.summary.tasks} tasks loaded.`,
      });
      setImportModalOpen(false);
      navigate("/dashboard");
    } catch (e) {
      toast({
        kind: "error",
        message:
          e instanceof HttpError
            ? e.message
            : "Invalid JSON file format. Could not import.",
      });
    } finally {
      setImporting(false);
    }
  }

  async function handleToggleDigest() {
    const next = !digestEnabled;
    setUpdatingDigest(true);
    try {
      const res = await api.patchUser({ digestEmailsEnabled: next });
      setUser(res.user);
      setDigestEnabled(next);
      toast({
        kind: "info",
        message: next
          ? "Daily digest emails enabled."
          : "Daily digest emails disabled.",
      });
    } catch {
      toast({ kind: "error", message: "Could not update settings." });
    } finally {
      setUpdatingDigest(false);
    }
  }

  function getActivityIcon(action: string) {
    switch (action) {
      case "created":
        return <PlusCircle size={16} className="text-emerald-500" />;
      case "completed":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "uncompleted":
        return <XCircle size={16} className="text-amber-500" />;
      case "deleted":
        return <Trash2 size={16} className="text-red-500" />;
      case "restored":
        return <RotateCcw size={16} className="text-blue-500" />;
      case "renamed":
        return <Pencil size={16} className="text-amber-500" />;
      case "priority_changed":
        return <Flag size={16} className="text-purple-500" />;
      case "due_date_set":
      case "due_date_cleared":
        return <Calendar size={16} className="text-sky-500" />;
      case "description_added":
      case "description_edited":
        return <AlignLeft size={16} className="text-indigo-500" />;
      case "template_applied":
        return <LayoutGrid size={16} className="text-primary" />;
      case "ai_split":
        return <Sparkles size={16} className="text-purple-500" />;
      default:
        return <PlusCircle size={16} className="text-primary" />;
    }
  }

  function formatTimeAgo(dateStr: string) {
    const ms = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  return (
    <div className="p-5 md:p-8 lg:p-10 max-w-4xl">
      <header className="mb-8">
        <div className="chip">Settings</div>
        <h1 className="mt-3 text-3xl md:text-4xl">App Settings</h1>
        <p className="mt-2 text-text-muted">
          Manage your backups, notification preferences, and view your activity history.
        </p>
      </header>

      <div className="space-y-8">
        {/* Section 1: Data & Backup */}
        <section
          className="card shadow-sm p-6 md:p-8"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-strong)" }}>
            Data & Backup
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Export all your groups, tasks, and subtasks into a portable JSON backup file, or restore from a previous file.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Export Box */}
            <div
              className="p-5 rounded-2xl border flex flex-col justify-between"
              style={{
                background: "var(--color-surface-alt)",
                borderColor: "var(--color-border-subtle)",
              }}
            >
              <div>
                <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-text-strong)" }}>
                  Export Data
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Download a complete copy of all your SimplLife data as a JSON file.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-primary w-full py-2.5 text-xs font-semibold"
              >
                {exporting ? (
                  <span className="animate-spin text-xs">🌀</span>
                ) : (
                  <Download size={16} />
                )}
                Export my data
              </button>
            </div>

            {/* Import Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-alt transition-colors"
              style={{ borderColor: "var(--color-border)" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={24} className="text-primary mb-2" />
              <div className="text-xs font-semibold" style={{ color: "var(--color-text-strong)" }}>
                {selectedFile ? selectedFile.name : "Drop your SimplLife JSON file here, or click to browse"}
              </div>
              <div className="text-[11px] text-text-muted mt-1">.json files only</div>

              {selectedFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportModalOpen(true);
                  }}
                  className="btn-primary mt-4 py-1.5 px-4 text-xs"
                >
                  Confirm import
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Preferences & Digest Emails */}
        <section
          className="card shadow-sm p-6 md:p-8"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-strong)" }}>
            Preferences & Notifications
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Configure how SimplLife interacts with you and sends reminders.
          </p>

          <div
            className="flex items-center justify-between p-4 rounded-2xl border"
            style={{
              background: "var(--color-surface-alt)",
              borderColor: "var(--color-border-subtle)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                  color: "var(--color-text-strong)",
                }}
              >
                <Mail size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--color-text-strong)" }}>
                  Daily digest emails
                </div>
                <div className="text-xs text-text-muted">
                  Receive a morning email summary of your pending tasks and deadlines.
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleDigest}
              disabled={updatingDigest}
              className={
                "h-6 w-11 rounded-full p-0.5 transition-colors duration-200 focus:outline-none " +
                (digestEnabled ? "bg-primary" : "bg-gray-400")
              }
            >
              <div
                className={
                  "h-5 w-5 rounded-full bg-white transition-transform duration-200 " +
                  (digestEnabled ? "translate-x-5" : "translate-x-0")
                }
              />
            </button>
          </div>
        </section>

        {/* Section 3: Activity Log */}
        <section
          className="card shadow-sm p-6 md:p-8"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-strong)" }}>
            Activity Log
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Timeline of recent changes and actions in your workspace.
          </p>

          {loadingActivity ? (
            <div className="p-8 text-center text-text-muted animate-pulse">Loading activity log…</div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm border rounded-2xl border-dashed">
              No activity recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border"
                  style={{
                    background: "var(--color-surface-alt)",
                    borderColor: "var(--color-border-subtle)",
                  }}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-surface shrink-0">
                    {getActivityIcon(act.action)}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-semibold" style={{ color: "var(--color-text-strong)" }}>
                      {act.entityType.toUpperCase()}: "{act.entityName}"
                    </span>{" "}
                    <span className="text-text-muted">
                      {act.action} {act.detail ? `(${act.detail})` : ""}
                    </span>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      {formatTimeAgo(act.createdAt)}
                    </div>
                  </div>
                </div>
              ))}

              {hasMoreActivity && (
                <div className="pt-4 text-center">
                  <button
                    onClick={loadMoreActivity}
                    className="btn-secondary py-2 px-6 text-xs font-semibold"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Import Warning Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden p-6 text-center"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="mx-auto h-14 w-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-strong)" }}>
              Replace all current tasks?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              This will replace ALL your current tasks and groups with the imported data. This cannot be undone. Are you sure?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setImportModalOpen(false)}
                className="btn-secondary py-2.5 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white py-2.5 px-4"
              >
                {importing ? "Importing…" : "Yes, replace my data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
