import { ExecutionStatus, NodeStatus } from '../../../generated/prisma';

/**
 * Step execution context passed to plugins
 */
export interface StepContext {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  config: Record<string, any>;
  steps: Record<string, StepResult>;
  inputs: Record<string, any>; // Run-level inputs
}

/**
 * Result from a completed step
 */
export interface StepResult {
  status: NodeStatus;
  outputs: Record<string, any>;
  error?: string;
}

/**
 * Engine execution state
 */
export interface EngineState {
  runId: string;
  status: ExecutionStatus;
  dag: DAGRuntime;
  stepResults: Map<string, StepResult>;
  runInput: Record<string, any>;
}

/**
 * DAG runtime representation
 */
export interface DAGRuntime {
  nodes: Map<string, NodeRuntime>;
  edges: EdgeRuntime[];
  adjacencyList: Map<string, string[]>;
  reverseAdjacencyList: Map<string, string[]>;
  topologicalOrder: string[];
  settings: DAGSettings;
}

/**
 * Node runtime representation
 */
export interface NodeRuntime {
  id: string;
  type: string;
  config: Record<string, any>;
  retryConfig: RetryConfig;
  topoIndex: number;
}

/**
 * Edge runtime representation
 */
export interface EdgeRuntime {
  from: string;
  to: string;
  condition?: string | { type: string; expression?: string };
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

/**
 * DAG settings
 */
export interface DAGSettings {
  maxConcurrency: number;
  defaultMaxAttempts: number;
}

/**
 * Scheduler job
 */
export interface SchedulerJob {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  retryCount: number;
  scheduledAt: Date;
  delay?: number;
}

/**
 * Plugin execution result
 */
export interface PluginResult {
  success: boolean;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    retryable: boolean;
  };
  duration: number;
}
