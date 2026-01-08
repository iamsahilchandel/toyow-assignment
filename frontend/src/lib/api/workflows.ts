import { apiClient } from "./client";
import type { WorkflowDefinition, Plugin } from "@/lib/types/workflow";

export const workflowApi = {
  // Get all workflows
  getWorkflows: async (): Promise<WorkflowDefinition[]> => {
    const response = await apiClient.get<WorkflowDefinition[]>("/workflows");
    return response.data;
  },

  // Get single workflow
  getWorkflow: async (id: string): Promise<WorkflowDefinition> => {
    const response = await apiClient.get<WorkflowDefinition>(
      `/workflows/${id}`
    );
    return response.data;
  },

  // Create workflow
  createWorkflow: async (
    workflow: Omit<WorkflowDefinition, "id" | "createdAt" | "updatedAt">
  ): Promise<WorkflowDefinition> => {
    const response = await apiClient.post<WorkflowDefinition>(
      "/workflows",
      workflow
    );
    return response.data;
  },

  // Update workflow
  updateWorkflow: async (
    id: string,
    workflow: Partial<WorkflowDefinition>
  ): Promise<WorkflowDefinition> => {
    const response = await apiClient.put<WorkflowDefinition>(
      `/workflows/${id}`,
      workflow
    );
    return response.data;
  },

  // Delete workflow
  deleteWorkflow: async (id: string): Promise<void> => {
    await apiClient.delete(`/workflows/${id}`);
  },

  // Get workflow versions
  getWorkflowVersions: async (id: string): Promise<WorkflowDefinition[]> => {
    const response = await apiClient.get<WorkflowDefinition[]>(
      `/workflows/${id}/versions`
    );
    return response.data;
  },

  // Execute workflow
  executeWorkflow: async (
    id: string,
    input?: unknown
  ): Promise<{ executionId: string }> => {
    const response = await apiClient.post(`/workflows/${id}/execute`, {
      input,
    });
    return response.data;
  },

  // Get available plugins
  getPlugins: async (): Promise<Plugin[]> => {
    const response = await apiClient.get<Plugin[]>("/plugins");
    return response.data;
  },
};
