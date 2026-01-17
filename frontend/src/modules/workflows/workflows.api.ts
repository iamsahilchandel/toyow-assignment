import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type {
  WorkflowDefinition,
  WorkflowVersion,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  DagDefinition,
} from "../../shared/types/workflow";
import type { ApiResponse } from "../../shared/types/api";

export const workflowsApi = createApi({
  reducerPath: "workflowsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Workflow", "WorkflowVersion"],
  endpoints: (builder) => ({
    getWorkflows: builder.query<
      WorkflowDefinition[],
      { page?: number; limit?: number; isActive?: boolean } | void
    >({
      query: (params) => ({
        url: "/workflows",
        params: params || undefined,
      }),
      transformResponse: (response: ApiResponse<WorkflowDefinition[]>) =>
        response.data,
      providesTags: ["Workflow"],
    }),
    getWorkflow: builder.query<WorkflowDefinition, string>({
      query: (workflowId) => `/workflows/${workflowId}`,
      transformResponse: (response: ApiResponse<WorkflowDefinition>) =>
        response.data,
      providesTags: (_result, _error, workflowId) => [
        { type: "Workflow", id: workflowId },
      ],
    }),
    createWorkflow: builder.mutation<WorkflowDefinition, CreateWorkflowInput>({
      query: (workflow) => ({
        url: "/workflows",
        method: "POST",
        body: workflow,
      }),
      transformResponse: (response: ApiResponse<WorkflowDefinition>) =>
        response.data,
      invalidatesTags: ["Workflow"],
    }),
    updateWorkflow: builder.mutation<
      WorkflowDefinition,
      { workflowId: string; workflow: UpdateWorkflowInput }
    >({
      query: ({ workflowId, workflow }) => ({
        url: `/workflows/${workflowId}`,
        method: "PUT",
        body: workflow,
      }),
      transformResponse: (response: ApiResponse<WorkflowDefinition>) =>
        response.data,
      invalidatesTags: (_result, _error, { workflowId }) => [
        { type: "Workflow", id: workflowId },
      ],
    }),
    deleteWorkflow: builder.mutation<void, string>({
      query: (workflowId) => ({
        url: `/workflows/${workflowId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, workflowId) => [
        { type: "Workflow", id: workflowId },
      ],
    }),
    getWorkflowVersions: builder.query<WorkflowVersion[], string>({
      query: (workflowId) => `/workflows/${workflowId}/versions`,
      transformResponse: (response: ApiResponse<WorkflowVersion[]>) =>
        response.data,
      providesTags: (_result, _error, workflowId) => [
        { type: "WorkflowVersion", id: `list-${workflowId}` },
      ],
    }),
    getWorkflowVersion: builder.query<
      WorkflowVersion,
      { workflowId: string; versionId: string }
    >({
      query: ({ workflowId, versionId }) =>
        `/workflows/${workflowId}/versions/${versionId}`,
      transformResponse: (response: ApiResponse<WorkflowVersion>) =>
        response.data,
      providesTags: (_result, _error, { versionId }) => [
        { type: "WorkflowVersion", id: versionId },
      ],
    }),
    createWorkflowVersion: builder.mutation<
      WorkflowVersion,
      { workflowId: string; dagDefinition: DagDefinition }
    >({
      query: ({ workflowId, dagDefinition }) => ({
        url: `/workflows/${workflowId}/versions`,
        method: "POST",
        body: { dagDefinition },
      }),
      transformResponse: (response: ApiResponse<WorkflowVersion>) =>
        response.data,
      invalidatesTags: (_result, _error, { workflowId }) => [
        { type: "WorkflowVersion", id: `list-${workflowId}` },
      ],
    }),
  }),
});

export const {
  useGetWorkflowsQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowVersionsQuery,
  useGetWorkflowVersionQuery,
  useCreateWorkflowVersionMutation,
} = workflowsApi;
