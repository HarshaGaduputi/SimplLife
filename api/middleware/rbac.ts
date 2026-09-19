import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import type { Role } from '../../shared/types.js';

/**
 * RBAC Middleware to authorize users based on their role in a workspace context
 * Expects `req.params.workspaceId` or `req.body.workspaceId` to identify the workspace
 */
export function requireRole(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, error: 'Workspace functionality and RBAC is not yet implemented.' });
  };
}
