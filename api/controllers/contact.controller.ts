import type { Request, Response, NextFunction } from "express";
import { ContactService } from "../services/contact.service.js";

export const contactController = {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      await ContactService.sendMessage(req.body);
      res.status(200).json({
        success: true,
        message: "Your message has been sent. We'll get back to you soon.",
      });
    } catch (err) {
      next(err);
    }
  },
};
