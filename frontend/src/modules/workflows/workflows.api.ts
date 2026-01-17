import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type {
  WorkflowDefinition,
  WorkflowVersion,
} from "../../shared/types/workflow";

export const workflowsApi = createApi({
  reducerPath: "workflowsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Workflow", "WorkflowVersion"],
  endpoints: (builder) => ({
    getWorkflows: builder.query<WorkflowDefinition[], void>({
      query: () => "/workflows",
      providesTags: ["Workflow"],
    }),
    getWorkflow: builder.query<WorkflowDefinition, string>({
      query: (workflowId) => `/workflows/${workflowId}`,
      providesTags: (_result, _error, workflowId) => [
        { type: "Workflow", id: workflowId },
      ],
    }),
    createWorkflow: builder.mutation<
      WorkflowDefinition,
      Omit<WorkflowDefinition, "id" | "createdAt" | "updatedAt" | "version" | "createdBy">
    >({
      query: (workflow) => ({
        url: "/workflows",
        method: "POST",
        body: workflow,
      }),
      invalidatesTags: ["Workflow"],
    }),
    updateWorkflow: builder.mutation<
      WorkflowDefinition,
      { workflowId: string; workflow: Partial<WorkflowDefinition> }
    >({
      query: ({ workflowId, workflow }) => ({
        url: `/workflows/${workflowId}`,
        method: "PATCH",
        body: workflow,
      }),
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
      providesTags: (_result, _error, { versionId }) => [
        { type: "WorkflowVersion", id: versionId },
      ],
    }),
    createWorkflowVersion: builder.mutation<
      WorkflowVersion,
      { workflowId: string; definition: WorkflowDefinition }
    >({
      query: ({ workflowId, definition }) => ({
        url: `/workflows/${workflowId}/versions`,
        method: "POST",
        body: definition,
      }),
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
