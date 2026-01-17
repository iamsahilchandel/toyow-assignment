// Plugin types
export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon?: string;
  configSchema: Record<string, unknown>; // JSON Schema for plugin config
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Plugin version
export interface PluginVersion {
  id: string;
  pluginId: string;
  version: string;
  configSchema: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
}
