/**
 * Environment Configuration
 * Quản lý biến môi trường và thiết lập chế độ Dữ liệu Mẫu (Mock) / Kết nối API thật
 */

import { Platform } from 'react-native';

// URL mặc định theo môi trường chạy
const getDefaultApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android Emulator truy cập localhost máy tính chủ qua 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

export const env = {
  appName: 'LCIT Meal',
  appVersion: '1.0.0',
  apiBaseUrl: getDefaultApiUrl(),
  // Mặc định kết nối API thật, tắt chế độ mock
  defaultUseMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  // Timeout cho HTTP request (ms)
  requestTimeoutMs: 15000,
  // Cutoff time mặc định nếu chưa lấy được từ server
  defaultCutoffTime: '08:00',
  // Giá suất ăn mặc định (VNĐ)
  defaultMealPrice: 30000,
};
