import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type { Plugin, PluginVersion } from "../../shared/types/plugins";

export const pluginsApi = createApi({
  reducerPath: "pluginsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Plugin", "PluginVersion"],
  endpoints: (builder) => ({
    getPlugins: builder.query<Plugin[], void>({
      query: () => "/plugins",
      providesTags: ["Plugin"],
    }),
    getPlugin: builder.query<Plugin, string>({
      query: (pluginId) => `/plugins/${pluginId}`,
      providesTags: (_result, _error, pluginId) => [
        { type: "Plugin", id: pluginId },
      ],
    }),
    createPlugin: builder.mutation<
      Plugin,
      Omit<Plugin, "id" | "createdAt" | "updatedAt" | "createdBy">
    >({
      query: (plugin) => ({
        url: "/plugins",
        method: "POST",
        body: plugin,
      }),
      invalidatesTags: ["Plugin"],
    }),
    getPluginVersions: builder.query<PluginVersion[], string>({
      query: (pluginId) => `/plugins/${pluginId}/versions`,
      providesTags: (_result, _error, pluginId) => [
        { type: "PluginVersion", id: `list-${pluginId}` },
      ],
    }),
    createPluginVersion: builder.mutation<
      PluginVersion,
      {
        pluginId: string;
        version: string;
        configSchema: Record<string, unknown>;
      }
    >({
      query: ({ pluginId, ...body }) => ({
        url: `/plugins/${pluginId}/versions`,
        method: "POST",
        body,
      }),
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
