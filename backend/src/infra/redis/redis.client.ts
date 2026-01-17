import Redis from 'redis';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';

let redisClient: ReturnType<typeof Redis.createClient>;

/**
 * Get or create Redis client singleton
 */
export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = Redis.createClient({
      url: env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();

    // Graceful shutdown
    const cleanup = async () => {
      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed');
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  return redisClient;
};

export type RedisClient = Awaited<ReturnType<typeof getRedisClient>>;
