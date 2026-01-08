import { apiClient } from "./client";
import type { ExecutionDetail, ExecutionMetadata } from "@/lib/types/execution";

export const executionApi = {
  // Get all executions
  getExecutions: async (filters?: {
    workflowId?: string;
    status?: string;
  }): Promise<ExecutionMetadata[]> => {
    const response = await apiClient.get<ExecutionMetadata[]>("/executions", {
      params: filters,
    });
    return response.data;
  },

  // Get single execution
  getExecution: async (id: string): Promise<ExecutionDetail> => {
    const response = await apiClient.get<ExecutionDetail>(`/executions/${id}`);
    return response.data;
  },

  // Pause execution
  pauseExecution: async (id: string): Promise<void> => {
    await apiClient.post(`/executions/${id}/pause`);
  },

  // Resume execution
  resumeExecution: async (id: string): Promise<void> => {
    await apiClient.post(`/executions/${id}/resume`);
  },

  // Cancel execution
  cancelExecution: async (id: string): Promise<void> => {
    await apiClient.post(`/executions/${id}/cancel`);
  },

  // Get execution logs (NDJSON stream)
  getExecutionLogsUrl: (id: string): string => {
    return `http://localhost:3000/api/executions/${id}/logs`;
  },
};
