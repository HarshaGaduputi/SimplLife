import { request } from "./client.js";
import type { CalendarEvent } from "../../../shared/types.js";

export const calendarService = {
  listEvents: async (): Promise<CalendarEvent[]> => {
    const res = await request<{ data: CalendarEvent[] }>("/calendar");
    return res.data;
  },
  createEvent: async (params: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const res = await request<{ data: CalendarEvent }>("/calendar", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data;
  },
  updateEvent: async (id: string, patch: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const res = await request<{ data: CalendarEvent }>(`/calendar/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return res.data;
  },
  deleteEvent: async (id: string): Promise<void> => {
    await request(`/calendar/${id}`, {
      method: "DELETE",
    });
  },
};
