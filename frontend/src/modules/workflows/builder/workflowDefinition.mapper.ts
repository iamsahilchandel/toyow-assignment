/**
 * Maps ReactFlow nodes/edges to backend workflow definition JSON format.
 */

import type {
  WorkflowNode,
  WorkflowEdge,
  DagDefinition,
  NodeConfig,
} from "./builder.types";

/**
 * Convert ReactFlow nodes and edges to backend DAG format.
 */
export function mapToBackendFormat(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): DagDefinition {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data.pluginType,
      label: node.data.label,
      config: node.data.config,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      condition: edge.data?.condition,
    })),
  };
}

/**
 * Convert backend DAG format to ReactFlow nodes and edges.
 */
export function mapFromBackendFormat(definition: DagDefinition): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const nodes: WorkflowNode[] = definition.nodes.map((node) => ({
    id: node.id,
    type: "custom", // Always use 'custom' type for ReactFlow rendering
    position: node.position || { x: 0, y: 0 },
    data: {
      label: node.label || node.id,
      pluginType: node.type as any, // Cast to PluginType
      config: node.config as NodeConfig,
      isConfigured: isNodeConfigured(node.type, node.config as NodeConfig),
    },
  }));

  const edges: WorkflowEdge[] = definition.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.condition ? { condition: edge.condition } : undefined,
  }));

  return { nodes, edges };
}

/**
 * Check if a node has required configuration.
 */
function isNodeConfigured(type: string, config: NodeConfig): boolean {
  if (!config) return false;
  const c = config as Record<string, unknown>;
  switch (type) {
    case "TEXT_TRANSFORM":
      return typeof c.shift === "number";
    case "API_PROXY":
      return typeof c.url === "string" && (c.url as string).length > 0;
    case "DELAY":
      return typeof c.ms === "number";
    case "IF":
      return (
        typeof c.expression === "string" && (c.expression as string).length > 0
      );
    case "DATA_AGGREGATOR":
      return true; // No required config
    default:
      return false;
  }
}

/**
 * Generate a unique node ID.
 */
export function generateNodeId(prefix = "node"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique edge ID.
 */
export function generateEdgeId(source: string, target: string): string {
  return `edge_${source}_${target}_${Date.now()}`;
}
