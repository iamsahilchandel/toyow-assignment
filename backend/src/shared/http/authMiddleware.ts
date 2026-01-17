import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../errors/ApiError';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens
 * Attaches user information to the request object
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Import dynamically to avoid circular dependency
    const { authService } = await import('../../modules/auth/auth.service');
    const payload = authService.verifyToken(token);

    // Attach user to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
