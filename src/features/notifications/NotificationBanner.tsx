import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { tasksService } from "../../services/api";

export function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const stored = localStorage.getItem("notifications-enabled");
    if (stored === null && Notification.permission === "default") {
      setShowBanner(true);
    } else if (stored === "true" && Notification.permission === "granted") {
      void checkAndScheduleNotifications();
    }
  }, []);

  async function checkAndScheduleNotifications() {
    try {
      const res = await tasksService.listUpcoming();
      if (!res.tasks || res.tasks.length === 0) return;

      const todayStr = new Date().toISOString().split("T")[0];
      const notifiedSet = new Set(
        JSON.parse(sessionStorage.getItem("notified-tasks") || "[]"),
      );

      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(9, 0, 0, 0); // 09:00 AM local time

      for (const t of res.tasks) {
        if (t.dueDate?.startsWith(todayStr) && !notifiedSet.has(t.id)) {
          const delay = Math.max(0, targetTime.getTime() - now.getTime());
          setTimeout(() => {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("SimplLife Reminder", {
                body: `Due today: ${t.title}`,
                icon: "/favicon.ico",
              });
              notifiedSet.add(t.id);
              sessionStorage.setItem(
                "notified-tasks",
                JSON.stringify(Array.from(notifiedSet)),
              );
            }
          }, delay);
        }
      }
    } catch {
      /* ignore error */
    }
  }

  async function handleEnable() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem("notifications-enabled", "true");
      setShowBanner(false);
      void checkAndScheduleNotifications();
    } else {
      localStorage.setItem("notifications-enabled", "false");
      setShowBanner(false);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div
      className="mb-6 rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in"
      style={{
        background: "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          <Bell size={18} />
        </div>
        <div className="text-sm">
          <span className="font-semibold" style={{ color: "var(--color-text-strong)" }}>
            Get reminded on task due dates.
          </span>{" "}
          <span className="text-text-muted">Never miss a deadline.</span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button onClick={handleEnable} className="btn-primary py-1.5 px-4 text-xs font-bold">
          Enable notifications
        </button>
        <button
          onClick={handleDismiss}
          className="btn-ghost py-1.5 px-3 text-xs text-text-muted hover:text-text-strong"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
