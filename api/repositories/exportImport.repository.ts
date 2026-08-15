import { getDb } from "../db.js";
import type { ExportData } from "../../shared/types.js";

export type ImportSummary = {
  groupsCount: number;
  tasksCount: number;
  subtasksCount: number;
};

export const exportImportRepository = {
  async export(userId: string): Promise<ExportData | null> {
    const db = getDb();
    return db.exportData(userId);
  },

  async import(userId: string, data: ExportData): Promise<ImportSummary> {
    const db = getDb();
    return db.importData(userId, data);
  },
};
