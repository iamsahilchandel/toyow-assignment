import { z } from 'zod';
import { ExecutionStatus } from '../../../generated/prisma';

/**
 * Trigger execution request schema
 */
export const triggerExecutionSchema = z.object({
  params: z.object({
    workflowId: z.string().uuid(),
  }),
  body: z
    .object({
      input: z.record(z.any()).optional(),
    })
    .optional(),
});

/**
 * Run ID parameter schema
 */
export const runIdSchema = z.object({
  params: z.object({
    runId: z.string().uuid(),
  }),
});

/**
 * Step node ID parameter schema
 */
export const stepNodeIdSchema = z.object({
  params: z.object({
    runId: z.string().uuid(),
    nodeId: z.string(),
  }),
});

/**
 * List runs query schema
 */
export const listRunsSchema = z.object({
  query: z.object({
    workflowId: z.string().uuid().optional(),
    status: z.nativeEnum(ExecutionStatus).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

/**
 * Log level filter schema
 */
export const logsQuerySchema = z.object({
  params: z.object({
    runId: z.string().uuid(),
  }),
  query: z.object({
    level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).optional(),
    stepId: z.string().uuid().optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// Type exports
export type TriggerExecutionInput = z.infer<typeof triggerExecutionSchema>;
export type ListRunsQuery = z.infer<typeof listRunsSchema>['query'];
export type LogsQuery = z.infer<typeof logsQuerySchema>['query'];
