import { Job } from 'bull';
import { workflowQueue } from '../workflow-queue';
import { executionEngine } from '../../engine/execution-engine';
import { logger } from '../../utils/logger';

interface ExecutionJobData {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  retryCount: number;
}

// Process workflow execution jobs
workflowQueue.process(async (job: Job<ExecutionJobData>) => {
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

logger.info('Workflow execution processor started');
