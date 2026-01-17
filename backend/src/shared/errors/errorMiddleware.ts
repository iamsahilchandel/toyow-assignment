import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './ApiError';
import { logger } from '../logger/logger';

/**
 * Global error handler middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Generic error response
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
