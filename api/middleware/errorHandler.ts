import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(
  error: Error & { statusCode?: number; issues?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error("API error", error);
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    error: status >= 500 ? "Server internal error" : error.message || "Bad request",
    issues: (error.issues ?? undefined) as unknown,
  });
}
