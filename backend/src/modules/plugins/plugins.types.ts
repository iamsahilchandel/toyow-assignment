import { PluginType } from '../../../generated/prisma';

/**
 * Plugin response type
 */
export interface PluginResponse {
  id: string;
  name: string;
  type: PluginType;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plugin version response type
 */
export interface PluginVersionResponse {
  id: string;
  pluginId: string;
  version: string;
  code: string;
  storageUrl: string | null;
  config: Record<string, any> | null;
  checksumSha256: string | null;
  createdAt: Date;
}

/**
 * Plugin with versions
 */
export interface PluginWithVersions extends PluginResponse {
  versions: PluginVersionResponse[];
}
