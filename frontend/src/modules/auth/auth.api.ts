import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../shared/lib/http";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  MeResponse,
  User,
} from "../../shared/types/auth";
import type { ApiResponse } from "../../shared/types/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // Login returns the full response with success wrapper - handled in AuthProvider
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    // Register returns the full response with success wrapper
    register: builder.mutation<LoginResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    // Me endpoint returns only user, no tokens
    me: builder.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiResponse<MeResponse>) =>
        response.data.user,
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;
