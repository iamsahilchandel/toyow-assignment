// Route path constants
export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  REGISTER: "/register",
  
  // Protected routes
  DASHBOARD: "/",
  WORKFLOWS: "/workflows",
  WORKFLOW_DETAIL: (id: string) => `/workflows/${id}`,
  WORKFLOW_BUILDER: (id: string) => `/workflows/${id}/builder`,
  WORKFLOW_VERSIONS: (id: string) => `/workflows/${id}/versions`,
  RUNS: "/runs",
  RUN_DETAIL: (id: string) => `/runs/${id}`,
  RUN_LOGS: (id: string) => `/runs/${id}/logs`,
  
  // Admin routes
  PLUGINS: "/plugins",
  PLUGIN_DETAIL: (id: string) => `/plugins/${id}`,
} as const;
