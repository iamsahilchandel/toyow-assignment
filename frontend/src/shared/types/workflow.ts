import { type Node as FlowNode, type Edge as FlowEdge } from "@xyflow/react";

// Execution status for workflow nodes (matching backend API)
export type ExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING"
  | "PAUSED"
  | "CANCELLED"
  | "SKIPPED";

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

// Custom node data for ReactFlow
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

// Workflow node extends React Flow node with custom data (for UI)
export type WorkflowNode = FlowNode<WorkflowNodeData>;

// Workflow edge (connection between nodes) - for UI
export type WorkflowEdge = FlowEdge;

// Backend DAG node structure
export interface DagNode {
  id: string;
  type: string;
  pluginId?: string;
  config?: PluginConfig;
  position?: { x: number; y: number };
  label?: string;
}

// Backend DAG edge structure
export interface DagEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// DAG Definition structure used by backend
export interface DagDefinition {
  nodes: DagNode[];
  edges: DagEdge[];
}

// Complete workflow definition from backend API
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  dagDefinition: DagDefinition;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Input for creating a workflow
export interface CreateWorkflowInput {
  name: string;
  description?: string;
  dagDefinition: DagDefinition;
}

// Input for updating a workflow
export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  dagDefinition?: DagDefinition;
}

// Workflow version
export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  dagDefinition: DagDefinition;
  createdAt: string;
  createdBy: string;
}
