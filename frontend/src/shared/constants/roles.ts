import type { UserRole } from "../types/auth";

// Role constants
export const ROLES = {
  ADMIN: "admin" as UserRole,
  USER: "user" as UserRole,
} as const;

// Check if user has admin role
export const isAdmin = (role: UserRole): boolean => role === ROLES.ADMIN;
