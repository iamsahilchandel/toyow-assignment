import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type {
  Plugin,
  PluginVersion,
  CreatePluginInput,
  CreatePluginVersionInput,
} from "../../shared/types/plugins";
import type { ApiResponse } from "../../shared/types/api";

export const pluginsApi = createApi({
  reducerPath: "pluginsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Plugin", "PluginVersion"],
  endpoints: (builder) => ({
    getPlugins: builder.query<
      Plugin[],
      { type?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/plugins",
        params: params || undefined,
      }),
      transformResponse: (response: ApiResponse<Plugin[]>) => response.data,
      providesTags: ["Plugin"],
    }),
    getPlugin: builder.query<Plugin, string>({
      query: (pluginId) => `/plugins/${pluginId}`,
      transformResponse: (response: ApiResponse<Plugin>) => response.data,
      providesTags: (_result, _error, pluginId) => [
        { type: "Plugin", id: pluginId },
      ],
    }),
    createPlugin: builder.mutation<Plugin, CreatePluginInput>({
      query: (plugin) => ({
        url: "/plugins",
        method: "POST",
        body: plugin,
      }),
      transformResponse: (response: ApiResponse<Plugin>) => response.data,
      invalidatesTags: ["Plugin"],
    }),
    getPluginVersions: builder.query<PluginVersion[], string>({
      query: (pluginId) => `/plugins/${pluginId}/versions`,
      transformResponse: (response: ApiResponse<PluginVersion[]>) =>
        response.data,
      providesTags: (_result, _error, pluginId) => [
        { type: "PluginVersion", id: `list-${pluginId}` },
      ],
    }),
    createPluginVersion: builder.mutation<
      PluginVersion,
      { pluginId: string } & CreatePluginVersionInput
    >({
      query: ({ pluginId, ...body }) => ({
        url: `/plugins/${pluginId}/versions`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PluginVersion>) =>
        response.data,
      invalidatesTags: (_result, _error, { pluginId }) => [
        { type: "PluginVersion", id: `list-${pluginId}` },
      ],
    }),
  }),
});

export const {
  useGetPluginsQuery,
  useGetPluginQuery,
  useCreatePluginMutation,
  useGetPluginVersionsQuery,
  useCreatePluginVersionMutation,
} = pluginsApi;
