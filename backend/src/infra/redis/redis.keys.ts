/**
 * Redis key patterns for consistent key naming
 */
export const REDIS_KEYS = {
  // API Proxy cache keys
  apiProxy: {
    cache: (method: string, url: string, headersHash: string) =>
      `apiproxy:${method}:${url}:${headersHash}`,
  },

  // Run state keys
  run: {
    state: (runId: string) => `run:${runId}:state`,
    lock: (runId: string) => `run:${runId}:lock`,
  },

  // Step execution keys
  step: {
    lock: (runId: string, nodeId: string) => `step:${runId}:${nodeId}:lock`,
    result: (runId: string, nodeId: string) => `step:${runId}:${nodeId}:result`,
  },

  // Idempotency keys
  idempotency: {
    checksum: (checksum: string) => `idem:${checksum}`,
  },

  // Rate limiting keys
  rateLimit: {
    user: (userId: string) => `ratelimit:user:${userId}`,
    ip: (ip: string) => `ratelimit:ip:${ip}`,
  },
} as const;

/**
 * Default TTL values (in seconds)
 */
export const REDIS_TTL = {
  apiProxyCache: 60, // 1 minute
  runState: 3600, // 1 hour
  stepLock: 300, // 5 minutes
  idempotency: 86400, // 24 hours
  rateLimit: 60, // 1 minute
} as const;
