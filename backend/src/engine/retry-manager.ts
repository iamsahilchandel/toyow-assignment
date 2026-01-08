import crypto from 'crypto';

export class RetryManager {
  /**
   * Determine if an error should trigger a retry
   */
  shouldRetry(error: any, attemptNumber: number, maxAttempts: number): boolean {
    if (attemptNumber >= maxAttempts) {
      return false;
    }

    return this.isRetryableError(error);
  }

  /**
   * Classify error as retryable or non-retryable
   */
  private isRetryableError(error: any): boolean {
    // Non-retryable errors
    const nonRetryablePatterns = [
      /validation/i,
      /invalid/i,
      /unauthorized/i,
      /forbidden/i,
      /not found/i,
      /bad request/i,
    ];

    const errorMessage = error.message || String(error);

    for (const pattern of nonRetryablePatterns) {
      if (pattern.test(errorMessage)) {
        return false;
      }
    }

    // HTTP status codes
    if (error.statusCode) {
      // 4xx errors are generally not retryable (except specific cases)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        // Retryable 4xx: rate limiting, request timeout
        return error.statusCode === 429 || error.statusCode === 408;
      }

      // 5xx errors are retryable
      if (error.statusCode >= 500) {
        return true;
      }
    }

    // Default: timeout, network, and other transient errors are retryable
    const retryablePatterns = [/timeout/i, /network/i, /econnrefused/i, /econnreset/i, /etimedout/i];

    for (const pattern of retryablePatterns) {
      if (pattern.test(errorMessage)) {
        return true;
      }
    }

    // Conservative default: don't retry unknown errors
    return false;
  }

  /**
   * Calculate backoff delay using exponential backoff
   */
  calculateBackoff(
    attemptNumber: number,
    config: {
      backoffMs?: number;
      backoffMultiplier?: number;
    } = {}
  ): number {
    const baseDelay = config.backoffMs || 1000;
    const multiplier = config.backoffMultiplier || 2;

    // Exponential backoff: baseDelay * (multiplier ^ (attempt - 1))
    const delay = baseDelay * Math.pow(multiplier, attemptNumber - 1);

    // Add jitter (±20%) to prevent thundering herd
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);

    // Cap at 1 minute
    return Math.min(delay + jitter, 60000);
  }

  /**
   * Generate execution key for idempotency
   */
  generateExecutionKey(runId: string, nodeId: string, retryCount: number): string {
    const data = `${runId}:${nodeId}:${retryCount}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export const retryManager = new RetryManager();
