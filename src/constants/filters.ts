import type { DueDateFilter, PriorityFilter, StatusFilter } from "../stores/filtersStore";
import type { PriorityLevel } from "../../shared/types";

export const PRIORITY_OPTIONS: Array<{ value: PriorityFilter; label: string; color: string }> = [
  { value: "all", label: "All priorities", color: "var(--color-text-muted)" },
  { value: "high", label: "High", color: "var(--color-danger)" },
  { value: "medium", label: "Medium", color: "var(--color-warning)" },
  { value: "low", label: "Low", color: "var(--color-success)" },
  { value: "none", label: "No priority", color: "var(--color-border)" },
];

export const PRIORITY_COLORS: Record<PriorityLevel | "none", string> = {
  high: "var(--color-danger)",
  medium: "var(--color-warning)",
  low: "var(--color-success)",
  none: "var(--color-border)",
};

export const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: "all", label: "All dates" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "upcoming", label: "Upcoming" },
];

export const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All tasks" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

/** Keyword → template name mapping for smart suggestions */
export const TEMPLATE_KEYWORD_MAP: Record<string, string> = {
  blog: "Blog Writing",
  write: "Blog Writing",
  article: "Blog Writing",
  plan: "Event Planning",
  party: "Event Planning",
  event: "Event Planning",
  study: "Study Session",
  exam: "Study Session",
  revision: "Study Session",
  bug: "Bug Fix",
  fix: "Bug Fix",
  issue: "Bug Fix",
  patch: "Bug Fix",
  shop: "Shopping Run",
  buy: "Shopping Run",
  grocery: "Shopping Run",
  client: "Client Task",
  meeting: "Client Task",
  call: "Client Task",
  health: "Health & Fitness",
  gym: "Health & Fitness",
  workout: "Health & Fitness",
  read: "Reading List",
  book: "Reading List",
  chapter: "Reading List",
  week: "Weekly Goals",
  goal: "Weekly Goals",
  target: "Weekly Goals",
  project: "Work Project",
  launch: "Work Project",
  deploy: "Work Project",
};
