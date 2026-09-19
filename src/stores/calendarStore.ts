import { create } from "zustand";
import { calendarService } from "../services/api/index.js";
import type { CalendarEvent } from "../../shared/types.js";
import { useToastStore } from "./toastStore";

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
      useToastStore.getState().toast({
        message: "Error fetching events",
        kind: "error",
      });
    }
  },

  createEvent: async (params) => {
    try {
      const newEvent = await calendarService.createEvent(params);
      set((state) => ({ events: [...state.events, newEvent] }));
      return newEvent;
    } catch (err: any) {
      useToastStore.getState().toast({
        message: "Error creating event",
        kind: "error",
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
      useToastStore.getState().toast({
        message: "Error updating event",
        kind: "error",
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
      useToastStore.getState().toast({
        message: "Error deleting event",
        kind: "error",
      });
    }
  },
}));
