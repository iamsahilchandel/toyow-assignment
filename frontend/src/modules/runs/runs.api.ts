import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type { ExecutionMetadata, RunStep } from "../../shared/types/run";

export const runsApi = createApi({
  reducerPath: "runsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Run", "RunStep"],
  endpoints: (builder) => ({
    getRuns: builder.query<
      ExecutionMetadata[],
      { workflowId?: string; status?: string } | void
    >({
      query: (filters) => ({
        url: "/runs",
        params: filters || undefined,
      }),
      providesTags: ["Run"],
    }),
    getRun: builder.query<ExecutionMetadata, string>({
      query: (runId) => `/runs/${runId}`,
      providesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    startRun: builder.mutation<
      { runId: string },
      { workflowId: string; input?: unknown }
    >({
      query: ({ workflowId, input }) => ({
        url: `/workflows/${workflowId}/runs`,
        method: "POST",
        body: { input },
      }),
      invalidatesTags: ["Run"],
    }),
    pauseRun: builder.mutation<void, string>({
      query: (runId) => ({
        url: `/runs/${runId}/pause`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    resumeRun: builder.mutation<void, string>({
      query: (runId) => ({
        url: `/runs/${runId}/resume`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    cancelRun: builder.mutation<void, string>({
      query: (runId) => ({
        url: `/runs/${runId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    getRunSteps: builder.query<RunStep[], string>({
      query: (runId) => `/runs/${runId}/steps`,
      providesTags: (_result, _error, runId) => [
        { type: "RunStep", id: `list-${runId}` },
      ],
    }),
    getRunStep: builder.query<RunStep, { runId: string; nodeId: string }>({
      query: ({ runId, nodeId }) => `/runs/${runId}/steps/${nodeId}`,
      providesTags: (_result, _error, { nodeId, runId }) => [
        { type: "RunStep", id: `${runId}-${nodeId}` },
      ],
    }),
    retryStep: builder.mutation<RunStep, { runId: string; nodeId: string }>({
      query: ({ runId, nodeId }) => ({
        url: `/runs/${runId}/steps/${nodeId}/retry`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { nodeId, runId }) => [
        { type: "RunStep", id: `${runId}-${nodeId}` },
        { type: "RunStep", id: `list-${runId}` },
      ],
    }),
    getRunLogs: builder.query<
      unknown[],
      { runId: string; page?: number; limit?: number }
    >({
      query: ({ runId, page = 1, limit = 100 }) => ({
        url: `/runs/${runId}/logs`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { runId }) => [
        { type: "Run", id: `${runId}-logs` },
      ],
    }),
  }),
});

export const {
  useGetRunsQuery,
  useGetRunQuery,
  useStartRunMutation,
  usePauseRunMutation,
  useResumeRunMutation,
  useCancelRunMutation,
  useGetRunStepsQuery,
  useGetRunStepQuery,
  useRetryStepMutation,
  useGetRunLogsQuery,
} = runsApi;
