/**
 * API response utilities for consistent response formatting
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * Create a successful API response
 */
export function apiSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error API response
 */
export function apiError(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
