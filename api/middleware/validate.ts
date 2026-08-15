import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/helpers.js";

export function validate(schema: ZodSchema, location: "body" | "params" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = location === "body" ? req.body : location === "params" ? req.params : req.query;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      next(new ApiError("Invalid input", 400, issues));
      return;
    }
    if (location === "body") {
      req.body = parsed.data;
    }
    next();
  };
}
