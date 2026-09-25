/**
 * Tab Screen - Trang chủ (Home)
 * Màn hình tổng quan: Suất ăn hôm nay, số khách, giờ đóng, thao tác nhanh và khoản thanh toán cá nhân.
 * Tuân thủ GAP-01: Chỉ hiển thị dữ liệu cá nhân, không hiển thị dữ liệu tài chính toàn cơ quan.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { MealCard } from '../../src/components/meals/MealCard';
import { GuestCounter } from '../../src/components/meals/GuestCounter';
import { MockModeBanner } from '../../src/components/meals/MockModeBanner';
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useMeals,
  useMyRegistrations,
  useScheduleConfig,
  useRegisterMealMutation,
  useCancelRegistrationMutation,
  useUpdateGuestCountMutation,
} from '../../src/hooks/useMealsData';
import { useMyPaymentSummary } from '../../src/hooks/usePaymentsData';
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

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestCountInput, setGuestCountInput] = useState(0);

  const todayStr = formatBusinessDate(new Date());

  // Queries từ TanStack React Query
  const { data: meals = [], isLoading: loadingMeals, refetch: refetchMeals } = useMeals();
  const { data: registrations = [], isLoading: loadingRegs, refetch: refetchRegs } = useMyRegistrations();
  const { data: paymentSummary, isLoading: loadingPayments, refetch: refetchPayments } = useMyPaymentSummary();
  const { data: scheduleConfig } = useScheduleConfig();

  // Mutations
  const registerMutation = useRegisterMealMutation();
  const cancelMutation = useCancelRegistrationMutation();
  const updateGuestsMutation = useUpdateGuestCountMutation();

  const isRefreshing = loadingMeals || loadingRegs || loadingPayments;

  const todayMeal = meals.find((m) => m.mealDate === todayStr);
  const todayReg = todayMeal
    ? registrations.find((r) => r.mealId === todayMeal.id || r.mealDate === todayStr)
    : undefined;

  const handleRefresh = async () => {
    await Promise.all([refetchMeals(), refetchRegs(), refetchPayments()]);
  };

  const handleRegisterToday = async (mealId: number) => {
    try {
      await registerMutation.mutateAsync({ mealId, guestCount: 0 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký suất ăn thất bại.';
      Alert.alert('Thông báo', msg);
    }
  };

  const handleCancelToday = async () => {
    if (!todayReg) return;
    try {
      const updatedReg = await cancelMutation.mutateAsync({
        registrationId: todayReg.id,
      });
      setCancelModalVisible(false);

      if (updatedReg && updatedReg.status === 'pending') {
        Alert.alert(
          'Đã gửi yêu cầu',
          'Đã quá giờ đóng đăng ký, yêu cầu cắt suất của bạn đã được chuyển cho Quản lý xét duyệt.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cắt suất ăn thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const handleSaveGuests = async () => {
    if (!todayMeal) return;
    try {
      await updateGuestsMutation.mutateAsync({
        mealId: todayMeal.id,
        guestCount: guestCountInput,
        registrationId: todayReg?.id,
      });
      setGuestModalVisible(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật số khách thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const totalUnpaidAmount = paymentSummary?.totalUnpaidAmount || 0;
  const unpaidCount = paymentSummary?.unpaidCount || 0;
  const cutoffTime = scheduleConfig?.cutoffTime || '09:00';

  return (
    <ScreenContainer
      scrollable
      refreshing={isRefreshing}
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
          Giờ chốt đăng ký & cắt suất hôm nay: <Text style={styles.cutoffBold}>{cutoffTime}</Text>
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
                {unpaidCount > 0
                  ? `Gồm ${unpaidCount} kỳ thanh toán chưa hoàn tất`
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
            onPress={() => router.push('/meal-options' as any)}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="document-text-outline" size={22} color="#B45309" />
            </View>
            <Text style={styles.actionTitle}>Báo cắt suất</Text>
            <Text style={styles.actionDesc}>Cắt hôm nay hoặc dài hạn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/payments')}
            style={styles.quickActionCard}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="qr-code-outline" size={22} color="#0369A1" />
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
            <Text style={styles.actionTitle}>Thư viện UI</Text>
            <Text style={styles.actionDesc}>Kiểm thử Component</Text>
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
        loading={cancelMutation.isPending}
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
        loading={updateGuestsMutation.isPending}
        onConfirm={handleSaveGuests}
        onCancel={() => setGuestModalVisible(false)}
      >
        <View style={styles.modalGuestCounterBox}>
          <GuestCounter
            value={guestCountInput}
            onChange={setGuestCountInput}
            min={0}
            max={10}
            label="Số suất khách đăng ký thêm"
          />
        </View>
      </ConfirmDialog>
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
  modalGuestCounterBox: {
    paddingVertical: spacing.sm,
  },
});
