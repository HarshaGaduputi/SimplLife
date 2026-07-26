import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { api } from "../lib/api";
import { useTasksStore } from "../stores/uiStore";
import type { Task } from "../../shared/types";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const groups = useTasksStore((s) => s.groups);
  const setGroups = useTasksStore((s) => s.setGroups);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const gRes = await api.listGroups();
        setGroups(gRes.groups as any);

        const allTasks: Task[] = [];
        for (const g of gRes.groups) {
          const tRes = await api.listTasks(g.id);
          allTasks.push(...tRes.tasks);
        }
        setTasks(allTasks);
      } catch (e) {
        console.error("Calendar load error", e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [setGroups]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Group tasks by date string YYYY-MM-DD
  const tasksByDate: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (t.dueDate) {
      const key = t.dueDate.split("T")[0];
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(t);
    }
  }

  const groupNameMap: Record<string, string> = {};
  for (const g of groups) groupNameMap[g.id] = g.name;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="p-5 md:p-8 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="chip">Calendar</div>
          <h1 className="mt-3 text-3xl md:text-4xl text-balance">
            {monthNames[month]} {year}
          </h1>
          <p className="mt-2 text-text-muted">
            Overview of task due dates and deadlines across all groups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={goToday} className="btn-secondary h-10 px-4 text-xs font-semibold">
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="h-10 w-10 rounded-xl border flex items-center justify-center hover:bg-surface-alt"
              style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-strong)" }}
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="h-10 w-10 rounded-xl border flex items-center justify-center hover:bg-surface-alt"
              style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-strong)" }}
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="p-12 text-center text-text-muted animate-pulse">Loading calendar…</div>
      ) : (
        <div
          className="card p-4 md:p-6 overflow-x-auto shadow-sm"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold uppercase tracking-wider text-text-muted min-w-[700px]">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Monthly Grid */}
          <div className="grid grid-cols-7 gap-2 min-w-[700px]">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[110px] rounded-2xl border p-2 opacity-30"
                style={{
                  background: "var(--color-surface-alt)",
                  borderColor: "var(--color-border-subtle)",
                }}
              />
            ))}

            {/* Day slots */}
            {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
              const dayNum = dayIdx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                dayNum,
              ).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              const dayTasks = tasksByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  className="min-h-[110px] rounded-2xl border p-2 flex flex-col justify-between transition-colors"
                  style={{
                    background: isToday
                      ? "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))"
                      : "var(--color-surface)",
                    borderColor: isToday
                      ? "var(--color-primary)"
                      : "var(--color-border-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={
                        "h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center " +
                        (isToday ? "bg-primary text-primary-foreground" : "text-text-strong")
                      }
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold text-text-muted">
                        {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[100px] no-scrollbar">
                    {dayTasks.map((t) => {
                      const prioColor =
                        t.priority === "high"
                          ? "#EF4444"
                          : t.priority === "medium"
                            ? "#F59E0B"
                            : t.priority === "low"
                              ? "#10B981"
                              : undefined;

                      return (
                        <div
                          key={t.id}
                          className={
                            "rounded-lg p-1.5 text-xs border truncate flex items-center gap-1.5 " +
                            (t.completed ? "line-through opacity-50" : "")
                          }
                          style={{
                            background: "var(--color-surface-alt)",
                            borderColor: prioColor || "var(--color-border-subtle)",
                          }}
                          title={`${t.title} (${groupNameMap[t.groupId] || "Group"})`}
                        >
                          {prioColor && (
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ background: prioColor }}
                            />
                          )}
                          <span className="truncate flex-1 font-medium">{t.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
