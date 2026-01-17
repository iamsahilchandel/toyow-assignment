import { Job } from 'bull';
import { workflowQueue } from '../queue.client';
import { StepExecutionPayload } from '../queue.payloads';
import { logger } from '../../../shared/logger';

/**
 * Initialize step execution worker
 * Must be called after modules are loaded to avoid circular dependencies
 */
export async function initStepWorker() {
  // Dynamic import to avoid circular dependency with execution engine
  const { executionEngine } = await import('../../../modules/engine/execution/stepRunner');

  // Process workflow execution jobs
  workflowQueue.process(async (job: Job<StepExecutionPayload>) => {
    const { runId, nodeId, input } = job.data;

    logger.info('Processing execution job', {
      jobId: job.id,
      runId,
      nodeId,
    });

    try {
      await executionEngine.executeNode(runId, nodeId, input);

      logger.info('Execution job completed', {
        jobId: job.id,
        runId,
        nodeId,
      });
    } catch (error: any) {
      logger.error('Execution job failed', {
        jobId: job.id,
        runId,
        nodeId,
        error: error.message,
      });

      throw error;
    }
  });

  logger.info('Step execution worker started');
}
