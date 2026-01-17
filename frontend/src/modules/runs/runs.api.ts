import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type { Execution, StepExecution } from "../../shared/types/run";
import type { LogEntry } from "../../shared/types/logs";
import type { ApiResponse } from "../../shared/types/api";

export const runsApi = createApi({
  reducerPath: "runsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Run", "RunStep"],
  endpoints: (builder) => ({
    getRuns: builder.query<
      Execution[],
      {
        workflowId?: string;
        status?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (filters) => ({
        url: "/runs",
        params: filters || undefined,
      }),
      transformResponse: (response: ApiResponse<Execution[]>) => response.data,
      providesTags: ["Run"],
    }),
    getRun: builder.query<Execution, string>({
      query: (runId) => `/runs/${runId}`,
      transformResponse: (response: ApiResponse<Execution>) => response.data,
      providesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    startRun: builder.mutation<
      { runId: string },
      { workflowId: string; input?: Record<string, unknown> }
    >({
      query: ({ workflowId, input }) => ({
        url: `/workflows/${workflowId}/runs`,
        method: "POST",
        body: { input },
      }),
      transformResponse: (response: ApiResponse<{ runId: string }>) =>
        response.data,
      invalidatesTags: ["Run"],
    }),
    pauseRun: builder.mutation<Execution, string>({
      query: (runId) => ({
        url: `/runs/${runId}/pause`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Execution>) => response.data,
      invalidatesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    resumeRun: builder.mutation<Execution, string>({
      query: (runId) => ({
        url: `/runs/${runId}/resume`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Execution>) => response.data,
      invalidatesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    cancelRun: builder.mutation<Execution, string>({
      query: (runId) => ({
        url: `/runs/${runId}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Execution>) => response.data,
      invalidatesTags: (_result, _error, runId) => [{ type: "Run", id: runId }],
    }),
    getRunSteps: builder.query<StepExecution[], string>({
      query: (runId) => `/runs/${runId}/steps`,
      transformResponse: (response: ApiResponse<StepExecution[]>) =>
        response.data,
      providesTags: (_result, _error, runId) => [
        { type: "RunStep", id: `list-${runId}` },
      ],
    }),
    getRunStep: builder.query<StepExecution, { runId: string; nodeId: string }>(
      {
        query: ({ runId, nodeId }) => `/runs/${runId}/steps/${nodeId}`,
        transformResponse: (response: ApiResponse<StepExecution>) =>
          response.data,
        providesTags: (_result, _error, { nodeId, runId }) => [
          { type: "RunStep", id: `${runId}-${nodeId}` },
        ],
      },
    ),
    retryStep: builder.mutation<
      StepExecution,
      { runId: string; nodeId: string }
    >({
      query: ({ runId, nodeId }) => ({
        url: `/runs/${runId}/steps/${nodeId}/retry`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<StepExecution>) =>
        response.data,
      invalidatesTags: (_result, _error, { nodeId, runId }) => [
        { type: "RunStep", id: `${runId}-${nodeId}` },
        { type: "RunStep", id: `list-${runId}` },
      ],
    }),
    getRunLogs: builder.query<
      LogEntry[],
      {
        runId: string;
        level?: string;
        stepId?: string;
        limit?: number;
      }
    >({
      query: ({ runId, ...params }) => ({
        url: `/runs/${runId}/logs`,
        params,
      }),
      transformResponse: (response: ApiResponse<LogEntry[]>) => response.data,
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
