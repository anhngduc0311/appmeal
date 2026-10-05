/**
 * Tabs Layout
 * Cấu hình 5 tab chính: Trang chủ, Lịch ăn, Thanh toán, Thông báo, Tài khoản
 * Có badge số thông báo chưa đọc kết nối thực tế với backend (T23), icon rõ ràng và màu xanh lá active.
 */

import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnseenNotificationCount } from '../../src/hooks/useNotificationsData';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useAuth } from '../../src/providers/AuthProvider';

export default function TabLayout() {
  const { role } = useAuth();
  const { data: unreadCount = 0 } = useUnseenNotificationCount();
  const insets = useSafeAreaInsets();

  // Đảm bảo không bị phím điều hướng Android (3 nút hoặc thanh cử chỉ) che mất:
  // - Nếu insets.bottom có giá trị (Android 3 nút ~48dp, cử chỉ ~16-24dp, iOS ~34dp) -> dùng insets.bottom
  // - Nếu insets.bottom = 0 (trên một số dòng Android hoặc ROM tùy biến), đặt đệm an toàn tối thiểu 16dp
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 16 : 8
  );
  const tabHeight = 60 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: colors.primary50,
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 3,
          marginVertical: 2,
          paddingVertical: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 8,
          shadowColor: colors.primaryDark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: typography.weights.semibold,
          marginTop: 2,
          includeFontPadding: false,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          href: (role === 'kitchen' || role === 'admin') ? null : '/schedule',
          title: 'Lịch ăn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          href: (role === 'kitchen' || role === 'admin') ? null : '/payments',
          title: 'Thanh toán',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: role === 'kitchen' ? null : '/notifications',
          title: 'Thông báo',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.status.cancelled.dot,
            fontSize: 10,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
