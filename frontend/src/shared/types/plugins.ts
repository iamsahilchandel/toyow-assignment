// Plugin types

// Plugin type enum matching backend
export type PluginType =
  | "TEXT_TRANSFORM"
  | "API_PROXY"
  | "DATA_AGGREGATOR"
  | "DELAY"
  | "IF";

export interface Plugin {
  id: string;
  name: string;
  type: PluginType;
  description: string;
  createdAt: string;
}

// Input for creating a new plugin
export interface CreatePluginInput {
  name: string;
  type: PluginType;
  description: string;
}

// Plugin version
export interface PluginVersion {
  id: string;
  pluginId: string;
  version: string; // semver format
  code: string;
  config: Record<string, unknown>;
  createdAt: string;
}

// Input for creating a new plugin version
export interface CreatePluginVersionInput {
  version: string; // semver format
  code: string;
  config: Record<string, unknown>;
}
