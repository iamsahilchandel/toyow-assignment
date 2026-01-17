import { RetryConfig } from '../engine.types';

/**
 * Calculate exponential backoff delay
 * Formula: backoffMs * (backoffMultiplier ^ (attemptNumber - 1))
 * Capped at 60 seconds
 */
export function calculateBackoff(attemptNumber: number, config: RetryConfig): number {
  const delay = config.backoffMs * Math.pow(config.backoffMultiplier, attemptNumber - 1);

  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);

  // Cap at 60 seconds
  return Math.min(Math.round(delay + jitter), 60000);
}

/**
 * Determine if an error should trigger a retry
 */
export function shouldRetry(error: any, attemptNumber: number, maxAttempts: number): boolean {
  if (attemptNumber >= maxAttempts) {
    return false;
  }

  return isRetryableError(error);
}

/**
 * Classify error as retryable or non-retryable
 */
function isRetryableError(error: any): boolean {
  // Non-retryable error patterns
  const nonRetryablePatterns = [
    /validation/i,
    /invalid/i,
    /unauthorized/i,
    /forbidden/i,
    /not found/i,
    /bad request/i,
    /missing required/i,
  ];

  const errorMessage = error?.message || String(error);

  for (const pattern of nonRetryablePatterns) {
    if (pattern.test(errorMessage)) {
      return false;
    }
  }

  // Check HTTP status codes if present
  if (error?.statusCode) {
    // 4xx errors are generally not retryable (except specific cases)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      // Retryable 4xx: rate limiting (429), request timeout (408)
      return error.statusCode === 429 || error.statusCode === 408;
    }

    // 5xx errors are retryable
    if (error.statusCode >= 500) {
      return true;
    }
  }

  // Retryable error patterns
  const retryablePatterns = [
    /timeout/i,
    /network/i,
    /econnrefused/i,
    /econnreset/i,
    /etimedout/i,
    /socket hang up/i,
    /temporary/i,
  ];

  for (const pattern of retryablePatterns) {
    if (pattern.test(errorMessage)) {
      return true;
    }
  }

  // Conservative default: don't retry unknown errors
  return false;
}

/**
 * Get next retry timestamp
 */
export function getNextRetryTime(attemptNumber: number, config: RetryConfig): Date {
  const delay = calculateBackoff(attemptNumber, config);
  return new Date(Date.now() + delay);
}
