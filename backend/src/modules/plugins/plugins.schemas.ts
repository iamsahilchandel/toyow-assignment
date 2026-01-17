import { z } from 'zod';
import { PluginType } from '../../../generated/prisma';

/**
 * Create plugin request schema
 */
export const createPluginSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    type: z.nativeEnum(PluginType),
    description: z.string().max(500).optional(),
  }),
});

/**
 * Plugin ID parameter schema
 */
export const pluginIdSchema = z.object({
  params: z.object({
    pluginId: z.string().uuid(),
  }),
});

/**
 * Create plugin version request schema
 */
export const createPluginVersionSchema = z.object({
  params: z.object({
    pluginId: z.string().uuid(),
  }),
  body: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g., 1.0.0)'),
    code: z.string().min(1, 'Code is required'),
    config: z.record(z.any()).optional(),
  }),
});

/**
 * List plugins query schema
 */
export const listPluginsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(PluginType).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// Type exports
export type CreatePluginInput = z.infer<typeof createPluginSchema>['body'];
export type CreatePluginVersionInput = z.infer<typeof createPluginVersionSchema>['body'];
export type ListPluginsQuery = z.infer<typeof listPluginsSchema>['query'];
