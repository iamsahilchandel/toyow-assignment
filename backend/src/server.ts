import { app } from './app';
import { env } from './config/env';
import { logger } from './shared/logger';
import { initWebSocketServer } from './modules/realtime';
import { initStepWorker, initTimerWorker } from './infra/queue';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

// Initialize WebSocket server
initWebSocketServer(server);

// Initialize queue workers
initStepWorker().catch((err) => {
  logger.error('Failed to initialize step worker', { error: err.message });
});

initTimerWorker().catch((err) => {
  logger.error('Failed to initialize timer worker', { error: err.message });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
