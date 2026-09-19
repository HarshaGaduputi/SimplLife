import { useEffect, useState } from "react";
import { BarChart2, CheckSquare, Clock, Flame, Calendar, Target, ShieldAlert } from "lucide-react";
import { analyticsService, aiApiService } from "@/services/api";
import { Card, Badge, Loader } from "@/components/ui";

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  // AI insights state variables
  const [habitAdvice, setHabitAdvice] = useState<string | null>(null);
  const [goalAdvice, setGoalAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await analyticsService.get();
        setMetrics(res);

        // Load AI Insights in parallel after other awaits succeed
        setAiLoading(true);
        const [habitRes, goalRes] = await Promise.allSettled([
          aiApiService.getHabitCoaching(),
          aiApiService.getGoalCoaching()
        ]);

        if (habitRes.status === "fulfilled" && habitRes.value?.success) {
          setHabitAdvice(habitRes.value.advice);
        } else {
          setHabitAdvice(null);
        }

        if (goalRes.status === "fulfilled" && goalRes.value?.success) {
          setGoalAdvice(goalRes.value.advice);
        } else {
          setGoalAdvice(null);
        }
      } catch (_e) {
        // Quiet fallback or mock if some route fails
      } finally {
        setLoading(false);
        setAiLoading(false);
      }
    }
    void loadData();
  }, []);

  const completedTasks = metrics?.completedTasks || 0;
  const completionRate = metrics?.completionRate || 0;
  const totalFocusMinutes = metrics?.totalFocusMinutes || 0;
  const completedGoals = metrics?.completedGoals || 0;
  const totalGoals = metrics?.totalGoals || 0;
  const activeHabitsCount = metrics?.activeHabitsCount || 0;
  const bestStreak = metrics?.bestStreak || 0;
  const completedTasksCountByDate = metrics?.completedTasksCountByDate || {};

  // Heatmap Grid for the last 28 days (oldest first, today is the last cell)
  const dates: Date[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }

  const heatmapDays = dates.map((d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const count = completedTasksCountByDate[dateStr] || 0;
    
    let level = 0;
    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count >= 3 && count <= 4) level = 3;
    else if (count >= 5) level = 4;

    const monthName = d.toLocaleDateString("en-US", { month: "long" });
    const dayNum = d.getDate();
    const tooltip = `${monthName} ${dayNum} — ${count} task${count === 1 ? "" : "s"} completed`;

    return { level, tooltip };
  });

  // Weekly bar chart calculation (Mon-Sun of the CURRENT week, browser's local timezone)
  const getMondayOfCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMondayOfCurrentWeek();
  const weeklyBars = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      label: labels[i],
      val: completedTasksCountByDate[dateStr] || 0
    };
  });

  const maxVal = Math.max(...weeklyBars.map(b => b.val));

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="md">
            Productivity Analytics
          </Badge>
          <h1 className="mt-3 text-h1 font-bold text-text-strong tracking-tight">Performance Analytics</h1>
          <p className="mt-2 text-body text-text-muted">
            Visualize your task completion velocity, focus hours, goals progress, and habit streaks.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dashboard Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CheckSquare size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Task Completion</span>
                <span className="text-2xl font-bold text-text-strong block mt-0.5">{completionRate}%</span>
                <span className="text-xs text-text-muted">{completedTasks} completed tasks</span>
              </div>
            </Card>

            <Card className="p-6 border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Focus Logged</span>
                <span className="text-2xl font-bold text-text-strong block mt-0.5">{totalFocusMinutes} min</span>
                <span className="text-xs text-text-muted">{focusSessions.length} work intervals</span>
              </div>
            </Card>

            <Card className="p-6 border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <Flame className="text-success" size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Top Habit Streak</span>
                <span className="text-2xl font-bold text-text-strong block mt-0.5">{bestStreak} days</span>
                <span className="text-xs text-text-muted">{activeHabitsCount} active habits</span>
              </div>
            </Card>

            <Card className="p-6 border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Target className="text-warning" size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Goal Milestones</span>
                <span className="text-2xl font-bold text-text-strong block mt-0.5">{completedGoals} / {goals.length}</span>
                <span className="text-xs text-text-muted">Goals achieved</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual HTML/CSS Chart Widget */}
            <Card className="lg:col-span-2 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
                  <BarChart2 className="text-primary" size={18} />
                  Completion Velocity (Weekly)
                </h3>
                <span className="text-xs text-text-muted">Tasks completed per day</span>
              </div>

              {/* Weekly bar chart */}
              <div className="h-64 flex items-end justify-between gap-4 pt-6 px-4">
                {weeklyBars.map((bar, idx) => {
                  const percent = maxVal > 0 ? (bar.val / maxVal) * 100 : 10; // fixed minimum height of 10% if max is 0
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="text-xs font-bold text-text-strong">{bar.val}</div>
                      <div
                        className="w-full bg-primary/20 hover:bg-primary border border-primary/30 rounded-t-lg transition-all duration-300"
                        style={{ height: `${percent}%` }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {maxVal === 0 && (
                <div className="text-center text-xs text-text-muted mt-4">
                  No tasks completed this week yet
                </div>
              )}
            </Card>

            {/* Heatmap Widget */}
            <Card className="lg:col-span-1 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h3 className="text-base font-bold text-text-strong flex items-center gap-2">
                  <Calendar className="text-success" size={18} />
                  Consistency Grid
                </h3>
                <span className="text-xs text-text-muted">Last 4 weeks</span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-2">
                {heatmapDays.map((day, idx) => {
                  const colors = [
                    "bg-surface border-border-subtle", // 0
                    "bg-primary/20 border-primary/20", // 1
                    "bg-primary/45 border-primary/30", // 2
                    "bg-primary/70 border-primary/50", // 3
                    "bg-primary border-primary", // 4
                  ];
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-md border ${colors[day.level]} transition-all duration-150 hover:scale-110`}
                      title={day.tooltip}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-text-muted pt-2 border-t border-border-subtle">
                <span>Less active</span>
                <div className="flex gap-1">
                  <span className="h-3 w-3 rounded bg-surface border border-border-subtle" />
                  <span className="h-3 w-3 rounded bg-primary/20 border border-primary/20" />
                  <span className="h-3 w-3 rounded bg-primary/50 border border-primary/35" />
                  <span className="h-3 w-3 rounded bg-primary border border-primary" />
                </div>
                <span>More active</span>
              </div>
            </Card>
          </div>

          {/* AI Productivity Coach Insights Card */}
          <Card className="p-6 border border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldAlert size={20} className="text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-strong">AI Productivity Coach</h3>
                <p className="text-xs text-text-muted">Personalized insights based on your task velocity, goal completions, and habit consistency.</p>
              </div>
            </div>
            <div className="border-t border-border-subtle pt-4 text-sm text-text leading-relaxed space-y-3">
              {aiLoading ? (
                <div className="py-6 flex items-center justify-center">
                  <Loader size="md" />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Habit Consistency Advice</span>
                    <p className="text-text-strong">
                      {habitAdvice || "AI insights unavailable right now — check back later."}
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-border-subtle">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Goal Achievement Coaching</span>
                    <p className="text-text-strong">
                      {goalAdvice || "AI insights unavailable right now — check back later."}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
export default AnalyticsPage;
