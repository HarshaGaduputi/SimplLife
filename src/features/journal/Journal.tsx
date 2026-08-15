import { useEffect, useState, useCallback } from "react";
import { BookOpen, Smile, Frown, Meh, Save, Calendar, Download } from "lucide-react";
import { journalService } from "@/services/api";
import type { JournalEntry } from "../../../shared/types";
import { Button, Card, Badge, Loader } from "@/components/ui";
import { useToastStore } from "@/stores/toastStore";

const MOODS = [
  { val: "great", label: "Great", icon: Smile, color: "text-success bg-success/10 border-success" },
  { val: "good", label: "Good", icon: Smile, color: "text-primary bg-primary/10 border-primary" },
  { val: "okay", label: "Okay", icon: Meh, color: "text-info bg-info/10 border-info" },
  { val: "bad", label: "Bad", icon: Frown, color: "text-warning bg-warning/10 border-warning" },
  { val: "terrible", label: "Terrible", icon: Frown, color: "text-danger bg-danger/10 border-danger" },
] as const;

const REFLECTION_PROMPTS = [
  "What was the most challenging part of today, and how did you handle it?",
  "What is one thing you learned today?",
  "Who is someone you are grateful for today, and why?",
  "What did you do today that brought you closer to your goals?",
  "What made you smile today?",
  "How did you practice self-care today?",
  "What would you do differently if you could relive today?",
  "What is a small win you can celebrate today?",
  "What was the best conversation you had today?",
  "How did you step out of your comfort zone today?"
];

const getPromptForDate = (dateStr: string) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  return REFLECTION_PROMPTS[Math.abs(hash) % REFLECTION_PROMPTS.length];
};

export function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState<"great" | "good" | "okay" | "bad" | "terrible">("good");
  const [gratitude, setGratitude] = useState("");
  const [reflection, setReflection] = useState("");
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToastStore((s) => s.toast);

  const loadAllEntries = useCallback(async () => {
    try {
      const res = await journalService.list();
      setEntries(res.journalEntries);
    } catch {
      // quiet fail
    }
  }, []);

  const loadEntryForDate = useCallback(async (dateStr: string) => {
    setLoadingEntry(true);
    try {
      const res = await journalService.get(dateStr);
      if (res.entry) {
        setMood(res.entry.mood);
        setGratitude(res.entry.gratitude);
        setReflection(res.entry.reflection);
      } else {
        // Reset inputs
        setMood("good");
        setGratitude("");
        setReflection("");
      }
    } catch {
      toast({ kind: "error", message: "Failed to load journal entry" });
    } finally {
      setLoadingEntry(false);
    }
  }, [toast]);

  // Load entry whenever selectedDate changes
  useEffect(() => {
    void loadEntryForDate(selectedDate);
    void loadAllEntries();
  }, [selectedDate, loadEntryForDate, loadAllEntries]);

  async function handleSaveJournal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const _res = await journalService.save({
        date: selectedDate,
        mood,
        gratitude,
        reflection,
      });
      toast({ kind: "success", message: "Journal entry logged successfully!" });
      loadAllEntries();
    } catch {
      toast({ kind: "error", message: "Failed to log journal entry" });
    } finally {
      setSaving(false);
    }
  }

  function handleExportJournal() {
    if (entries.length === 0) {
      toast({ kind: "warning", message: "No entries to export" });
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `simpllife-journal-backup.json`);
    dlAnchor.click();
    toast({ kind: "success", message: "Journal exported successfully!" });
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="md">
            Reflection Suite
          </Badge>
          <h1 className="mt-3 text-h1 font-bold text-text-strong tracking-tight">Daily Journal</h1>
          <p className="mt-2 text-body text-text-muted">
            Pause, reflect, and write down what you are grateful for. Track your mood fluctuations over time.
          </p>
        </div>

        <Button variant="secondary" onClick={handleExportJournal} leftIcon={<Download size={16} />}>
          Export Journal
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side Selector & History summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-h4 font-bold text-text-strong mb-4 flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              Select Date
            </h2>
            <input
              type="date"
              className="w-full h-10 px-3.5 rounded-input border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Reflection Log</h3>
            {entries.length === 0 ? (
              <p className="text-xs text-text-muted italic">Your entries will be listed here.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {entries.map((ent) => {
                  const entryMood = MOODS.find((m) => m.val === ent.mood);
                  const MoodIcon = entryMood?.icon || Smile;
                  return (
                    <button
                      key={ent.id}
                      onClick={() => setSelectedDate(ent.date)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-200 ${
                        selectedDate === ent.date
                          ? "border-primary bg-primary/5 font-bold"
                          : "border-border-subtle hover:bg-surface-alt"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs text-text-strong block font-bold">{ent.date}</span>
                        <span className="text-xs text-text-muted truncate block">{ent.reflection || "Reflected"}</span>
                      </div>
                      <div className={`p-1.5 rounded-full shrink-0 ${entryMood?.color}`}>
                        <MoodIcon size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side Input Forms */}
        <div className="md:col-span-2">
          <Card className="p-6">
            {loadingEntry ? (
              <div className="py-24 flex items-center justify-center">
                <Loader size="lg" />
              </div>
            ) : (
              <form onSubmit={handleSaveJournal} className="space-y-6">
                <h2 className="text-h4 font-bold text-text-strong flex items-center gap-2 border-b border-border-subtle pb-4">
                  <BookOpen className="text-primary" size={22} />
                  Journal Entry for {selectedDate}
                </h2>

                {/* Mood Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">How are you feeling?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((m) => {
                      const MoodIcon = m.icon;
                      const isSelected = mood === m.val;
                      return (
                        <button
                          key={m.val}
                          type="button"
                          onClick={() => setMood(m.val)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? `${m.color} border-2 font-bold shadow-md`
                              : "border-border hover:bg-surface-alt text-text-muted"
                          }`}
                        >
                          <MoodIcon size={24} />
                          <span className="text-[10px] mt-1 uppercase tracking-wider font-bold">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gratitude Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">Three things you're grateful for today:</label>
                  <textarea
                    className="w-full min-h-[80px] p-3 rounded-input border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200"
                    placeholder="1. My health, 2. Completing my goals, 3. Nice sunny weather..."
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                  />
                </div>

                {/* Reflection Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">General reflections / notes on today:</label>
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm italic text-text-strong mb-2 flex items-start gap-2">
                    <BookOpen size={16} className="text-primary shrink-0 mt-0.5" />
                    <p><strong>Daily Prompt:</strong> {getPromptForDate(selectedDate)}</p>
                  </div>
                  <textarea
                    className="w-full min-h-[140px] p-3 rounded-input border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200"
                    placeholder="What did you learn today? What could go better tomorrow?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-border-subtle flex justify-end">
                  <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save size={16} />}>
                    {saving ? "Saving Entry..." : "Save Entry"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
