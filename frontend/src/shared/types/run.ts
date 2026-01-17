import type { ExecutionStatus } from "./workflow";

// Execution/Run type matching backend API
export interface Execution {
  id: string;
  workflowVersionId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  input: Record<string, unknown>;
}

// Step execution type matching backend API
export interface StepExecution {
  id: string;
  runId: string;
  nodeId: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: Record<string, unknown>;
  retryCount: number;
}

// Execution event for WebSocket messages
export interface ExecutionEvent {
  type:
    | "node_started"
    | "node_completed"
    | "node_failed"
    | "execution_completed"
    | "execution_failed";
  executionId: string;
  nodeId?: string;
  timestamp: string;
  data: unknown;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
}

// Legacy types for backwards compatibility (can be removed later)
export interface NodeExecutionState {
  nodeId: string;
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  output?: unknown;
  error?: string;
  retryCount?: number;
}

export interface ExecutionMetadata {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggeredBy: string;
}

export interface ExecutionDetail {
  metadata: ExecutionMetadata;
  nodeStates: Record<string, NodeExecutionState>;
}

// Run step (legacy, mapped from StepExecution)
export interface RunStep {
  id: string;
  runId: string;
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  retryCount: number;
}
