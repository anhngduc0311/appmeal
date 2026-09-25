/**
 * DTO API Standard Response Envelope
 * Khớp với backend: { success, payload, error }
 */

export interface ApiErrorPayload {
  code: number;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  payload: T | null;
  error: ApiErrorPayload | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
