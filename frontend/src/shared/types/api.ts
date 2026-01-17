/**
 * Standard API Response Types
 * All backend API responses follow this format.
 */

// Pagination metadata returned with list responses
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Base API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Paginated API response wrapper
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

// Query params for paginated endpoints
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Helper type to extract data from API response
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : T;
