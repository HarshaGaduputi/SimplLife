import { useEffect, useRef } from "react";
import { Search, X, Keyboard, Mic } from "lucide-react";
import { useState } from "react";
import { useToastStore } from "@/stores/toastStore";
import {
  useFiltersStore,
  type PriorityFilter,
  type DueDateFilter,
  type StatusFilter,
} from "../../stores/filtersStore";
import { useTasksStore } from "../../stores/tasksStore";
import { useUIStore } from "../../stores/uiStore";


export function SmartSearchBar() {
  const searchQuery = useFiltersStore((s) => s.searchQuery);
  const filterPriority = useFiltersStore((s) => s.filterPriority);
  const filterDueDate = useFiltersStore((s) => s.filterDueDate);
  const filterGroup = useFiltersStore((s) => s.filterGroup);
  const filterStatus = useFiltersStore((s) => s.filterStatus);

  const setSearchQuery = useFiltersStore((s) => s.setSearchQuery);
  const setFilterPriority = useFiltersStore((s) => s.setFilterPriority);
  const setFilterDueDate = useFiltersStore((s) => s.setFilterDueDate);
  const setFilterGroup = useFiltersStore((s) => s.setFilterGroup);
  const setFilterStatus = useFiltersStore((s) => s.setFilterStatus);
  const resetFilters = useFiltersStore((s) => s.resetFilters);
  const setShortcutsModalOpen = useUIStore((s) => s.setShortcutsModalOpen);

  const groups = useTasksStore((s) => s.groups);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filterPriority !== "all" ||
    filterDueDate !== "all" ||
    filterGroup !== "all" ||
    filterStatus !== "all";

  // Cmd+K shortcut listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "?" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setShortcutsModalOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        const btn = document.getElementById("btn-create-group");
        if (btn) btn.click();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setShortcutsModalOpen]);

  const [listening, setListening] = useState(false);
  const toast = useToastStore((s) => s.toast);

  function toggleSpeech() {
    interface SpeechRecognitionCtor {
      new (): SpeechRecognitionInstance;
    }
    interface SpeechRecognitionInstance {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: (() => void) | null;
      onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start(): void;
    }
    type SpeechWindow = Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ kind: "warning", message: "Web Speech API is not supported in this browser." });
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      toast({ kind: "info", message: "Listening to your voice search query…" });
    };

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      toast({ kind: "success", message: `Voice search: "${speechToText}"` });
    };

    recognition.onerror = () => {
      toast({ kind: "error", message: "Speech recognition error occurred." });
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }

  return (
    <div
      className="mb-8 bg-panel border-b border-border"
    >
      <div className="px-6 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 h-12 rounded-lg border bg-surface px-3 ${listening ? "border-primary ring-2 ring-primary/20 animate-pulse" : "border-border-subtle"}`}>
              <Search size={18} className="shrink-0 text-text-muted" />
              <input
                ref={searchInputRef}
                className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-text-muted"
                placeholder={listening ? "Speak now…" : "Search tasks, descriptions, subtasks… (⌘K)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={toggleSpeech}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${listening ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-text-muted hover:text-text-strong hover:bg-surface-alt"}`}
                title="Voice dictation search"
              >
                <Mic size={16} />
              </button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="h-10 w-10 rounded-lg flex items-center justify-center border border-border-subtle shrink-0 text-text-strong hover:bg-surface-alt transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">

          {/* Priority filter */}
          <select
            className="select-underline w-auto"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as PriorityFilter)}
          >
            <option value="all">Priority: All</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
            <option value="none">⚪ No Priority</option>
          </select>

          {/* Due date filter */}
          <select
            className="select-underline w-auto"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value as DueDateFilter)}
          >
            <option value="all">Due Date: All</option>
            <option value="overdue">⚠️ Overdue</option>
            <option value="today">📅 Due Today</option>
            <option value="upcoming">⏳ Upcoming</option>
          </select>

          {/* Group filter */}
          <select
            className="select-underline w-auto"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="all">Group: All</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                📁 {g.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="select-underline w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
          </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-8 rounded-lg px-3 text-xs font-medium hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
              style={{ color: "var(--color-danger)" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
