import { getDb } from "../db.js";
import type { CalendarEvent } from "../../shared/types.js";

export const calendarRepository = {
  async list(userId: string): Promise<CalendarEvent[]> {
    const db = getDb();
    return db.listCalendarEvents(userId);
  },

  async get(id: string): Promise<CalendarEvent | null> {
    const db = getDb();
    return db.getCalendarEvent(id);
  },

  async create(userId: string, params: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const db = getDb();
    return db.createCalendarEvent(userId, params);
  },

  async update(userId: string, id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const db = getDb();
    return db.updateCalendarEvent(userId, id, patch);
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const db = getDb();
    return db.deleteCalendarEvent(userId, id);
  }
};
