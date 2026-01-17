// Re-export all error classes and middleware
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  RateLimitError,
} from './ApiError';

export { errorHandler } from './errorMiddleware';
