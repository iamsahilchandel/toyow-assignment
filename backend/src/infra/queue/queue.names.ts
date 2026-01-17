/**
 * Queue name constants
 */
export const QUEUE_NAMES = {
  WORKFLOW_EXECUTION: 'workflow-execution',
  WORKFLOW_RETRY: 'workflow-retry',
  TIMER: 'workflow-timer',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
