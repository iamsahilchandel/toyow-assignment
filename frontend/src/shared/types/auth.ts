// Authentication types
import type { ApiResponse } from "./api";

export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

// Response from /auth/me endpoint (only returns user, no tokens)
export interface MeResponse {
  user: User;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Use ApiResponse wrapper for login/register responses
export type LoginResponse = ApiResponse<AuthData>;

export interface RegisterCredentials {
  email: string;
  password: string;
  role?: UserRole; // Optional, defaults to USER on backend
}

// Refresh token input
export interface RefreshInput {
  refreshToken: string;
}
