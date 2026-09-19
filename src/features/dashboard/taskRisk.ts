import { Task } from "@/../../shared/types";

export type RiskLevel = "low" | "medium" | "high" | "none";

export interface TaskRisk {
  level: RiskLevel;
  reason?: string;
}

export function calculateTaskRisk(task: Task): TaskRisk {
  if (task.completed) {
    return { level: "none" };
  }

  const now = new Date();
  let reason = "";
  let level: RiskLevel = "none";

  // Check deadline
  if (task.dueDate) {
    const due = new Date(task.dueDate);
    const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      return { level: "high", reason: "Overdue" };
    } else if (hoursLeft < 24) {
      level = "high";
      reason = "Due within 24h";
    } else if (hoursLeft < 72) {
      level = "medium";
      reason = "Due soon";
    } else {
      level = "low";
      reason = "On track";
    }
  }

  // Check subtasks complexity vs time left
  // Note: we'd need subtasks populated on the Task object.
  if ((task as any).subtasks && (task as any).subtasks.length > 0 && task.dueDate) {
    const uncompletedSubtasks = (task as any).subtasks.filter((s: any) => !s.completed).length;
    const due = new Date(task.dueDate);
    const daysLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysLeft > 0 && uncompletedSubtasks / daysLeft > 3) {
      return { level: "high", reason: "Too many subtasks for remaining time" };
    }
  }

  if (level === "none") {
    // If no deadline, check if it's been sitting around
    if ((task as any).createdAt) {
      const created = new Date((task as any).createdAt);
      const daysOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld > 14) {
        return { level: "medium", reason: "Stale task" };
      }
    }
    return { level: "low", reason: "Flexible" };
  }

  return { level, reason };
}
