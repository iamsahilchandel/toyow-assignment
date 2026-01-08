import { DAGDefinition, NodeConfig, Edge } from '../types/workflow.types';
import { ValidationError } from '../utils/errors';

export class DAGValidator {
  /**
   * Validate DAG structure and constraints
   */
  validate(dag: DAGDefinition): void {
    this.validateNodeIds(dag.nodes);
    this.validateEdges(dag.nodes, dag.edges);
    this.detectCycles(dag.nodes, dag.edges);
    this.validateConnectivity(dag.nodes, dag.edges);
  }

  /**
   * Ensure all node IDs are unique
   */
  private validateNodeIds(nodes: NodeConfig[]): void {
    const nodeIds = nodes.map((n) => n.id);
    const uniqueIds = new Set(nodeIds);

    if (nodeIds.length !== uniqueIds.size) {
      throw new ValidationError('Duplicate node IDs detected in DAG');
    }
  }

  /**
   * Validate edge references
   */
  private validateEdges(nodes: NodeConfig[], edges: Edge[]): void {
    const nodeIds = new Set(nodes.map((n) => n.id));

    for (const edge of edges) {
      if (!nodeIds.has(edge.from)) {
        throw new ValidationError(`Edge references non-existent node: ${edge.from}`);
      }
      if (!nodeIds.has(edge.to)) {
        throw new ValidationError(`Edge references non-existent node: ${edge.to}`);
      }
      if (edge.from === edge.to) {
        throw new ValidationError(`Self-loop detected at node: ${edge.from}`);
      }
    }
  }

  /**
   * Detect cycles using DFS
   */
  private detectCycles(nodes: NodeConfig[], edges: Edge[]): void {
    const adjacencyList = this.buildAdjacencyList(nodes, edges);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new ValidationError('Cycle detected in DAG');
        }
      }
    }
  }

  /**
   * Validate DAG connectivity (no orphaned nodes except roots and leaves)
   */
  private validateConnectivity(nodes: NodeConfig[], edges: Edge[]): void {
    const nodesWithIncoming = new Set(edges.map((e) => e.to));
    const nodesWithOutgoing = new Set(edges.map((e) => e.from));
    const allNodeIds = new Set(nodes.map((n) => n.id));

    // Check for completely disconnected nodes
    for (const nodeId of allNodeIds) {
      const hasConnections = nodesWithIncoming.has(nodeId) || nodesWithOutgoing.has(nodeId);
      if (!hasConnections && allNodeIds.size > 1) {
        throw new ValidationError(`Node ${nodeId} is not connected to any other nodes`);
      }
    }
  }

  /**
   * Perform topological sort to get execution order
   */
  topologicalSort(nodes: NodeConfig[], edges: Edge[]): string[] {
    const adjacencyList = this.buildAdjacencyList(nodes, edges);
    const inDegree = new Map<string, number>();

    // Initialize in-degree
    for (const node of nodes) {
      inDegree.set(node.id, 0);
    }

    // Calculate in-degree
    for (const edge of edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }

    // Find nodes with no incoming edges
    const queue: string[] = [];
    for (const node of nodes) {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
      }
    }

    const sorted: string[] = [];

    while (queue.length > 0) {
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

    if (sorted.length !== nodes.length) {
      throw new ValidationError('Cannot perform topological sort - DAG may contain cycles');
    }

    return sorted;
  }

  /**
   * Build adjacency list from edges
   */
  private buildAdjacencyList(nodes: NodeConfig[], edges: Edge[]): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>();

    for (const node of nodes) {
      adjacencyList.set(node.id, []);
    }

    for (const edge of edges) {
      const neighbors = adjacencyList.get(edge.from) || [];
      neighbors.push(edge.to);
      adjacencyList.set(edge.from, neighbors);
    }

    return adjacencyList;
  }

  /**
   * Get root nodes (nodes with no incoming edges)
   */
  getRootNodes(nodes: NodeConfig[], edges: Edge[]): string[] {
    const nodesWithIncoming = new Set(edges.map((e) => e.to));
    return nodes.filter((n) => !nodesWithIncoming.has(n.id)).map((n) => n.id);
  }

  /**
   * Get leaf nodes (nodes with no outgoing edges)
   */
  getLeafNodes(nodes: NodeConfig[], edges: Edge[]): string[] {
    const nodesWithOutgoing = new Set(edges.map((e) => e.from));
    return nodes.filter((n) => !nodesWithOutgoing.has(n.id)).map((n) => n.id);
  }
}

export const dagValidator = new DAGValidator();
