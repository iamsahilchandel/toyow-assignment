/**
 * Maps ReactFlow nodes/edges to backend workflow definition JSON format.
 */

import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowDefinitionJSON,
  NodeConfig,
} from "./builder.types";

/**
 * Convert ReactFlow nodes and edges to backend JSON format.
 */
export function mapToBackendFormat(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  settings?: { name?: string; description?: string },
): WorkflowDefinitionJSON {
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
    settings,
  };
}

/**
 * Convert backend JSON format to ReactFlow nodes and edges.
 */
export function mapFromBackendFormat(definition: WorkflowDefinitionJSON): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const nodes: WorkflowNode[] = definition.nodes.map((node) => ({
    id: node.id,
    type: "custom",
    position: node.position,
    data: {
      label: node.label,
      pluginType: node.type,
      config: node.config,
      isConfigured: isNodeConfigured(node.type, node.config),
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
