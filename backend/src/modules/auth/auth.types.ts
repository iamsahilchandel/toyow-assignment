import { UserRole } from '../../../generated/prisma';

/**
 * JWT Token payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Auth tokens response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * User response (without sensitive data)
 */
export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Auth response with user and tokens
 */
export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}
