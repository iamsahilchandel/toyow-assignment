import { z } from 'zod';

// Node configuration schema
export const nodeConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['TEXT_TRANSFORM', 'API_PROXY', 'DATA_AGGREGATOR', 'DELAY']),
  pluginId: z.string().optional(),
  pluginVersion: z.string().optional(),
  config: z.record(z.any()),
  retryConfig: z
    .object({
      maxAttempts: z.number().int().min(0).max(10).default(3),
      backoffMs: z.number().int().min(100).default(1000),
      backoffMultiplier: z.number().min(1).default(2),
    })
    .optional(),
});

// Edge configuration schema
export const edgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  condition: z
    .object({
      type: z.enum(['IF', 'ELSE', 'ALWAYS']).default('ALWAYS'),
      expression: z.string().optional(),
    })
    .optional(),
});

// DAG definition schema
export const dagDefinitionSchema = z.object({
  nodes: z.array(nodeConfigSchema).min(1, 'DAG must have at least one node'),
  edges: z.array(edgeSchema),
});

// Type exports
export type NodeConfig = z.infer<typeof nodeConfigSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type DAGDefinition = z.infer<typeof dagDefinitionSchema>;

// Plugin execution context
export interface PluginExecutionContext {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  config: Record<string, any>;
}

// Plugin execution result
export interface PluginExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    retryable: boolean;
  };
  duration: number;
}

// Execution state
export interface ExecutionState {
  runId: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'CANCELLED';
  currentNodeId?: string;
  completedNodes: string[];
  failedNodes: string[];
  context: Record<string, any>;
}
