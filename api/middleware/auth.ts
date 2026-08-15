import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repository.js";
import { config } from "../config/index.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwt.secret as jwt.Secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
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
  let token = req.cookies?.token;
  if (!token) {
    const header = req.headers.authorization || "";
    const [scheme, hdrToken] = header.split(" ");
    if (scheme === "Bearer" && hdrToken) {
      token = hdrToken;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const user = await userRepository.findById(payload.sub);
  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  req.userId = user.id;
  next();
}
