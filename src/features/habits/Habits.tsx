import { useEffect, useState, useCallback } from "react";
import { Sparkles, Trash2, Calendar, Flame, Check, Brain, X, RefreshCw } from "lucide-react";
import { habitsService, aiApiService } from "@/services/api";
import type { Habit } from "../../../shared/types";
import { Button, Input, Card, Badge, Loader, EmptyState } from "@/components/ui";
import { useToastStore } from "@/stores/toastStore";

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [submitting, setSubmitting] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const toast = useToastStore((s) => s.toast);

  const last30Days = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    return d.toISOString().split("T")[0];
  }).reverse();

  const calculateStreak = (history: Record<string, boolean>) => {
    let streak = 0;
    const d = new Date();
    // Check today first
    let currentStr = d.toISOString().split("T")[0];
    if (history[currentStr]) {
      streak++;
    } else {
      // If today is not checked, check if yesterday was. 
      // If yesterday wasn't, streak is 0. If it was, we start counting from yesterday.
      d.setDate(d.getDate() - 1);
      currentStr = d.toISOString().split("T")[0];
      if (!history[currentStr]) return 0;
      streak++;
      d.setDate(d.getDate() + 1); // reset to today to start loop properly
    }

    // Go backwards from yesterday
    d.setDate(d.getDate() - 1);
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      if (history[dateStr]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const loadHabits = useCallback(async () => {
    try {
      const res = await habitsService.list();
      setHabits(res.habits);
    } catch {
      toast({ kind: "error", message: "Failed to load habits" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void loadHabits(); }, [loadHabits]);

  async function handleCreateHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await habitsService.create({ title: title.trim(), frequency });
      setHabits((prev) => [...prev, res.habit]);
      setTitle("");
      toast({ kind: "success", message: "Habit tracking initialized!" });
    } catch {
      toast({ kind: "error", message: "Failed to create habit" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleHabit(habitId: string, date: string) {
    try {
      const res = await habitsService.toggle(habitId, date);
      setHabits((prev) => prev.map((h) => (h.id === habitId ? res.habit : h)));
    } catch {
      toast({ kind: "error", message: "Failed to log habit" });
    }
  }

  async function handleDeleteHabit(habitId: string) {
    try {
      await habitsService.delete(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      toast({ kind: "success", message: "Habit removed" });
    } catch {
      toast({ kind: "error", message: "Failed to remove habit" });
    }
  }

  async function loadHabitCoaching() {
    setAdviceLoading(true);
    setShowAdvice(true);
    try {
      const res = await aiApiService.getHabitCoaching();
      setAdvice(res.advice);
    } catch {
      setAdvice("Unable to load coaching tips right now. Try again.");
    } finally {
      setAdviceLoading(false);
    }
  }

  function formatDateHeader(dateStr: string) {
    const d = new Date(dateStr);
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), num: d.getDate() };
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="success" size="md">Consistency Engine</Badge>
          <h1 className="mt-3 text-h1 font-bold text-text-strong tracking-tight">Habit Tracker</h1>
          <p className="mt-2 text-body text-text-muted">
            Build good routines by logging your habits daily. Maintain streak multiplier stats.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={loadHabitCoaching}
          className="flex items-center gap-2"
        >
          <Brain size={16} className="text-primary" />
          AI Habit Coach
        </Button>
      </header>

      {/* AI Coaching Panel */}
      {showAdvice && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text-strong mb-2">AI Habit Coach</h3>
                {adviceLoading ? (
                  <div className="flex items-center gap-2 text-text-muted text-sm">
                    <RefreshCw size={14} className="animate-spin" />
                    Analyzing your habits…
                  </div>
                ) : (
                  <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{advice}</p>
                )}
              </div>
            </div>
            <button onClick={() => setShowAdvice(false)} className="text-text-muted hover:text-text p-1 shrink-0">
              <X size={16} />
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h2 className="text-h4 font-bold text-text-strong mb-6 flex items-center gap-2">
              <Sparkles className="text-success" size={20} />
              Build a New Habit
            </h2>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Habit Name</label>
                <Input
                  required
                  placeholder="e.g. Meditate daily, Read 10 pages"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekly", "monthly"] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`h-10 text-xs font-bold uppercase tracking-wider rounded-input border transition-all duration-200 ${
                        frequency === freq
                          ? "bg-success/15 border-success text-success"
                          : "border-border hover:bg-surface-alt text-text-muted"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full mt-4" disabled={submitting}>
                {submitting ? "Initializing..." : "Start Habit Tracker"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="py-12 flex items-center justify-center"><Loader size="lg" /></div>
          ) : habits.length === 0 ? (
            <EmptyState
              icon={<Calendar size={32} />}
              title="No habits logged yet"
              description="Establish consistent systems. Add a daily or weekly habit routine on the left."
            />
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const today = new Date().toISOString().split("T")[0];
                return (
                  <Card key={habit.id} className="p-6 hover:shadow-md transition-all duration-200 border border-border">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-text-strong">{habit.title}</h3>
                          <Badge variant="subtle" size="sm">{habit.frequency}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                          <Flame className="text-warning shrink-0" size={14} />
                          <span>Current Streak: </span>
                          <span className="text-text-strong font-bold">{calculateStreak(habit.history)} day{calculateStreak(habit.history) !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-text-muted hover:text-danger p-1.5 rounded-md transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-4 border-t border-border-subtle pt-4">
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                          Last 30 Days
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {last30Days.map((dStr) => {
                            const isChecked = !!habit.history[dStr];
                            const isToday = dStr === today;
                            const titleStr = `${dStr}${isChecked ? ' (Completed)' : ''}`;
                            return (
                              <button
                                key={dStr}
                                title={titleStr}
                                onClick={() => handleToggleHabit(habit.id, dStr)}
                                className={`w-4 h-4 rounded-sm transition-all duration-200 border ${
                                  isChecked
                                    ? "bg-[var(--color-success)] border-[var(--color-success)] shadow-sm hover:opacity-80"
                                    : isToday
                                    ? "bg-surface-alt border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-opacity-20"
                                    : "bg-surface border-border-subtle hover:border-[var(--color-success)] hover:bg-[var(--color-success)] hover:bg-opacity-20"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
