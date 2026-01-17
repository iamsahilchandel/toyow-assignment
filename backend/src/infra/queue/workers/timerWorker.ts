import { Job } from 'bull';
import { timerQueue } from '../queue.client';
import { TimerPayload } from '../queue.payloads';
import { logger } from '../../../shared/logger';

/**
 * Initialize timer worker for non-blocking delays
 * Must be called after modules are loaded to avoid circular dependencies
 */
export async function initTimerWorker() {
  // Dynamic import to avoid circular dependency
  const { executionEngine } = await import('../../../modules/engine/execution/stepRunner');

  timerQueue.process(async (job: Job<TimerPayload>) => {
    const { runId, nodeId, delayMs, nextNodeInput } = job.data;

    logger.info('Timer job completed', {
      jobId: job.id,
      runId,
      nodeId,
      delayMs,
    });

    try {
      // Timer completed, continue with next nodes
      // This will be implemented when we add the full DAG traversal
      logger.info('Delay completed, queueing next steps', {
        runId,
        nodeId,
      });
    } catch (error: any) {
      logger.error('Timer job follow-up failed', {
        jobId: job.id,
        runId,
        nodeId,
        error: error.message,
      });

      throw error;
    }
  });

  logger.info('Timer worker started');
}
