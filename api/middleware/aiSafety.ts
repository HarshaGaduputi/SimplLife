import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

const BLOCKED_PATTERNS = [
  /delete all/i,
  /drop table/i,
  /wipe data/i,
  /clear database/i,
];

/**
 * AI Safety Middleware
 * Runs after the route handler constructs an AI response.
 * Scans the response for unsafe patterns before forwarding to the client.
 */
export function aiSafety(req: Request, res: Response, next: NextFunction) {
  const original = res.json.bind(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).json = (body: any) => {
    if (body && typeof body === 'object') {
      const content = JSON.stringify(body);
      for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(content)) {
          return original({
            success: false,
            error: 'AI response blocked by safety filter',
            code: 'AI_SAFETY_BLOCK',
          });
        }
      }
    }
    return original(body);
  };
  next();
}

/**
 * Validates that request has a user context (for AI routes)
 */
export function requireAIAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  // Future: check AI quota / feature flag here
  next();
}
