/**
 * Queue job payload types
 */

/**
 * Workflow step execution job
 */
export interface StepExecutionPayload {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  retryCount: number;
}

/**
 * Retry job payload
 */
export interface RetryPayload {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  retryCount: number;
  scheduledAt: string;
}

/**
 * Timer/Delay job payload
 */
export interface TimerPayload {
  runId: string;
  nodeId: string;
  delayMs: number;
  blocking: boolean;
  nextNodeInput: Record<string, any>;
}
