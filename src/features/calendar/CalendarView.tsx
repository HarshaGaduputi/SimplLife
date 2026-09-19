import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Clock, Flag } from "lucide-react";
import { groupsService, tasksService } from "../../services/api";
import { useTasksStore } from "../../stores/tasksStore";
import { useCalendarStore } from "../../stores/calendarStore";
import type { Group, Task } from "../../../shared/types";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const groups = useTasksStore((s) => s.groups);
  const setGroups = useTasksStore((s) => s.setGroups);

  // New States for interactive calendar
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("09:00");
  const [newEventType, setNewEventType] = useState<"event" | "task_deadline" | "schedule">("event");
  
  const { events: dbEvents, fetchEvents, createEvent, deleteEvent } = useCalendarStore();

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);



  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const gRes = await groupsService.list();
        setGroups(gRes.groups as Group[]);

        const allTasks: Task[] = [];
        for (const g of gRes.groups) {
          const tRes = await tasksService.list(g.id);
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

  const calendarEventsByDate: Record<string, any[]> = {};
  for (const e of dbEvents) {
    const key = e.date;
    if (!calendarEventsByDate[key]) calendarEventsByDate[key] = [];
    calendarEventsByDate[key].push(e);
  }

  const groupNameMap: Record<string, string> = {};
  for (const g of groups) groupNameMap[g.id] = g.name;

  const todayStr = new Date().toISOString().split("T")[0];

  function handleDayClick(dateStr: string) {
    setSelectedDay(dateStr);
    setNewEventTitle("");
    setNewEventTime("09:00");
    setNewEventType("event");
    setShowDayModal(true);
  }

  async function handleAddEvent() {
    if (!newEventTitle.trim() || !selectedDay) return;
    await createEvent({
      title: newEventTitle.trim(),
      date: selectedDay,
      startTime: newEventTime,
      type: newEventType,
    });
    setNewEventTitle("");
  }

  async function handleDeleteEvent(dateStr: string, eventId: string) {
    await deleteEvent(eventId);
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="chip">Calendar</div>
          <h1 className="mt-3 text-balance">
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
              className="h-10 w-10 rounded-lg border border-border-subtle text-text-strong flex items-center justify-center hover:bg-surface-alt transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="h-10 w-10 rounded-lg border border-border-subtle text-text-strong flex items-center justify-center hover:bg-surface-alt transition-colors"
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
        <div className="card overflow-x-auto">
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
              const dayEvents = calendarEventsByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr)}
                  className={`h-36 rounded-2xl border p-2 flex flex-col cursor-pointer transition-all overflow-hidden ${
                    isToday
                      ? "bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))] border-primary shadow-sm"
                      : "bg-surface border-border-subtle hover:border-primary/50 hover:bg-surface-alt"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <span
                      className={
                        "h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center " +
                        (isToday ? "bg-primary text-primary-foreground" : "text-text-strong")
                      }
                    >
                      {dayNum}
                    </span>
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar pb-1">
                    {/* Render Tasks */}
                    {dayTasks.map((t) => {
                      const prioColor =
                        t.priority === "high"
                          ? "var(--color-danger)"
                          : t.priority === "medium"
                            ? "var(--color-warning)"
                            : t.priority === "low"
                              ? "var(--color-success)"
                              : undefined;

                      return (
                        <div
                          key={t.id}
                          className={
                            "rounded-lg p-1 text-xs border border-border-subtle truncate flex items-center gap-1 bg-surface-alt " +
                            (t.completed ? "line-through opacity-50" : "")
                          }
                          style={{
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

                    {/* Render Custom Calendar Events */}
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-lg p-1 text-xs border border-border-subtle truncate flex items-center gap-1 bg-surface-alt"
                        title={`${ev.startTime || ''} - ${ev.title}`}
                      >
                        {ev.type === "task_deadline" ? (
                          <Flag size={12} className="text-[var(--color-warning)] shrink-0" />
                        ) : ev.type === "schedule" ? (
                          <Clock size={12} className="text-[var(--color-primary)] shrink-0" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shrink-0" />
                        )}
                        <span className="truncate flex-1 font-medium text-[var(--color-text-strong)]">{ev.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-0.5 flex-wrap shrink-0 mt-1">
                    {(dayTasks).slice(0, 2).map(t => (
                      <span key={t.id} className="h-1.5 w-1.5 rounded-full bg-warning" title={t.title} />
                    ))}
                    {dayEvents.map(ev => (
                      <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${ev.type === "task_deadline" ? "bg-danger" : ev.type === "schedule" ? "bg-primary" : "bg-info"}`} title={ev.title} />
                    ))}
                    {(dayTasks.length + dayEvents.length) > 4 && (
                      <span className="text-[9px] text-[var(--color-text-muted)]">+{((dayTasks.length + dayEvents.length) - 4)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-strong)]">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <button onClick={() => setShowDayModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={20} />
              </button>
            </div>

            {/* Existing tasks for this day */}
            {(tasksByDate[selectedDay] || []).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Tasks Due</p>
                {(tasksByDate[selectedDay] || []).map(t => (
                  <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-alt)] text-sm text-[var(--color-text-strong)]">
                    <Flag size={12} className="text-[var(--color-danger)] shrink-0" />
                    <span className={t.completed ? "line-through opacity-50" : ""}>{t.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar events for this day */}
            {(calendarEventsByDate[selectedDay] || []).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Scheduled</p>
                {(calendarEventsByDate[selectedDay] || []).map(ev => (
                  <div key={ev.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-alt)] text-sm">
                    <span className="text-[var(--color-text-muted)] w-12 shrink-0 text-xs">{ev.startTime}</span>
                    <span className={`flex-1 text-[var(--color-text-strong)] ${ev.type === "task_deadline" ? "text-[var(--color-danger)]" : ""}`}>{ev.title}</span>
                    {ev.type === "task_deadline" ? <Flag size={12} className="text-[var(--color-danger)]" /> : ev.type === "schedule" ? <Clock size={12} className="text-[var(--color-primary)]" /> : <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
                    <button onClick={() => handleDeleteEvent(selectedDay, ev.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new event */}
            <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Add to this day</p>
              <input
                type="text"
                placeholder="Event or deadline title..."
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddEvent()}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-strong)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newEventTime}
                  onChange={e => setNewEventTime(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-strong)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <select
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value as "event" | "task_deadline" | "schedule")}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-strong)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="event">Event</option>
                  <option value="task_deadline">Deadline</option>
                  <option value="schedule">Time Block</option>
                </select>
              </div>
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
