import { DAGRuntime, StepResult } from '../engine.types';
import { getEdge, getChildNodes, getParentNodes } from './dag.build';
import { NodeStatus } from '../../../../generated/prisma';

/**
 * Evaluate IF node condition
 */
export function evaluateIfCondition(
  expression: string,
  context: {
    steps: Record<string, StepResult>;
    inputs: Record<string, any>;
  }
): boolean {
  try {
    // Create a safe evaluation context
    const evalContext = {
      steps: context.steps,
      inputs: context.inputs,
    };

    // Simple expression evaluator (for safety, we use a restricted eval)
    // Supports: steps.A.outputs.value, steps.A.status, inputs.x
    const result = evaluateExpression(expression, evalContext);
    return Boolean(result);
  } catch (error) {
    // On error, default to false
    return false;
  }
}

/**
 * Safe expression evaluator
 */
function evaluateExpression(expr: string, context: Record<string, any>): any {
  // Parse simple dot notation expressions
  // e.g., "steps.A.outputs.status === 200"

  // Replace variable references with actual values
  const replaced = expr.replace(/\b(steps|inputs)(\.[a-zA-Z_][a-zA-Z0-9_]*)+/g, (match) => {
    try {
      const parts = match.split('.');
      let value: any = context;
      for (const part of parts) {
        value = value?.[part];
      }
      return JSON.stringify(value);
    } catch {
      return 'undefined';
    }
  });

  // Evaluate the expression safely
  // Only allow: comparisons, boolean operators, numbers, strings, null, undefined
  const safeExpr = replaced.replace(/[^=!<>&|"'\d\s\w\-\.null undefined true false]/g, '');

  try {
    // Use Function constructor for slightly safer eval
    const fn = new Function('return ' + safeExpr);
    return fn();
  } catch {
    return false;
  }
}

/**
 * Determine which branch to take after IF node
 */
export function determineIfBranch(
  dag: DAGRuntime,
  ifNodeId: string,
  conditionResult: boolean
): { selectedBranch: string; skippedBranch: string } | null {
  const children = getChildNodes(dag, ifNodeId);

  if (children.length !== 2) {
    return null;
  }

  let trueBranch: string | null = null;
  let falseBranch: string | null = null;

  for (const childId of children) {
    const edge = getEdge(dag, ifNodeId, childId);
    if (!edge) continue;

    const condition = edge.condition;
    if (condition === 'true' || (typeof condition === 'object' && condition.type === 'IF')) {
      trueBranch = childId;
    } else if (
      condition === 'false' ||
      (typeof condition === 'object' && condition.type === 'ELSE')
    ) {
      falseBranch = childId;
    }
  }

  if (!trueBranch || !falseBranch) {
    return null;
  }

  return conditionResult
    ? { selectedBranch: trueBranch, skippedBranch: falseBranch }
    : { selectedBranch: falseBranch, skippedBranch: trueBranch };
}

/**
 * Get all nodes to skip when a branch is not taken
 * Uses DFS to find all descendants in the skipped branch
 */
export function getSkippedNodes(
  dag: DAGRuntime,
  skippedBranchStart: string,
  selectedBranchStart: string
): string[] {
  const skipped: Set<string> = new Set();
  const selectedReachable: Set<string> = new Set();

  // First, find all nodes reachable from selected branch
  const selectedQueue = [selectedBranchStart];
  while (selectedQueue.length > 0) {
    const nodeId = selectedQueue.shift()!;
    if (selectedReachable.has(nodeId)) continue;
    selectedReachable.add(nodeId);

    const children = getChildNodes(dag, nodeId);
    for (const child of children) {
      selectedQueue.push(child);
    }
  }

  // Then find nodes in skipped branch that are NOT reachable from selected
  const skippedQueue = [skippedBranchStart];
  while (skippedQueue.length > 0) {
    const nodeId = skippedQueue.shift()!;
    if (skipped.has(nodeId) || selectedReachable.has(nodeId)) continue;

    skipped.add(nodeId);

    const children = getChildNodes(dag, nodeId);
    for (const child of children) {
      // Only skip if not also reachable from selected branch
      if (!selectedReachable.has(child)) {
        skippedQueue.push(child);
      }
    }
  }

  return Array.from(skipped);
}

/**
 * Check if all parent nodes are complete (SUCCESS or SKIPPED)
 */
export function areParentsComplete(
  dag: DAGRuntime,
  nodeId: string,
  stepResults: Map<string, StepResult>
): boolean {
  const parents = getParentNodes(dag, nodeId);

  for (const parentId of parents) {
    const result = stepResults.get(parentId);
    if (!result) return false;

    if (result.status !== NodeStatus.SUCCESS && result.status !== NodeStatus.SKIPPED) {
      return false;
    }
  }

  return true;
}
