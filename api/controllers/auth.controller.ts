import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import type { AuthRequest } from "../middleware/auth.js";
import { config } from "../config/index.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.cookie.sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.cookie("token", result.token, cookieOptions);
      res.status(201).json({ success: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.cookie("token", result.token, cookieOptions);
      res.status(200).json({ success: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  logout(_req: Request, res: Response) {
    res.clearCookie("token", cookieOptions);
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
      res.clearCookie("token", cookieOptions);
      res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
