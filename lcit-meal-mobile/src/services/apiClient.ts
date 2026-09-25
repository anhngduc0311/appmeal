/**
 * API Client
 * Lớp giao tiếp HTTP chuẩn với backend `/api`
 * Hỗ trợ tự động đính kèm Bearer Token, bóc tách Response Envelope { success, payload, error }
 * và điều hướng sang MockStore khi đang ở chế độ Dữ liệu Mẫu (Mock Mode).
 */

import { env } from '../config/env';
import { STORAGE_KEYS } from '../config/constants';
import { storage } from '../utils/storage';
import { ApiResponse } from '../types';

export class ApiError extends Error {
  code: number;
  payload?: unknown;

  constructor(code: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.payload = payload;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = env.requestTimeoutMs, skipAuth = false, ...customConfig } = options;

  // Lấy API URL (hỗ trợ ghi đè từ thiết lập)
  const overriddenUrl = await storage.getItem(STORAGE_KEYS.API_URL_OVERRIDE);
  const baseUrl = overriddenUrl || env.apiBaseUrl;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customConfig.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Setup timeout qua AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...customConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Xử lý status HTTP
    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      const errorCode = json.error?.code || response.status;
      const errorMessage =
        json.error?.message ||
        `Yêu cầu thất bại với mã lỗi HTTP ${response.status}`;
      throw new ApiError(errorCode, errorMessage, json.payload);
    }

    return json.payload as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Hết thời gian chờ kết nối máy chủ (Timeout). Vui lòng thử lại.');
    }

    // Lỗi mạng hoặc không kết nối được backend
    throw new ApiError(
      0,
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc bật chế độ Demo.'
    );
  }
}
