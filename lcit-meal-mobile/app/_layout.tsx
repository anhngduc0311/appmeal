/**
 * Root Layout
 * Bọc toàn bộ ứng dụng trong AppProviders và cấu hình Stack Navigation
 */

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders, useAuth } from '../src/providers';
import { LoadingState } from '../src/components/states';
import { ErrorBoundary, OfflineBanner } from '../src/components/common';
import { colors } from '../src/theme/colors';

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Nếu chưa đăng nhập và không ở trang auth -> Điều hướng đến màn hình login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Nếu đã đăng nhập mà đang ở trang auth -> Điều hướng vào tabs chính
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <LoadingState
        message="Đang khởi động LCIT Meal..."
        subMessage="Vui lòng chờ trong giây lát"
      />
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Chỉnh sửa hồ sơ' }} />
        <Stack.Screen
          name="(auth)/login"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="meal/[id]"
          options={{
            headerShown: false,
            title: 'Chi tiết suất ăn',
          }}
        />
        <Stack.Screen
          name="meal-options/index"
          options={{
            headerShown: false,
            title: 'Yêu cầu cắt suất',
          }}
        />
        <Stack.Screen
          name="management/index"
          options={{
            headerShown: false,
            title: 'Bảng điều khiển Quản lý',
          }}
        />
        <Stack.Screen
          name="management/meals"
          options={{
            headerShown: false,
            title: 'Quản lý lịch bếp & Ngày nghỉ',
          }}
        />
        <Stack.Screen
          name="management/registrations"
          options={{
            headerShown: false,
            title: 'Quản lý đăng ký & Duyệt cắt',
          }}
        />
        <Stack.Screen
          name="management/payments"
          options={{
            headerShown: false,
            title: 'Quản lý thu tiền ăn',
          }}
        />
        <Stack.Screen
          name="management/users"
          options={{
            headerShown: false,
            title: 'Quản lý người dùng & Vai trò',
          }}
        />
        <Stack.Screen
          name="management/notifications"
          options={{
            headerShown: false,
            title: 'Soạn & Phát thông báo',
          }}
        />
        <Stack.Screen
          name="management/settings"
          options={{
            headerShown: false,
            title: 'Cấu hình hệ thống',
          }}
        />
        <Stack.Screen
          name="management/audit"
          options={{
            headerShown: false,
            title: 'Nhật ký hệ thống',
          }}
        />
        <Stack.Screen
          name="management/admin-tools"
          options={{
            headerShown: false,
            title: 'Công cụ quản trị',
          }}
        />
        <Stack.Screen
          name="component-showcase"
          options={{
            headerShown: false,
            title: 'Thư viện Component',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RootNavigation />
      </AppProviders>
    </ErrorBoundary>
  );
}
