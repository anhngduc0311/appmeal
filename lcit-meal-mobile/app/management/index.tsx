/**
 * Management Screen - Quản lý (Admin / Manager)
 * Bảng điều khiển quản lý lịch bếp, danh sách đăng ký suất ăn, duyệt cắt suất và cấu hình
 * Có kiểm tra quyền hạn (Role Guard): Người dùng không có quyền (Employee, Kitchen)
 * sẽ hiển thị ForbiddenState (403).
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { ForbiddenState } from '../../src/components/states/ForbiddenState';
import { useAuth } from '../../src/providers/AuthProvider';
import { mockStore } from '../../src/services/mockStore';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function ManagementScreen() {
  const router = useRouter();
  const { user, role } = useAuth();

  // Kiểm tra quyền: Chỉ Admin và Manager được truy cập
  const hasAccess = role === 'admin' || role === 'manager';

  if (!hasAccess) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Khu vực Quản lý" showBack />
        <ForbiddenState
          title="Không có quyền Quản lý"
          message={`Tài khoản hiện tại (${user?.fullName} - ${role}) không có quyền truy cập vào trang Quản trị & Quản lý bếp.`}
          onGoBack={() => router.replace('/(tabs)')}
        />
      </ScreenContainer>
    );
  }

  const meals = mockStore.getMeals();
  const pendingOptions = mockStore.getMyMealOptions().filter((o) => o.status === 'pending');

  return (
    <ScreenContainer scrollable backgroundColor={colors.background}>
      <Header
        title="Quản lý Suất ăn"
        subtitle={`Quyền: ${role?.toUpperCase()} · ${user?.fullName}`}
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
      />

      {/* KPI Stats Overview */}
      <View style={styles.statsGrid}>
        <Card variant="elevated" padding="md" style={styles.statCard}>
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>Suất ăn hôm nay</Text>
        </Card>

        <Card variant="elevated" padding="md" style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.status.pending.dot }]}>
            {pendingOptions.length}
          </Text>
          <Text style={styles.statLabel}>Chờ duyệt cắt</Text>
        </Card>

        <Card variant="elevated" padding="md" style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.status.confirmed.dot }]}>
            {meals.length}
          </Text>
          <Text style={styles.statLabel}>Ngày bếp trong tháng</Text>
        </Card>
      </View>

      {/* Menu các phân hệ quản lý */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Các chức năng nghiệp vụ</Text>

        <Card variant="elevated" padding="lg" style={styles.menuCard}>
          {/* Quản lý lịch bếp */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuRow}
            onPress={() => {}}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="restaurant-outline" size={22} color={colors.primaryDark} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Quản lý lịch bếp & thực đơn</Text>
              <Text style={styles.menuDesc}>Tạo, sửa lịch nấu ăn và thông báo nghỉ bếp</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Duyệt & danh sách đăng ký */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuRow}
            onPress={() => {}}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="checkbox-outline" size={22} color="#B45309" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Danh sách đăng ký & khách</Text>
              <Text style={styles.menuDesc}>Tổng hợp số suất ăn cần nấu theo từng ngày</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Quản lý thanh toán */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuRow}
            onPress={() => {}}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="card-outline" size={22} color="#15803D" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Quản lý thu tiền ăn</Text>
              <Text style={styles.menuDesc}>Tạo đợt thu, xác nhận đã đóng tiền và xuất file</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {role === 'admin' && (
            <>
              <View style={styles.divider} />
              {/* Quản lý người dùng & Hệ thống (Admin only) */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.menuRow}
                onPress={() => {}}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="settings-outline" size={22} color="#7E22CE" />
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>Cấu hình hệ thống & Người dùng</Text>
                  <Text style={styles.menuDesc}>Lịch thứ, giờ đóng, tài khoản nhân sự</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          )}
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.extrabold,
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.surface,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  menuDesc: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
});
