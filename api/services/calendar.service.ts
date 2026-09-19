import { calendarRepository } from "../repositories/calendar.repository.js";
import { ApiError } from "../utils/helpers.js";
import type { CalendarEvent } from "../../shared/types.js";
import { getDb } from "../db.js";

export class CalendarService {
  static async listEvents(userId: string): Promise<CalendarEvent[]> {
    return calendarRepository.list(userId);
  }

  static async createEvent(userId: string, params: any): Promise<CalendarEvent> {
    if (!params.title || !params.date) {
      throw new ApiError("Title and date are required", 400);
    }
    const event = await calendarRepository.create(userId, params);
    const db = getDb();
    await db.logActivity({
      userId,
      action: "created",
      entityType: "event",
      entityName: event.title,
    });
    return event;
  }

  static async updateEvent(userId: string, id: string, patch: any): Promise<CalendarEvent> {
    const existing = await calendarRepository.get(id);
    if (!existing || existing.userId !== userId) {
      throw new ApiError("Event not found", 404);
    }
    const updated = await calendarRepository.update(userId, id, patch);
    if (!updated) {
      throw new ApiError("Failed to update event", 500);
    }
    return updated;
  }

  static async deleteEvent(userId: string, id: string): Promise<void> {
    const existing = await calendarRepository.get(id);
    if (!existing || existing.userId !== userId) {
      throw new ApiError("Event not found", 404);
    }
    await calendarRepository.delete(userId, id);
    const db = getDb();
    await db.logActivity({
      userId,
      action: "deleted",
      entityType: "event",
      entityName: existing.title,
    });
  }
}
