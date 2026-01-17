export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parse and normalize pagination parameters
 */
export function parsePagination(params: PaginationParams, maxLimit = 100): PaginationResult {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(Math.max(1, params.limit || 20), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated response wrapper
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationResult
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}
