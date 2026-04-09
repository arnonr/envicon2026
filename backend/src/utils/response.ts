// Standard API Response Helpers — ใช้ทุก route handler

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export const ok = <T>(data: T, message?: string): SuccessResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

export const fail = (error: ErrorCode | string, message?: string): ErrorResponse => ({
  success: false,
  error,
  ...(message && { message }),
});

export const paginated = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> => ({
  success: true,
  data,
  meta: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
