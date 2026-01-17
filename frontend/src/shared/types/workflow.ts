import { type Node as FlowNode, type Edge as FlowEdge } from "@xyflow/react";

// Execution status for workflow nodes
export type ExecutionStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "retrying"
  | "paused"
  | "cancelled"
  | "skipped";

// Plugin configuration types
export interface PluginConfig {
  [key: string]: unknown;
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  backoffStrategy: "linear" | "exponential";
  initialDelay: number;
}

// Node types in the workflow
export type NodeType = "start" | "plugin" | "condition" | "end";

// Custom node data
export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  pluginId?: string;
  pluginName?: string;
  config?: PluginConfig;
  retryConfig?: RetryConfig;
  timeout?: number;
  status?: ExecutionStatus;
  [key: string]: unknown; // Index signature to satisfy Record<string, unknown>
}

// Workflow node extends React Flow node with custom data
export type WorkflowNode = FlowNode<WorkflowNodeData>;

// Workflow edge (connection between nodes)
export type WorkflowEdge = FlowEdge;

// Complete workflow definition
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Available plugins
export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon?: string;
  configSchema: Record<string, unknown>; // JSON Schema for plugin config
}

// Workflow version
export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  definition: WorkflowDefinition;
  createdAt: string;
  createdBy: string;
}
