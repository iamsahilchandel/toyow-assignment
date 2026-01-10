import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../generated/prisma';
import { AuthorizationError } from '../utils/errors';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    const hasRole = allowedRoles.some((role) => req.user?.role === role);

    if (!hasRole) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);

export const requireOwnership = (
  resourceGetter: (req: Request) => Promise<{ createdById?: string } | null>
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthorizationError('User not authenticated'));
      }

      // Admins can access everything
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      const resource = await resourceGetter(req);

      if (!resource) {
        return next(new AuthorizationError('Resource not found'));
      }

      if (resource.createdById !== req.user.userId) {
        return next(new AuthorizationError('You do not have access to this resource'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
