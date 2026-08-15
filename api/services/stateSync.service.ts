import { exportImportRepository } from "../repositories/exportImport.repository.js";
import { ApiError } from "../utils/helpers.js";
import type { ExportData, PriorityLevel } from "../../shared/types.js";

interface SyncSubtask {
  id?: string;
  title?: string;
  name?: string;
  completed?: boolean;
  order?: number;
}

interface SyncTask {
  id?: string;
  title?: string;
  name?: string;
  description?: string | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
  due_date?: string | null;
  completed?: boolean;
  order?: number;
  subtasks?: SyncSubtask[];
}

interface SyncGroup {
  id?: string;
  name: string;
  order?: number;
  tasks?: SyncTask[];
}

export class StateSyncService {
  static async sync(
    userId: string,
    body: { groups?: SyncGroup[] },
  ): Promise<{
    groupsCount: number;
    tasksCount: number;
    subtasksCount: number;
  }> {
    const { groups } = body;
    if (!Array.isArray(groups)) {
      throw new ApiError("Invalid state snapshot payload", 400);
    }

    const snapshot: ExportData = {
      exported_at: new Date().toISOString(),
      user: { name: "", email: "" },
      groups: groups.map((g: SyncGroup) => ({
        name: g.name,
        position: g.order ?? 0,
        tasks: (g.tasks || []).map((t: SyncTask) => ({
          name: t.title || t.name || "",
          description: t.description ?? null,
          priority: t.priority || "none",
          due_date: t.dueDate || t.due_date || null,
          is_completed: !!t.completed,
          position: t.order ?? 0,
          subtasks: (t.subtasks || []).map((s: SyncSubtask) => ({
            name: s.title || s.name || "",
            is_completed: !!s.completed,
            position: s.order ?? 0,
          })),
        })),
      })),
    };

    return exportImportRepository.import(userId, snapshot);
  }
}
