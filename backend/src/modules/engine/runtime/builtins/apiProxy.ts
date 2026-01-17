import { StepContext } from '../../engine.types';
import { getRedisClient, REDIS_KEYS, REDIS_TTL } from '../../../../infra/redis';
import { validateUrl } from '../../../../shared/utils';
import { sha256 } from '../../../../shared/crypto';

/**
 * API_PROXY Built-in Plugin
 *
 * Features:
 * - HTTP requests to external APIs
 * - Response caching with Redis
 * - SSRF protection
 */
export async function executeApiProxy(
  context: StepContext
): Promise<{ success: boolean; output?: Record<string, any>; error?: string }> {
  const { config, input } = context;
  const url = (config.url || input.url) as string;
  const method = ((config.method || input.method || 'GET') as string).toUpperCase();
  const headers = (config.headers || input.headers || {}) as Record<string, string>;
  const body = config.body || input.body;
  const cacheTtl = (config.cacheTtl as number) || REDIS_TTL.apiProxyCache;
  const enableCache = config.cache !== false;

  try {
    // SSRF protection - validate URL
    validateUrl(url);

    // Check cache for GET requests
    if (enableCache && method === 'GET') {
      const cacheKey = generateCacheKey(method, url, headers);
      const cachedResponse = await getCachedResponse(cacheKey);

      if (cachedResponse) {
        return {
          success: true,
          output: {
            ...cachedResponse,
            cached: true,
          },
        };
      }
    }

    // Make HTTP request
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      cached: false,
    };

    // Cache successful GET responses
    if (enableCache && method === 'GET' && response.ok) {
      const cacheKey = generateCacheKey(method, url, headers);
      await setCachedResponse(cacheKey, result, cacheTtl);
    }

    // Determine success based on status code
    if (response.ok) {
      return {
        success: true,
        output: result,
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate cache key for API response
 */
function generateCacheKey(method: string, url: string, headers: Record<string, string>): string {
  const headersHash = sha256(JSON.stringify(headers));
  return REDIS_KEYS.apiProxy.cache(method, url, headersHash.substring(0, 16));
}

/**
 * Get cached response from Redis
 */
async function getCachedResponse(cacheKey: string): Promise<Record<string, any> | null> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Cache miss or error - proceed without cache
  }

  return null;
}

/**
 * Cache response in Redis
 */
async function setCachedResponse(
  cacheKey: string,
  response: Record<string, any>,
  ttl: number
): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.setEx(cacheKey, ttl, JSON.stringify(response));
  } catch {
    // Ignore cache write errors
  }
}
