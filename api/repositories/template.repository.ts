import { getDb } from "../db.js";
import type { Template } from "../../shared/types.js";

export const templateRepository = {
  async list(): Promise<Template[]> {
    const db = getDb();
    return db.listTemplates();
  },

  async getById(id: string): Promise<Template | null> {
    const db = getDb();
    return db.getTemplate(id);
  },
};
