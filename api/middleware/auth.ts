import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { getDb } from "../db.js";

const JWT_SECRET = (process.env.JWT_SECRET as string) || "tasknest-dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  userId?: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const user = await getDb().findUserById(payload.sub);
  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  req.userId = user.id;
  next();
}
