import { z } from 'zod';
import { dagDefinitionSchema } from './workflows.types';

/**
 * Create workflow request schema
 */
export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().max(1000).optional(),
    dagDefinition: dagDefinitionSchema,
  }),
});

/**
 * Update workflow request schema
 */
export const updateWorkflowSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Get workflow by ID schema
 */
export const workflowIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Create version request schema
 */
export const createVersionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    dagDefinition: dagDefinitionSchema,
  }),
});

/**
 * Pin version request schema
 */
export const pinVersionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    versionId: z.string().uuid(),
  }),
});

/**
 * List workflows query schema
 */
export const listWorkflowsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

// Type exports
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>['body'];
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>['body'];
export type CreateVersionInput = z.infer<typeof createVersionSchema>['body'];
export type ListWorkflowsQuery = z.infer<typeof listWorkflowsSchema>['query'];
