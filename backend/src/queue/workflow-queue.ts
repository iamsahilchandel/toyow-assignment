import Bull from 'bull';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Queue configuration
const queueOptions: Bull.QueueOptions = {
  redis: {
    port: parseInt(env.REDIS_URL.split(':')[2] || '6379'),
    host: env.REDIS_URL.split('//')[1].split(':')[0] || 'localhost',
  },
  defaultJobOptions: {
    attempts: 1, // We handle retries manually
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false, // Keep failed jobs for debugging
  },
};

// Workflow execution queue
export const workflowQueue = new Bull('workflow-execution', queueOptions);

// Retry queue
export const retryQueue = new Bull('workflow-retry', queueOptions);

// Event listeners
workflowQueue.on('error', (error) => {
  logger.error('Workflow queue error', { error: error.message });
});

workflowQueue.on('failed', (job, err) => {
  logger.error('Workflow job failed', {
    jobId: job.id,
    error: err.message,
    data: job.data,
  });
});

retryQueue.on('error', (error) => {
  logger.error('Retry queue error', { error: error.message });
});

logger.info('Queue system initialized');
