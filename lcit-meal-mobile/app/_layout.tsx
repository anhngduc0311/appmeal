/**
 * Root Layout
 * Bọc toàn bộ ứng dụng trong AppProviders và cấu hình Stack Navigation
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders, useAuth } from '../src/providers';
import { LoadingState } from '../src/components/states';
import { colors } from '../src/theme/colors';

function RootNavigation() {
  const { isLoading } = useAuth();

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
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          name="profile/edit"
          options={{
            headerShown: false,
            title: 'Chỉnh sửa hồ sơ',
          }}
        />
        <Stack.Screen
          name="management/index"
          options={{
            headerShown: false,
            title: 'Quản lý',
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
    <AppProviders>
      <RootNavigation />
    </AppProviders>
  );
}
