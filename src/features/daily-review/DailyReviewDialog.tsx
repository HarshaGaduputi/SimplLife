import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Play, Sparkles, X } from "lucide-react";
import { useTasksStore } from "@/stores/tasksStore";

interface DailyReviewDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DailyReviewDialog({ open, onClose }: DailyReviewDialogProps) {
  const groups = useTasksStore(s => s.groups);
  const tasksByGroup = useTasksStore(s => s.tasksByGroup);
  
  const [completedToday, setCompletedToday] = useState(0);
  const [carriedOver, setCarriedOver] = useState(0);
  const [upcoming, setUpcoming] = useState(0);

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split("T")[0];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().split("T")[0];

      let completed = 0;
      let carried = 0;
      let next = 0;

      groups.forEach(g => {
        const tasks = tasksByGroup[g.id] || [];
        tasks.forEach(t => {
          if (t.completed && t.completedAt?.startsWith(today)) {
            completed++;
          }
          if (!t.completed && t.dueDate && t.dueDate < today) {
            carried++;
          }
          if (!t.completed && t.dueDate === tomorrow) {
            next++;
          }
        });
      });

      setCompletedToday(completed);
      setCarriedOver(carried);
      setUpcoming(next);
    }
  }, [open, groups, tasksByGroup]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-dialog)] shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-[var(--color-primary)]" size={24} />
                Daily Review
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Here's how you did today.</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={32} className="text-[var(--color-success)] mb-2" />
              <div className="text-3xl font-bold text-[var(--color-success)]">{completedToday}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-success)] mt-1">Completed</div>
            </div>

            <div className="bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <AlertTriangle size={32} className="text-[var(--color-danger)] mb-2" />
              <div className="text-3xl font-bold text-[var(--color-danger)]">{carriedOver}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-danger)] mt-1">Carried Over</div>
            </div>
          </div>

          <div className="bg-[var(--color-surface-alt)] p-4 rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center rounded-lg shrink-0">
                <Play size={20} />
              </div>
              <div>
                <div className="font-bold text-[var(--color-text-strong)]">{upcoming} tasks due tomorrow</div>
                <div className="text-xs text-[var(--color-text-muted)]">Get some rest, tomorrow is a new day.</div>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full h-11 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-foreground)] font-bold rounded-[var(--radius-btn)] transition-colors shadow-sm">
            Close & Rest
          </button>
        </div>
      </div>
    </div>
  );
}
