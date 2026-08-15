import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import type { Role } from '../../shared/types.js';

/**
 * RBAC Middleware to authorize users based on their role in a workspace context
 * Expects `req.params.workspaceId` or `req.body.workspaceId` to identify the workspace
 */
export function requireRole(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
    if (!workspaceId) {
      res.status(400).json({ success: false, error: 'Workspace ID is required for role validation' });
      return;
    }

    // In a production app, fetch user membership role from database.
    // For our current simplified db/in-memory setup, we default to owner/admin access.
    const userRole: Role = 'owner'; // Default mock role for simplicity

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ success: false, error: 'Access denied: Insufficient permissions' });
      return;
    }

    next();
  };
}
