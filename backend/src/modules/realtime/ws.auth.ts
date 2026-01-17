import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';

/**
 * WebSocket authentication
 */
export interface WSAuthPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authenticate WebSocket connection using JWT from query string
 */
export function authenticateWS(token?: string): WSAuthPayload | null {
  if (!token) {
    logger.warn('WS authentication failed: No token provided');
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    logger.warn('WS authentication failed: Invalid token');
    return null;
  }
}

/**
 * Extract token from URL query string
 */
export function extractTokenFromUrl(url: string): string | undefined {
  try {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('token') || undefined;
  } catch {
    return undefined;
  }
}
