import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_URL } from "../../app/env";

// Custom base query with auth header injection and error handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Base query with token refresh logic
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 and we have a refresh token, try to refresh
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (refreshToken) {
      // Try to refresh token
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new token
        const data = refreshResult.data as { accessToken: string };
        localStorage.setItem("accessToken", data.accessToken);

        // Retry the original query with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - clear tokens and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    } else {
      // No refresh token - clear and redirect
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  }

  return result;
};
