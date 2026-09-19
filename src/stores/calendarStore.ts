import { create } from "zustand";
import { calendarService } from "../services/api/index.js";
import type { CalendarEvent } from "../../shared/types.js";
import { toastStore } from "./toastStore.js";

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  initialized: boolean;
  fetchEvents: () => Promise<void>;
  createEvent: (params: Partial<CalendarEvent>) => Promise<CalendarEvent | undefined>;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  loading: false,
  initialized: false,

  fetchEvents: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const events = await calendarService.listEvents();
      set({ events, initialized: true, loading: false });
    } catch (err: any) {
      set({ loading: false });
      toastStore.getState().addToast({
        title: "Error fetching events",
        type: "error",
      });
    }
  },

  createEvent: async (params) => {
    try {
      const newEvent = await calendarService.createEvent(params);
      set((state) => ({ events: [...state.events, newEvent] }));
      return newEvent;
    } catch (err: any) {
      toastStore.getState().addToast({
        title: "Error creating event",
        type: "error",
      });
    }
  },

  updateEvent: async (id, patch) => {
    try {
      const updated = await calendarService.updateEvent(id, patch);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updated : e)),
      }));
    } catch (err: any) {
      toastStore.getState().addToast({
        title: "Error updating event",
        type: "error",
      });
    }
  },

  deleteEvent: async (id) => {
    try {
      await calendarService.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (err: any) {
      toastStore.getState().addToast({
        title: "Error deleting event",
        type: "error",
      });
    }
  },
}));
