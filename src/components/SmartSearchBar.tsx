import { useEffect, useRef } from "react";
import { Search, X, Filter, Keyboard } from "lucide-react";
import {
  useUIStore,
  useTasksStore,
  type PriorityFilter,
  type DueDateFilter,
  type StatusFilter,
} from "../stores/uiStore";

export function SmartSearchBar() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const filterPriority = useUIStore((s) => s.filterPriority);
  const filterDueDate = useUIStore((s) => s.filterDueDate);
  const filterGroup = useUIStore((s) => s.filterGroup);
  const filterStatus = useUIStore((s) => s.filterStatus);

  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const setFilterPriority = useUIStore((s) => s.setFilterPriority);
  const setFilterDueDate = useUIStore((s) => s.setFilterDueDate);
  const setFilterGroup = useUIStore((s) => s.setFilterGroup);
  const setFilterStatus = useUIStore((s) => s.setFilterStatus);
  const resetFilters = useUIStore((s) => s.resetFilters);
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

  return (
    <div
      className="card mb-8 p-4 md:p-5 flex flex-col gap-4 shadow-sm"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            ref={searchInputRef}
            className="input pl-10 pr-16"
            placeholder="Search tasks, descriptions, subtasks… (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-strong"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 hover:bg-surface-alt transition-colors"
          style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-strong)" }}
          title="Keyboard shortcuts (?)"
        >
          <Keyboard size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-text-muted mr-1">
            <Filter size={13} /> Filters:
          </span>

          {/* Priority filter */}
          <select
            className="select text-xs py-1.5 px-3 rounded-full w-auto"
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
            className="select text-xs py-1.5 px-3 rounded-full w-auto"
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
            className="select text-xs py-1.5 px-3 rounded-full w-auto"
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
            className="select text-xs py-1.5 px-3 rounded-full w-auto"
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
            className="btn-ghost py-1 px-3 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-full"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
