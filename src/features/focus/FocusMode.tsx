import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Award, CheckCircle2, Circle } from "lucide-react";
import { focusService } from "@/services/api";
import { Button } from "@/components/ui";
import { useToastStore } from "@/stores/toastStore";
import { useTasksStore } from "@/stores/tasksStore";
import type { FocusSession } from "../../../shared/types";

const AMBIENT_SOUNDS = [
  { name: "Rain shower", url: "https://assets.mixkit.co/active_storage/sfx/2513/2513-84.wav" },
  { name: "Forest Birds", url: "https://assets.mixkit.co/active_storage/sfx/1190/1190-84.wav" },
  { name: "Ocean Waves", url: "https://assets.mixkit.co/active_storage/sfx/1188/1188-84.wav" },
];

export function FocusPage() {
  const [sessionType, setSessionType] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // work duration default 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedSoundIdx, setSelectedSoundIdx] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  const [history, setHistory] = useState<FocusSession[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none");

  const groups = useTasksStore((s) => s.groups);
  const tasksByGroup = useTasksStore((s) => s.tasksByGroup);
  
  // Flatten active tasks
  const allActiveTasks = groups.flatMap(g => (tasksByGroup[g.id] || []).filter(t => !t.completed));

  const loadHistory = useCallback(async () => {
    try {
      const res = await focusService.list();
      setHistory(res.sessions || []);
      setSessionsCount((res.sessions || []).filter(s => {
        const d = new Date(s.createdAt);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length);
    } catch {
      // quiet fail
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToastStore((s) => s.toast);

  // Setup sound player
  useEffect(() => {
    if (soundEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio(AMBIENT_SOUNDS[selectedSoundIdx].url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = AMBIENT_SOUNDS[selectedSoundIdx].url;
      }
      audioRef.current.play().catch(() => {
        setSoundEnabled(false);
        toast({ kind: "warning", message: "Interact with the page to play audio." });
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [soundEnabled, selectedSoundIdx, toast]);

  // Pomodoro config values
  const config = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  function switchSession(type: "work" | "shortBreak" | "longBreak") {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(config[type]);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (sessionType === "work") {
      setSessionsCount((prev) => prev + 1);
      toast({ kind: "success", message: "Pomodoro session complete! Take a break." });
      const task = allActiveTasks.find(t => t.id === selectedTaskId);
      try {
        await focusService.create({ duration: config.work / 60, taskTitle: task ? task.title : "Pomodoro Work Session" });
        await loadHistory();
      } catch {
        // quiet failure
      }
      switchSession("shortBreak");
    } else {
      toast({ kind: "info", message: "Break finished. Ready to get back to work?" });
      switchSession("work");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionType, toast, selectedTaskId, allActiveTasks, loadHistory]);

  // Timer Core logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            void handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleSessionComplete]);

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(config[sessionType]);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // Format MM:SS
  function formatTime(secs: number) {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  }

  const progressPercent = ((config[sessionType] - timeLeft) / config[sessionType]) * 100;

  return (
    <div
      className={`transition-all duration-300 flex flex-col items-center justify-center p-6 md:p-12 ${
        fullscreen
          ? "fixed inset-0 z-[1000] bg-background-strong text-white w-screen h-screen"
          : "min-h-[80vh] max-w-4xl mx-auto w-full"
      }`}
      style={
        fullscreen
          ? {
              background: "linear-gradient(135deg, var(--color-background), var(--color-surface))",
            }
          : undefined
      }
    >
      {/* Fullscreen Button */}
      <button
        onClick={() => setFullscreen(!fullscreen)}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-alt transition-colors"
        title="Toggle Fullscreen"
      >
        {fullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </button>

      <div className="text-center space-y-8 w-full max-w-md">
        {/* Mode Selectors */}
        <div className="flex items-center justify-center gap-2 bg-surface-alt border border-border-subtle p-1.5 rounded-full">
          {(["work", "shortBreak", "longBreak"] as const).map((type) => {
            const labels = { work: "Focus Session", shortBreak: "Short Break", longBreak: "Long Break" };
            return (
              <button
                key={type}
                onClick={() => switchSession(type)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                  sessionType === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>

        {/* Circular Visual Counter */}
        <div className="relative h-64 w-64 md:h-80 md:w-80 mx-auto flex items-center justify-center">
          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-border-subtle"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
          </svg>
          
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold font-sans tracking-tight tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs uppercase font-bold tracking-widest text-text-muted">
              {sessionType === "work" ? "Get things done" : "Rest & recharge"}
            </div>
          </div>
        </div>

        {/* Task Selection Dropdown */}
        {sessionType === "work" && !isRunning && timeLeft === config.work && (
          <div className="max-w-xs mx-auto">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">
              Focusing On
            </label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="none">Deep Work (No specific task)</option>
              {groups.map(g => {
                const groupTasks = (tasksByGroup[g.id] || []).filter(t => !t.completed);
                if (groupTasks.length === 0) return null;
                return (
                  <optgroup key={g.id} label={g.name}>
                    {groupTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        )}

        {/* Timer Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={resetTimer}
            className="w-14 h-14 rounded-full p-0 flex items-center justify-center shrink-0"
            title="Reset"
          >
            <RotateCcw size={20} />
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsRunning(!isRunning)}
            className="w-20 h-20 rounded-full p-0 flex items-center justify-center shadow-lg shrink-0"
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </Button>

          {/* Sound toggler */}
          <Button
            variant={soundEnabled ? "primary" : "secondary"}
            size="lg"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-14 h-14 rounded-full p-0 flex items-center justify-center shrink-0"
            title="Toggle Ambient Audio"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>

        {/* Sound Selection Menu */}
        {soundEnabled && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Ambient Sound Track</span>
            <div className="flex items-center justify-center gap-2">
              {AMBIENT_SOUNDS.map((s, idx) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedSoundIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                    selectedSoundIdx === idx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-subtle hover:bg-surface-alt text-text-muted"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Daily Progress indicator */}
        <div className="border-t border-border-subtle pt-6 flex flex-col items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <Award size={16} className="text-warning" />
            Today's Completed Pomodoros: <strong className="text-text-strong">{sessionsCount}</strong>
          </span>
          
          {/* History List */}
          {history.length > 0 && (
            <div className="w-full max-w-sm mt-4 text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Recent Sessions</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {history.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex flex-col bg-surface-alt rounded-lg p-2.5 border border-border-subtle text-xs">
                    <span className="font-semibold text-text-strong truncate">{s.taskTitle || "Deep Work"}</span>
                    <div className="flex justify-between text-text-muted mt-1">
                      <span>{s.duration} minutes</span>
                      <span>{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
