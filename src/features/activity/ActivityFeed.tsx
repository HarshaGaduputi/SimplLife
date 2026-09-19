import { useEffect, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { activityService } from "@/services/api";
import type { ActivityLog } from "../../../shared/types";
import { Card, Badge, Loader } from "@/components/ui";

export function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadActivityLogs();
  }, []);

  async function loadActivityLogs() {
    setLoading(true);
    try {
      const res = await activityService.list(50, 0);
      setLogs(res.logs);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.action.toLowerCase().includes(filter));

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8 max-w-4xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="md">Workspace Logs</Badge>
          <h1 className="mt-3 text-h1 font-bold text-text-strong tracking-tight">Real-time Activity Feed</h1>
          <p className="mt-2 text-body text-text-muted">
            Track all changes, tasks created, achievements logged, and team collaborations.
          </p>
        </div>
        <button
          onClick={loadActivityLogs}
          className="h-10 w-10 border border-border hover:border-primary/20 hover:bg-surface-alt rounded-input flex items-center justify-center transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-primary" : "text-text-muted"} />
        </button>
      </header>

      {/* Filter Options */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border-subtle shrink-0">
        {[
          { id: "all", label: "All Activity" },
          { id: "create", label: "Creations" },
          { id: "delete", label: "Deletions" },
          { id: "complete", label: "Completions" },
          { id: "update", label: "Edits" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
              filter === f.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-text-muted hover:text-text hover:bg-surface-alt"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader size="lg" /></div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-8 text-center text-text-muted italic text-sm">No activity logs found matching the filter.</Card>
      ) : (
        <div className="relative border-l border-border-subtle pl-6 space-y-6 ml-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Point on timeline */}
              <div className="absolute -left-[31px] top-0 h-6.5 w-6.5 rounded-full border-2 border-surface bg-surface-alt flex items-center justify-center group-hover:border-primary transition-colors">
                <Clock size={10} className="text-text-muted group-hover:text-primary" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-strong">User</span>
                  <span className="text-[10px] text-text-muted font-bold">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                  <Badge variant={getActionVariant(log.action)} size="sm">
                    {log.action}
                  </Badge>
                </div>
                <p className="text-sm text-text-strong font-medium">
                  {log.action} {log.entityType}: <span className="text-primary font-bold">"{log.entityName}"</span>
                </p>
                {log.detail && (
                  <p className="text-xs text-text-muted leading-relaxed bg-surface-alt/50 border border-border-subtle p-2 rounded-lg mt-1 max-w-2xl">
                    {log.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getActionVariant(action: string): "primary" | "success" | "warning" | "danger" | "info" {
  const act = action.toLowerCase();
  if (act.includes("create") || act.includes("add")) return "primary";
  if (act.includes("complete") || act.includes("finish")) return "success";
  if (act.includes("delete") || act.includes("remove")) return "danger";
  if (act.includes("update") || act.includes("rename")) return "warning";
  return "info";
}
