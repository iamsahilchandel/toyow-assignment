import { apiClient } from "./client";
import type { LoginCredentials, LoginResponse } from "@/lib/types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      data: LoginResponse;
    }>("/auth/login", credentials);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
