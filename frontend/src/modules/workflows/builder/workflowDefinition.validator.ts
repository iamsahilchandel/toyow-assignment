/**
 * Client-side validation for workflow definitions.
 */

import type { WorkflowNode, WorkflowEdge } from "./builder.types";

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate a workflow definition.
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if there are any nodes
  if (nodes.length === 0) {
    errors.push({
      message: "Workflow must have at least one node",
      severity: "error",
    });
  }

  // Validate individual nodes
  for (const node of nodes) {
    const nodeErrors = validateNode(node, edges);
    errors.push(...nodeErrors.filter((e) => e.severity === "error"));
    warnings.push(...nodeErrors.filter((e) => e.severity === "warning"));
  }

  // Check for disconnected nodes (no incoming or outgoing edges)
  const connectedNodes = new Set<string>();
  for (const edge of edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }

  for (const node of nodes) {
    if (nodes.length > 1 && !connectedNodes.has(node.id)) {
      warnings.push({
        nodeId: node.id,
        message: `Node "${node.data.label}" is not connected to any other node`,
        severity: "warning",
      });
    }
  }

  // Check for cycles (basic detection)
  const cycleError = detectCycle(nodes, edges);
  if (cycleError) {
    errors.push(cycleError);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single node.
 */
function validateNode(
  node: WorkflowNode,
  edges: WorkflowEdge[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if node is configured
  if (!node.data.isConfigured) {
    errors.push({
      nodeId: node.id,
      message: `Node "${node.data.label}" is not configured`,
      severity: "error",
    });
  }

  // Special validation for IF node
  if (node.data.pluginType === "IF") {
    const outgoingEdges = edges.filter((e) => e.source === node.id);
    const hasTrueEdge = outgoingEdges.some((e) => e.sourceHandle === "true");
    const hasFalseEdge = outgoingEdges.some((e) => e.sourceHandle === "false");

    if (!hasTrueEdge) {
      errors.push({
        nodeId: node.id,
        message: `IF node "${node.data.label}" must have a "true" branch connection`,
        severity: "warning",
      });
    }
    if (!hasFalseEdge) {
      errors.push({
        nodeId: node.id,
        message: `IF node "${node.data.label}" must have a "false" branch connection`,
        severity: "warning",
      });
    }
  }

  return errors;
}

/**
 * Basic cycle detection using DFS.
 */
function detectCycle(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): ValidationError | null {
  const adjacencyList = new Map<string, string[]>();

  // Build adjacency list
  for (const node of nodes) {
    adjacencyList.set(node.id, []);
  }
  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push(edge.target);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        return {
          message:
            "Workflow contains a cycle. DAG workflows must not have circular dependencies.",
          severity: "error",
        };
      }
    }
  }

  return null;
}

/**
 * Get validation summary as a string.
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return "Workflow is valid";
  }

  const parts: string[] = [];
  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} error(s)`);
  }
  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning(s)`);
  }

  return parts.join(", ");
}
