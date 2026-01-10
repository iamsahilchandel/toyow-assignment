import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      adapter,
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query' as never, (e: any) => {
        if (e.duration > 1000) {
          logger.warn('Slow query detected', {
            query: e.query,
            duration: `${e.duration}ms`,
          });
        }
      });
    }

    // Graceful shutdown
    const cleanup = async () => {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  return prisma;
};

export const prismaClient = getPrismaClient();
