import type { UserRole } from "../types/auth";

// Role constants
export const ROLES = {
  ADMIN: "ADMIN" as UserRole,
  USER: "USER" as UserRole,
} as const;

// Check if user has admin role
export const isAdmin = (role: UserRole): boolean => role === ROLES.ADMIN;
