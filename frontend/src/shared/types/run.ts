import type { ExecutionStatus } from "./workflow";

// Execution-related types (runs)
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

export interface ExecutionDetail {
  metadata: ExecutionMetadata;
  nodeStates: Record<string, NodeExecutionState>;
}

// Run step (execution of a single node)
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
