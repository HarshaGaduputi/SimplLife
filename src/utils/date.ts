/** Date utility functions */

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, DATE_FORMAT_OPTIONS);
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, DATE_FORMAT_OPTIONS)} ${d.toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS)}`;
  } catch {
    return iso;
  }
}

export function datePart(iso: string): string {
  return iso.split("T")[0];
}

export type DueDateStatus = "overdue" | "today" | "future" | "none";

export function getDueDateStatus(dueDate: string | null | undefined): DueDateStatus {
  if (!dueDate) return "none";
  const due = datePart(dueDate);
  const today = todayStr();
  if (due < today) return "overdue";
  if (due === today) return "today";
  return "future";
}

export function getDueDateChipStyle(status: DueDateStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "overdue":
      return { bg: "rgba(223, 1, 57, 0.15)", text: "var(--color-danger)", border: "transparent" };
    case "today":
      return { bg: "rgba(245, 158, 11, 0.15)", text: "var(--color-warning)", border: "transparent" };
    case "future":
      return { bg: "rgba(99,102,241,0.1)", text: "var(--color-text-muted)", border: "var(--color-border-subtle)" };
    default:
      return { bg: "transparent", text: "var(--color-text-muted)", border: "var(--color-border-subtle)" };
  }
}

export function getDaysUntil(dueDate: string): number {
  const due = new Date(datePart(dueDate));
  const today = new Date(todayStr());
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  // Pad start
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  // Pad end to fill 6×7 grid
  while (days.length % 7 !== 0) {
    days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startPad + 1));
  }
  return days;
}
