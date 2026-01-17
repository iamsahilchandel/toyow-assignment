import { ExecutionStatus, NodeStatus } from '../../../generated/prisma';

/**
 * Run response type
 */
export interface RunResponse {
  id: string;
  workflowVersionId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt: Date | null;
  metadata: Record<string, any> | null;
  input: Record<string, any> | null;
}

/**
 * Step execution response type
 */
export interface StepResponse {
  id: string;
  runId: string;
  nodeId: string;
  status: NodeStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  input: Record<string, any> | null;
  output: Record<string, any> | null;
  error: Record<string, any> | null;
  retryCount: number;
}

/**
 * Log entry response type
 */
export interface LogResponse {
  id: string;
  stepId: string;
  level: string;
  message: string;
  metadata: Record<string, any> | null;
  timestamp: Date;
}

/**
 * NDJSON log entry for streaming
 */
export interface NDJSONLogEntry {
  ts: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  event: string;
  runId: string;
  nodeId?: string;
  stepId?: string;
  payload?: Record<string, any>;
}

/**
 * Run filters for listing
 */
export interface RunFilters {
  workflowId?: string;
  status?: ExecutionStatus;
  page?: number;
  limit?: number;
}
