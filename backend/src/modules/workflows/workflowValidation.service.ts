import { DAGDefinition, NodeConfig, Edge } from './workflows.types';
import { ValidationError } from '../../shared/errors';

/**
 * DAG Validation Service
 * Handles workflow DAG structure validation
 */
export class WorkflowValidationService {
  /**
   * Validate DAG structure and constraints
   */
  validate(dag: DAGDefinition): void {
    this.validateNodeIds(dag.nodes);
    this.validateEdges(dag.nodes, dag.edges);
    this.detectCycles(dag.nodes, dag.edges);
    this.validateConnectivity(dag.nodes, dag.edges);
    this.validateIfNodes(dag.nodes, dag.edges);
    this.validatePluginConfigs(dag.nodes);
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

    // Check for completely disconnected nodes (only when there's more than one node)
    for (const nodeId of allNodeIds) {
      const hasConnections = nodesWithIncoming.has(nodeId) || nodesWithOutgoing.has(nodeId);
      if (!hasConnections && allNodeIds.size > 1) {
        throw new ValidationError(`Node ${nodeId} is not connected to any other nodes`);
      }
    }
  }

  /**
   * Validate IF nodes have exactly 2 outgoing edges with true/false conditions
   */
  private validateIfNodes(nodes: NodeConfig[], edges: Edge[]): void {
    const ifNodes = nodes.filter((n) => n.type === 'IF');

    for (const ifNode of ifNodes) {
      const outgoingEdges = edges.filter((e) => e.from === ifNode.id);

      if (outgoingEdges.length !== 2) {
        throw new ValidationError(
          `IF node ${ifNode.id} must have exactly 2 outgoing edges (true and false branches)`
        );
      }

      const conditions = outgoingEdges.map((e) => {
        if (typeof e.condition === 'string') {
          return e.condition;
        }
        return e.condition?.type;
      });

      const hasTrue = conditions.includes('true') || conditions.includes('IF');
      const hasFalse = conditions.includes('false') || conditions.includes('ELSE');

      if (!hasTrue || !hasFalse) {
        throw new ValidationError(
          `IF node ${ifNode.id} must have both "true" and "false" condition edges`
        );
      }
    }
  }

  /**
   * Validate plugin configurations
   */
  private validatePluginConfigs(nodes: NodeConfig[]): void {
    for (const node of nodes) {
      switch (node.type) {
        case 'TEXT_TRANSFORM':
          if (node.config.shift !== undefined && typeof node.config.shift !== 'number') {
            throw new ValidationError(`TEXT_TRANSFORM node ${node.id}: shift must be a number`);
          }
          break;

        case 'API_PROXY':
          if (!node.config.url || typeof node.config.url !== 'string') {
            throw new ValidationError(
              `API_PROXY node ${node.id}: url is required and must be a string`
            );
          }
          try {
            new URL(node.config.url);
          } catch {
            throw new ValidationError(`API_PROXY node ${node.id}: url must be a valid URL`);
          }
          break;

        case 'DELAY':
          if (!node.config.ms || typeof node.config.ms !== 'number' || node.config.ms <= 0) {
            throw new ValidationError(`DELAY node ${node.id}: ms must be a positive number`);
          }
          break;

        case 'IF':
          if (!node.config.expr || typeof node.config.expr !== 'string') {
            throw new ValidationError(
              `IF node ${node.id}: expr (expression) is required and must be a string`
            );
          }
          break;
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

    // Find nodes with no incoming edges, sort by nodeId for determinism
    const queue: string[] = [];
    for (const node of nodes) {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
      }
    }
    queue.sort(); // Deterministic ordering

    const sorted: string[] = [];

    while (queue.length > 0) {
      // Sort queue to ensure deterministic order
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
    return nodes
      .filter((n) => !nodesWithIncoming.has(n.id))
      .map((n) => n.id)
      .sort();
  }

  /**
   * Get leaf nodes (nodes with no outgoing edges)
   */
  getLeafNodes(nodes: NodeConfig[], edges: Edge[]): string[] {
    const nodesWithOutgoing = new Set(edges.map((e) => e.from));
    return nodes
      .filter((n) => !nodesWithOutgoing.has(n.id))
      .map((n) => n.id)
      .sort();
  }
}

export const workflowValidationService = new WorkflowValidationService();
