/**
 * Type definitions for the workflow builder.
 */

import type { Node, Edge } from "@xyflow/react";

// Plugin/Node types available in the builder
export type PluginType =
  | "TEXT_TRANSFORM"
  | "API_PROXY"
  | "DATA_AGGREGATOR"
  | "DELAY"
  | "IF";

// Node configuration schemas per type
export interface TextTransformConfig {
  shift: number;
}

export interface ApiProxyConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  cache?: boolean;
  headers?: Array<{ key: string; value: string }>;
}

export interface DataAggregatorConfig {
  strategy?: "merge" | "concat" | "pick";
}

export interface DelayConfig {
  ms: number;
  blocking?: boolean;
}

export interface IfConfig {
  expression: string;
}

// Union of all config types
export type NodeConfig =
  | TextTransformConfig
  | ApiProxyConfig
  | DataAggregatorConfig
  | DelayConfig
  | IfConfig;

// Custom node data structure
export interface WorkflowNodeData {
  label: string;
  pluginType: PluginType;
  config: NodeConfig;
  isConfigured: boolean;
  description?: string;
  [key: string]: unknown; // Index signature for ReactFlow compatibility
}

// Custom edge data structure
export interface WorkflowEdgeData {
  label?: string;
  condition?: "true" | "false"; // For IF node branches
  [key: string]: unknown; // Index signature for ReactFlow compatibility
}

// Typed ReactFlow nodes and edges
export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge<WorkflowEdgeData>;

// Plugin type metadata for palette
export interface PluginTypeInfo {
  type: PluginType;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  color: string;
  defaultConfig: NodeConfig;
}

// Plugin types available in palette
export const PLUGIN_TYPES: PluginTypeInfo[] = [
  {
    type: "TEXT_TRANSFORM",
    label: "Text Transform",
    description: "Apply Caesar cipher shift to text",
    icon: "Type",
    color: "#3b82f6", // blue
    defaultConfig: { shift: 3 } as TextTransformConfig,
  },
  {
    type: "API_PROXY",
    label: "API Proxy",
    description: "Make HTTP requests to external APIs",
    icon: "Globe",
    color: "#10b981", // green
    defaultConfig: {
      url: "",
      method: "GET",
      cache: false,
      headers: [],
    } as ApiProxyConfig,
  },
  {
    type: "DATA_AGGREGATOR",
    label: "Data Aggregator",
    description: "Merge or combine data from multiple inputs",
    icon: "Combine",
    color: "#8b5cf6", // purple
    defaultConfig: { strategy: "merge" } as DataAggregatorConfig,
  },
  {
    type: "DELAY",
    label: "Delay",
    description: "Wait for a specified duration",
    icon: "Clock",
    color: "#f59e0b", // amber
    defaultConfig: { ms: 1000, blocking: true } as DelayConfig,
  },
  {
    type: "IF",
    label: "IF Condition",
    description: "Branch workflow based on condition",
    icon: "GitBranch",
    color: "#ef4444", // red
    defaultConfig: { expression: "" } as IfConfig,
  },
];

// Get plugin info by type
export function getPluginInfo(type: PluginType): PluginTypeInfo | undefined {
  return PLUGIN_TYPES.find((p) => p.type === type);
}

// Builder state for canvas
export interface BuilderState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  isDirty: boolean;
}

// Workflow definition format for backend
export interface DagDefinition {
  nodes: Array<{
    id: string;
    type: PluginType;
    label: string;
    config: NodeConfig;
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    condition?: "true" | "false";
  }>;
}
