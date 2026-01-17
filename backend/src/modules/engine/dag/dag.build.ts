import { DAGDefinition, NodeConfig, Edge } from '../../workflows/workflows.types';
import { DAGRuntime, NodeRuntime, EdgeRuntime, DAGSettings } from '../engine.types';

/**
 * Build DAG runtime from definition
 */
export function buildDAGRuntime(definition: DAGDefinition): DAGRuntime {
  const nodes = new Map<string, NodeRuntime>();
  const edges: EdgeRuntime[] = [];
  const adjacencyList = new Map<string, string[]>();
  const reverseAdjacencyList = new Map<string, string[]>();

  // Initialize adjacency lists
  for (const node of definition.nodes) {
    adjacencyList.set(node.id, []);
    reverseAdjacencyList.set(node.id, []);
  }

  // Build edges and adjacency lists
  for (const edge of definition.edges) {
    edges.push({
      from: edge.from,
      to: edge.to,
      condition: edge.condition,
    });

    adjacencyList.get(edge.from)?.push(edge.to);
    reverseAdjacencyList.get(edge.to)?.push(edge.from);
  }

  // Compute topological order
  const topologicalOrder = computeTopologicalSort(definition.nodes, definition.edges);

  // Build node map with topo indices
  for (const node of definition.nodes) {
    const topoIndex = topologicalOrder.indexOf(node.id);
    nodes.set(node.id, {
      id: node.id,
      type: node.type,
      config: node.config,
      retryConfig: node.retryConfig || {
        maxAttempts: definition.settings?.defaultMaxAttempts || 3,
        backoffMs: 1000,
        backoffMultiplier: 2,
      },
      topoIndex,
    });
  }

  const settings: DAGSettings = {
    maxConcurrency: definition.settings?.maxConcurrency || 5,
    defaultMaxAttempts: definition.settings?.defaultMaxAttempts || 3,
  };

  return {
    nodes,
    edges,
    adjacencyList,
    reverseAdjacencyList,
    topologicalOrder,
    settings,
  };
}

/**
 * Compute topological sort with deterministic ordering
 */
function computeTopologicalSort(nodes: NodeConfig[], edges: Edge[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // Initialize
  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  }

  // Build adjacency and in-degree
  for (const edge of edges) {
    adjacencyList.get(edge.from)?.push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  }

  // Find nodes with no incoming edges, sort for determinism
  const queue: string[] = [];
  for (const node of nodes) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  }
  queue.sort();

  const sorted: string[] = [];

  while (queue.length > 0) {
    // Sort queue to ensure deterministic order (by nodeId ASC)
    queue.sort();
    const nodeId = queue.shift()!;
    sorted.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const degree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, degree);

      if (degree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}

/**
 * Get root nodes (nodes with no incoming edges)
 */
export function getRootNodes(dag: DAGRuntime): string[] {
  const roots: string[] = [];
  for (const [nodeId, parents] of dag.reverseAdjacencyList) {
    if (parents.length === 0) {
      roots.push(nodeId);
    }
  }
  return roots.sort();
}

/**
 * Get child nodes of a given node
 */
export function getChildNodes(dag: DAGRuntime, nodeId: string): string[] {
  return dag.adjacencyList.get(nodeId) || [];
}

/**
 * Get parent nodes of a given node
 */
export function getParentNodes(dag: DAGRuntime, nodeId: string): string[] {
  return dag.reverseAdjacencyList.get(nodeId) || [];
}

/**
 * Get edge between two nodes
 */
export function getEdge(dag: DAGRuntime, from: string, to: string): EdgeRuntime | undefined {
  return dag.edges.find((e) => e.from === from && e.to === to);
}
