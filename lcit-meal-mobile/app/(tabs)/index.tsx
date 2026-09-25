/**
 * Tab Screen - Trang chủ (Home)
 * Màn hình tổng quan: Suất ăn hôm nay, số khách, giờ đóng, thao tác nhanh và khoản thanh toán cá nhân.
 * Tuân thủ GAP-01: Chỉ hiển thị dữ liệu cá nhân, không hiển thị dữ liệu tài chính toàn cơ quan.
 */

import React, { useState, useCallback } from 'react';
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
import { Button } from '../../src/components/common/Button';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { MealCard } from '../../src/components/meals/MealCard';
import { MockModeBanner } from '../../src/components/meals/MockModeBanner';
import { useAuth } from '../../src/providers/AuthProvider';
import { useMockStore } from '../../src/hooks/useMockStore';
import { mockStore } from '../../src/services/mockStore';
import {
  formatBusinessDate,
  formatCurrency,
  formatDisplayDate,
} from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function HomeScreen() {
  const router = useRouter();
  const { user, role, useMockData } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestCountInput, setGuestCountInput] = useState(0);

  const todayStr = formatBusinessDate(new Date());

  // Dữ liệu reactive tự động đồng bộ qua useMockStore
  const todayMeal = useMockStore(
    useCallback(() => {
      const meals = mockStore.getMeals();
      return meals.find((m) => m.mealDate === todayStr);
    }, [todayStr])
  );

  const todayReg = useMockStore(
    useCallback(() => {
      if (!todayMeal) return undefined;
      return mockStore.getRegistrationForMeal(todayMeal.id);
    }, [todayMeal])
  );

  const myPayments = useMockStore(
    useCallback(() => {
      return mockStore.getMyPayments();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const handleRegisterToday = (mealId: number) => {
    mockStore.registerMeal(mealId, 0);
  };

  const handleCancelToday = () => {
    if (todayReg) {
      mockStore.cancelMealRegistration(todayReg.id);
      setCancelModalVisible(false);
    }
  };

  const handleSaveGuests = () => {
    if (todayMeal) {
      mockStore.updateGuestCount(todayMeal.id, guestCountInput);
      setGuestModalVisible(false);
    }
  };

  // Tính tổng nợ cá nhân
  const unpaidPayments = myPayments.filter((p) => p.status === 'unpaid' || p.status === 'overdue');
  const totalUnpaidAmount = unpaidPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={handleRefresh}
      backgroundColor={colors.background}
    >
      <MockModeBanner />

      {/* Header chào người dùng */}
      <Header
        title={`Xin chào, ${user?.fullName ? user.fullName.split(' ').slice(-1)[0] : 'Bạn'} 👋`}
        subtitle={`${user?.fullName || 'Người dùng'} · ${user?.username || ''}`}
        userRole={role || 'employee'}
        isMockMode={useMockData}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/notifications')}
            style={styles.notifBtn}
            accessibilityLabel="Thông báo"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Banner cấu hình giờ đóng đăng ký */}
      <View style={styles.cutoffNotice}>
        <Ionicons name="time-outline" size={18} color={colors.status.pending.dot} />
        <Text style={styles.cutoffText}>
          Giờ chốt đăng ký & cắt suất hôm nay: <Text style={styles.cutoffBold}>09:00</Text>
        </Text>
      </View>

      {/* 1. Suất ăn hôm nay */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suất ăn hôm nay</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <Text style={styles.viewAllText}>Xem cả tuần →</Text>
          </TouchableOpacity>
        </View>

        {todayMeal ? (
          <MealCard
            dateStr={todayStr}
            meal={todayMeal}
            registration={todayReg}
            onPress={() => todayMeal && router.push(`/meal/${todayMeal.id}` as any)}
            onRegister={handleRegisterToday}
            onCancel={() => setCancelModalVisible(true)}
            onUpdateGuests={(_mealId, guests) => {
              setGuestCountInput(guests);
              setGuestModalVisible(true);
            }}
          />
        ) : (
          <Card variant="flat" padding="lg" style={styles.noMealCard}>
            <Ionicons name="cafe-outline" size={24} color={colors.textMuted} />
            <Text style={styles.noMealText}>Hôm nay nhà bếp không bố trí lịch nấu ăn.</Text>
          </Card>
        )}
      </View>

      {/* 2. Khoản thanh toán cá nhân */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thanh toán cá nhân</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/payments')}
          >
            <Text style={styles.viewAllText}>Chi tiết →</Text>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" padding="lg" style={styles.paymentSummaryCard}>
          <View style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Tổng tiền ăn chưa thanh toán</Text>
              <Text
                style={[
                  styles.paymentAmount,
                  totalUnpaidAmount > 0 ? styles.paymentAmountUnpaid : styles.paymentAmountPaid,
                ]}
              >
                {formatCurrency(totalUnpaidAmount)}
              </Text>
              <Text style={styles.paymentSubtext}>
                {unpaidPayments.length > 0
                  ? `Gồm ${unpaidPayments.length} kỳ thanh toán chưa hoàn tất`
                  : 'Bạn đã hoàn thành tất cả các khoản thanh toán!'}
              </Text>
            </View>

            <Button
              title="Thanh toán"
              variant={totalUnpaidAmount > 0 ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => router.push('/(tabs)/payments')}
            />
          </View>
        </Card>
      </View>

      {/* 3. Thao tác nhanh */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/schedule')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="calendar-outline" size={22} color={colors.primaryDark} />
            </View>
            <Text style={styles.actionTitle}>Lịch ăn tháng</Text>
            <Text style={styles.actionDesc}>Xem và đăng ký các ngày</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/payments')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="qr-code-outline" size={22} color="#B45309" />
            </View>
            <Text style={styles.actionTitle}>Quét mã QR</Text>
            <Text style={styles.actionDesc}>Chuyển khoản tiền ăn</Text>
          </TouchableOpacity>

          {(role === 'admin' || role === 'manager') && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/management')}
              style={styles.quickActionCard}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="briefcase-outline" size={22} color="#1D4ED8" />
              </View>
              <Text style={styles.actionTitle}>Trang Quản lý</Text>
              <Text style={styles.actionDesc}>Bếp & đăng ký nhân sự</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/component-showcase')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="cube-outline" size={22} color="#7E22CE" />
            </View>
            <Text style={styles.actionTitle}>Thư viện Component</Text>
            <Text style={styles.actionDesc}>Kiểm thử Giai đoạn 1</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal xác nhận Cắt suất */}
      <ConfirmDialog
        visible={cancelModalVisible}
        title="Xác nhận cắt suất ăn hôm nay"
        message={`Bạn có chắc chắn muốn cắt suất ăn ngày ${formatDisplayDate(todayStr)}? Thao tác này sẽ cập nhật số lượng suất ăn cần nấu của nhà bếp.`}
        confirmText="Đồng ý cắt suất"
        cancelText="Giữ lại"
        isDestructive
        iconName="close-circle-outline"
        onConfirm={handleCancelToday}
        onCancel={() => setCancelModalVisible(false)}
      />

      {/* Modal cập nhật số khách */}
      <ConfirmDialog
        visible={guestModalVisible}
        title="Cập nhật số khách ăn kèm"
        message="Chọn số lượng khách dùng bữa cùng bạn hôm nay (0 - 10 người):"
        confirmText="Lưu số khách"
        cancelText="Đóng"
        iconName="people-outline"
        onConfirm={handleSaveGuests}
        onCancel={() => setGuestModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notifBtn: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cutoffNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.pending.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.status.pending.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  cutoffText: {
    fontSize: typography.sizes.xs,
    color: colors.status.pending.text,
    fontWeight: typography.weights.medium,
  },
  cutoffBold: {
    fontWeight: typography.weights.bold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  noMealCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  noMealText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  paymentSummaryCard: {
    backgroundColor: colors.surface,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  paymentLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  paymentAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extrabold,
  },
  paymentAmountUnpaid: {
    color: colors.status.unpaid.dot,
  },
  paymentAmountPaid: {
    color: colors.status.confirmed.dot,
  },
  paymentSubtext: {
    fontSize: typography.sizes['2xs'],
    color: colors.textMuted,
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  quickActionCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  actionDesc: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
});
