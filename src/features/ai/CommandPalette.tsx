import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Hash, Target, Sparkles, Calendar, FileText,
  BookOpen, BarChart2, Settings, Zap, ArrowRight
} from "lucide-react";
import { useTasksStore } from "@/stores/tasksStore";
import { notesService, habitsService, tasksService } from "@/services/api";
import { Plus } from "lucide-react";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [searchableData, setSearchableData] = useState<{ id: string; type: string; title: string; action: () => void }[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const groups = useTasksStore(s => s.groups);
  const tasksByGroup = useTasksStore(s => s.tasksByGroup);
  const addTask = useTasksStore(s => s.addTask);

  const commands: Command[] = [
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      icon: <Hash size={16} />,
      action: () => { navigate("/"); onClose(); },
      keywords: ["tasks", "home", "groups"],
    },
    {
      id: "nav-goals",
      label: "Go to Goals",
      icon: <Target size={16} />,
      action: () => { navigate("/goals"); onClose(); },
      keywords: ["milestones", "objectives"],
    },
    {
      id: "nav-habits",
      label: "Go to Habits",
      icon: <Zap size={16} />,
      action: () => { navigate("/habits"); onClose(); },
      keywords: ["routine", "streak", "daily"],
    },
    {
      id: "nav-focus",
      label: "Go to Focus Mode",
      icon: <Sparkles size={16} />,
      action: () => { navigate("/focus"); onClose(); },
      keywords: ["pomodoro", "timer", "concentrate"],
    },
    {
      id: "nav-notes",
      label: "Go to Notes",
      icon: <FileText size={16} />,
      action: () => { navigate("/notes"); onClose(); },
      keywords: ["write", "documents", "ideas"],
    },
    {
      id: "nav-journal",
      label: "Go to Journal",
      icon: <BookOpen size={16} />,
      action: () => { navigate("/journal"); onClose(); },
      keywords: ["mood", "reflection", "diary"],
    },
    {
      id: "nav-calendar",
      label: "Go to Calendar",
      icon: <Calendar size={16} />,
      action: () => { navigate("/calendar"); onClose(); },
      keywords: ["schedule", "events", "dates"],
    },
    {
      id: "nav-analytics",
      label: "Go to Analytics",
      icon: <BarChart2 size={16} />,
      action: () => { navigate("/analytics"); onClose(); },
      keywords: ["stats", "reports", "insights"],
    },
    {
      id: "nav-ai-planner",
      label: "Open AI Planner",
      description: "Generate your optimized daily plan",
      icon: <Sparkles size={16} className="text-primary" />,
      action: () => { navigate("/ai/planner"); onClose(); },
      keywords: ["plan", "schedule", "ai", "generate"],
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      icon: <Settings size={16} />,
      action: () => { navigate("/settings"); onClose(); },
      keywords: ["preferences", "profile", "theme"],
    },
  ];

  const searchResults: Command[] = searchableData.map(item => ({
    id: item.id,
    label: `${item.type}: ${item.title}`,
    icon: item.type === "Task" ? <Target size={16} /> : item.type === "Note" ? <FileText size={16} /> : <Zap size={16} />,
    action: item.action,
    keywords: [item.type.toLowerCase(), item.title.toLowerCase()],
  }));

  const allItems = [...commands, ...searchResults];

  let filtered = query.trim()
    ? allItems.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase())),
      )
    : commands;

  // QUICK CAPTURE LOGIC
  // If the query is long enough, offer to create it as a task.
  if (query.trim().length > 2) {
    const defaultGroup = groups[0]?.id;
    if (defaultGroup) {
      const quickCaptureCommand: Command = {
        id: "quick-capture",
        label: `Create task: "${query.trim()}"`,
        description: "Quick capture to your first group",
        icon: <Plus size={16} className="text-success" />,
        action: async () => {
          try {
            await tasksService.create(defaultGroup, { title: query.trim() });
            const full = await tasksService.list(defaultGroup);
            useTasksStore.getState().setTasks(defaultGroup, full.tasks);
          } catch (e) {
            console.error(e);
          }
          onClose();
        },
      };
      // Prepend quick capture to the top of the filtered list
      filtered = [quickCaptureCommand, ...filtered];
    }
  }

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Load tasks
      const allTasks = groups.flatMap(g => (tasksByGroup[g.id] || []).filter(t => !t.completed).map(t => ({
        id: t.id,
        type: "Task",
        title: t.title,
        action: () => { navigate("/"); onClose(); }
      })));
      setSearchableData(allTasks);

      // Fetch notes & habits
      Promise.all([
        notesService.list().catch(() => ({ notes: [] })),
        habitsService.list().catch(() => ({ habits: [] }))
      ]).then(([notesRes, habitsRes]) => {
        const allNotes = (notesRes.notes || []).map(n => ({
          id: n.id,
          type: "Note",
          title: n.title,
          action: () => { navigate("/notes"); onClose(); }
        }));
        const allHabits = (habitsRes.habits || []).map(h => ({
          id: h.id,
          type: "Habit",
          title: h.title,
          action: () => { navigate("/habits"); onClose(); }
        }));
        setSearchableData(prev => [...prev, ...allNotes, ...allHabits]);
      });
    }
  }, [open, groups, tasksByGroup, navigate, onClose]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && filtered[selected]) { filtered[selected].action(); }
    if (e.key === "Escape") onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-24 px-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Palette box */}
      <div className="relative pointer-events-auto w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-text placeholder-text-muted focus:outline-none text-sm"
            placeholder="Type a command or search…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <kbd className="text-[10px] font-bold text-text-muted bg-surface-alt border border-border px-1.5 py-0.5 rounded shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-muted text-sm">No commands found.</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                  i === selected ? "bg-primary/10 text-primary" : "text-text hover:bg-surface-alt"
                }`}
                onClick={cmd.action}
                onMouseEnter={() => setSelected(i)}
              >
                <span className={`shrink-0 ${i === selected ? "text-primary" : "text-text-muted"}`}>{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{cmd.label}</div>
                  {cmd.description && <div className="text-xs text-text-muted truncate">{cmd.description}</div>}
                </div>
                {i === selected && <ArrowRight size={14} className="text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-text-muted">
          <span><kbd className="font-bold">↑↓</kbd> navigate</span>
          <span><kbd className="font-bold">Enter</kbd> select</span>
          <span><kbd className="font-bold">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
