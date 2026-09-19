import type { Request, Response, NextFunction } from "express";
import { CalendarService } from "../services/calendar.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const calendarController = {
  async listEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await CalendarService.listEvents(req.userId!);
      res.status(200).json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  },

  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await CalendarService.createEvent(req.userId!, req.body);
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  },

  async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await CalendarService.updateEvent(req.userId!, req.params.id, req.body);
      res.status(200).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  },

  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await CalendarService.deleteEvent(req.userId!, req.params.id);
      res.status(200).json({ success: true, message: "Event deleted" });
    } catch (err) {
      next(err);
    }
  }
};
