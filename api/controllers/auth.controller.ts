import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import type { AuthRequest } from "../middleware/auth.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.cookie("token", result.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(201).json({ success: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.cookie("token", result.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.status(200).json({ success: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out" });
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.userId!);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateMe(req.userId!, req.body);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  async deleteMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await AuthService.deleteMe(req.userId!);
      res.clearCookie("token");
      res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
