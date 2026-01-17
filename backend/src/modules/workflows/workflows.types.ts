import { z } from 'zod';

/**
 * Node configuration schema
 */
export const nodeConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['TEXT_TRANSFORM', 'API_PROXY', 'DATA_AGGREGATOR', 'DELAY', 'IF']),
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

/**
 * Edge configuration schema
 */
export const edgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  condition: z
    .union([
      z.literal('true'),
      z.literal('false'),
      z.object({
        type: z.enum(['IF', 'ELSE', 'ALWAYS']).default('ALWAYS'),
        expression: z.string().optional(),
      }),
    ])
    .optional(),
});

/**
 * Workflow settings schema
 */
export const workflowSettingsSchema = z.object({
  maxConcurrency: z.number().int().min(1).max(100).default(5),
  defaultMaxAttempts: z.number().int().min(1).max(10).default(3),
});

/**
 * DAG definition schema
 */
export const dagDefinitionSchema = z.object({
  nodes: z.array(nodeConfigSchema).min(1, 'DAG must have at least one node'),
  edges: z.array(edgeSchema),
  settings: workflowSettingsSchema.optional(),
});

// Type exports
export type NodeConfig = z.infer<typeof nodeConfigSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type WorkflowSettings = z.infer<typeof workflowSettingsSchema>;
export type DAGDefinition = z.infer<typeof dagDefinitionSchema>;

/**
 * Plugin execution context
 */
export interface PluginExecutionContext {
  runId: string;
  nodeId: string;
  input: Record<string, any>;
  config: Record<string, any>;
  steps?: Record<string, { status: string; outputs: Record<string, any> }>;
}

/**
 * Plugin execution result
 */
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

/**
 * Execution state
 */
export interface ExecutionState {
  runId: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'CANCELLED';
  currentNodeId?: string;
  completedNodes: string[];
  failedNodes: string[];
  skippedNodes: string[];
  context: Record<string, any>;
}

/**
 * Workflow with versions
 */
export interface WorkflowWithVersions {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  versions: Array<{
    id: string;
    version: number;
    dagDefinition: DAGDefinition;
    isPinned: boolean;
    createdAt: Date;
  }>;
}
