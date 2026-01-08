import Redis from 'redis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof Redis.createClient>;

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
