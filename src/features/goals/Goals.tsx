import { useEffect, useState, useCallback } from "react";
import { Target, CheckCircle2, Circle, Trash2, Calendar, Award } from "lucide-react";
import { goalsService, aiApiService } from "@/services/api";
import type { Goal } from "../../../shared/types";
import { Button, Input, Card, Badge, Loader, EmptyState } from "@/components/ui";
import { useToastStore } from "@/stores/toastStore";
import { Brain, RefreshCw, X } from "lucide-react";

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("personal");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [goalAdvice, setGoalAdvice] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const toast = useToastStore((s) => s.toast);

  const loadGoals = useCallback(async () => {
    try {
      const res = await goalsService.list();
      setGoals(res.goals);
    } catch {
      toast({ kind: "error", message: "Failed to load goals" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await goalsService.create({
        title: title.trim(),
        description: description.trim() || null,
        targetDate: targetDate || null,
        category,
        milestones: milestones.filter((m) => m.trim() !== ""),
      });
      setGoals((prev) => [...prev, res.goal]);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setMilestones([]);
      toast({ kind: "success", message: "Goal created successfully!" });
    } catch {
      toast({ kind: "error", message: "Failed to create goal" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleMilestone(goalId: string, milestoneId: string) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    try {
      const res = await goalsService.update(goalId, { milestones: updatedMilestones });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? res.goal : g)));
    } catch {
      toast({ kind: "error", message: "Failed to update milestone status" });
    }
  }

  async function handleToggleGoalComplete(goalId: string, currentCompleted: boolean) {
    try {
      const res = await goalsService.update(goalId, { completed: !currentCompleted });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? res.goal : g)));
      toast({
        kind: "success",
        message: !currentCompleted ? "Goal achieved! Congratulations! 🌟" : "Goal active",
      });
    } catch {
      toast({ kind: "error", message: "Failed to update goal completion status" });
    }
  }

  async function handleDeleteGoal(goalId: string) {
    try {
      await goalsService.delete(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      toast({ kind: "success", message: "Goal deleted successfully" });
    } catch {
      toast({ kind: "error", message: "Failed to delete goal" });
    }
  }

  function addMilestoneDef() {
    if (!newMilestone.trim()) return;
    setMilestones((prev) => [...prev, newMilestone.trim()]);
    setNewMilestone("");
  }

  function removeMilestoneDef(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  const filteredGoals = goals.filter(
    (g) => selectedCategory === "all" || g.category === selectedCategory
  );

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="md">
            Productivity Goals
          </Badge>
          <h1 className="mt-3 text-h1 font-bold text-text-strong tracking-tight">Goals & Milestones</h1>
          <p className="mt-2 text-body text-text-muted">
            Track your short-term and long-term milestones. Break them down into manageable actions.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            setShowAdvice(true);
            setAdviceLoading(true);
            try {
              const res = await aiApiService.getGoalCoaching();
              setGoalAdvice(res.advice);
            } catch {
              setGoalAdvice("Unable to load goal coaching right now.");
            } finally {
              setAdviceLoading(false);
            }
          }}
          className="flex items-center gap-2"
        >
          <Brain size={16} className="text-primary" />
          AI Goal Coach
        </Button>
      </header>

      {/* AI Goal Coach Panel */}
      {showAdvice && (
        <div className="flex items-start gap-3 p-5 rounded-xl border border-primary/20 bg-primary/5">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-strong mb-2">AI Goal Coach</h3>
            {adviceLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <RefreshCw size={13} className="animate-spin" /> Analyzing your goals…
              </div>
            ) : (
              <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{goalAdvice}</p>
            )}
          </div>
          <button onClick={() => setShowAdvice(false)} className="text-text-muted hover:text-text p-1 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h2 className="text-h4 font-bold text-text-strong mb-6 flex items-center gap-2">
              <Target className="text-primary" size={20} />
              Set New Goal
            </h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Goal Title</label>
                <Input
                  required
                  placeholder="e.g. Launch SimplLife Beta"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Description</label>
                <textarea
                  className="w-full min-h-[80px] px-3.5 py-2.5 rounded-input border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200"
                  placeholder="Describe your motivation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Target Date</label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Category</label>
                  <select
                    className="w-full h-10 px-3.5 rounded-input border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                  </select>
                </div>
              </div>

              {/* Milestones Add Section */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">Milestones / Actions</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a step..."
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMilestoneDef();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addMilestoneDef}>
                    Add
                  </Button>
                </div>

                {milestones.length > 0 && (
                  <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {milestones.map((m, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm bg-surface-alt rounded-btn p-2 border border-border-subtle">
                        <span className="truncate pr-2">{m}</span>
                        <button
                          type="button"
                          onClick={() => removeMilestoneDef(idx)}
                          className="text-text-muted hover:text-danger p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full mt-4" disabled={submitting}>
                {submitting ? "Creating..." : "Save Goal"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Goals Display List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories Tab selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-subtle">
            {["all", "work", "personal", "health", "learning"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-text-muted hover:text-text hover:bg-surface-alt"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : filteredGoals.length === 0 ? (
            <EmptyState
              icon={<Target size={32} />}
              title="No goals found"
              description={
                selectedCategory === "all"
                  ? "Write down your target milestones and turn them into actionable habits."
                  : `You don't have any goals in the "${selectedCategory}" category yet.`
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`p-6 transition-all duration-200 relative flex flex-col justify-between border ${
                    goal.completed ? "border-success/20 bg-success/5" : "border-border hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant={goal.category === "work" ? "primary" : goal.category === "health" ? "success" : "info"}>
                        {goal.category}
                      </Badge>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-text-muted hover:text-danger p-1 rounded-md transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3
                      className={`text-lg font-bold text-text-strong cursor-pointer flex items-center gap-2 ${
                        goal.completed ? "line-through text-text-muted" : ""
                      }`}
                      onClick={() => handleToggleGoalComplete(goal.id, goal.completed)}
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="text-success shrink-0" size={18} />
                      ) : (
                        <Circle className="text-text-muted shrink-0 hover:text-success" size={18} />
                      )}
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="text-sm text-text-muted mt-2 leading-relaxed">{goal.description}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Milestones progress</span>
                        <span>
                          {goal.milestones.length > 0 
                            ? Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100) 
                            : (goal.completed ? 100 : 0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-alt border border-border-subtle overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ 
                            width: `${goal.milestones.length > 0 
                              ? Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100) 
                              : (goal.completed ? 100 : 0)}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    {goal.milestones.length > 0 && (
                      <div className="mt-6 space-y-2 border-t border-border-subtle pt-4">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Checklist Steps</span>
                        <div className="space-y-2">
                          {goal.milestones.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => handleToggleMilestone(goal.id, m.id)}
                              className="w-full flex items-center gap-2.5 text-left text-sm py-1 hover:bg-surface-alt rounded-md px-1.5 transition-colors"
                            >
                              {m.completed ? (
                                <CheckCircle2 className="text-success shrink-0" size={16} />
                              ) : (
                                <Circle className="text-text-muted shrink-0" size={16} />
                              )}
                              <span className={m.completed ? "line-through text-text-muted" : "text-text"}>
                                {m.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {goal.targetDate && (
                    <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                      {goal.completed && (
                        <span className="flex items-center gap-0.5 text-success font-bold uppercase tracking-wider">
                          <Award size={12} /> Achieved
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
