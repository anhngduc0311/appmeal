/**
 * Screen: Chi tiết ngày ăn (Meal Detail) - T12, T13, T14, T22, T25
 * Hiển thị đầy đủ thông tin:
 * - Ngày ăn, Thứ, Tình trạng bếp (Hoạt động / Bếp nghỉ)
 * - Thực đơn nhà bếp
 * - Trạng thái suất ăn cá nhân (Confirmed, Pending, Completed, Cancelled) dựa trên response thực tế
 * - Thao tác hợp lệ: Đăng ký, Đổi khách (0..10), Cắt suất trực tiếp
 * - Khóa nút khi đang gửi mutation và hiển thị kết quả chính xác
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { ResultBanner } from '../../src/components/common/ResultBanner';
import { GuestCounter } from '../../src/components/meals/GuestCounter';
import { EmptyState } from '../../src/components/states/EmptyState';
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useMeals,
  useMyRegistrations,
  useScheduleConfig,
  useRegisterMealMutation,
  useCancelRegistrationMutation,
  useUpdateGuestCountMutation,
} from '../../src/hooks/useMealsData';
import {
  formatFullDisplayDate,
  formatBusinessDate,
  formatCurrency,
  compareBusinessDates,
} from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const mealId = Number(id);

  // States thao tác
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestCountInput, setGuestCountInput] = useState(0);
  const [bannerMessage, setBannerMessage] = useState<{
    variant: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  // Queries
  const { data: meals = [], isLoading: loadingMeals, refetch: refetchMeals } = useMeals();
  const { data: registrations = [], isLoading: loadingRegs, refetch: refetchRegs } = useMyRegistrations();
  const { data: scheduleConfig } = useScheduleConfig();

  // Mutations
  const registerMutation = useRegisterMealMutation();
  const cancelMutation = useCancelRegistrationMutation();
  const updateGuestsMutation = useUpdateGuestCountMutation();

  const isRefreshing = loadingMeals || loadingRegs;

  const meal = meals.find((m) => m.id === mealId);
  const registration = meal
    ? registrations.find((r) => r.mealId === meal.id || r.mealDate === meal.mealDate)
    : undefined;

  const handleRefresh = async () => {
    await Promise.all([refetchMeals(), refetchRegs()]);
  };

  if (!meal && !loadingMeals) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Chi tiết ngày ăn" showBack />
        <EmptyState
          iconName="calendar-outline"
          title="Không tìm thấy ngày ăn"
          description="Ngày ăn không tồn tại hoặc đã bị xóa khỏi hệ thống."
          actionText="Quay lại lịch ăn"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const isMealCancelled = !!meal?.isCancelled;
  const todayStr = formatBusinessDate(new Date());
  const isToday = meal?.mealDate === todayStr;
  const isPast = meal ? compareBusinessDates(meal.mealDate, todayStr) < 0 : false;

  const regStatus = registration?.status;
  const isRegistered = regStatus === 'confirmed';
  const isCompleted = regStatus === 'completed';
  const isPending = regStatus === 'pending';
  const isCancelled = regStatus === 'cancelled';
  const currentGuests = registration?.guestCount || 0;
  const mealPrice = scheduleConfig?.mealPrice || 30000;

  const handleRegister = async (guests = 0) => {
    if (!meal) return;
    try {
      await registerMutation.mutateAsync({ mealId: meal.id, guestCount: guests });
      setBannerMessage({
        variant: 'success',
        text: guests > 0
          ? `Đăng ký suất ăn kèm ${guests} khách thành công!`
          : 'Đăng ký suất ăn thành công!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký suất ăn thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const handleOpenCancelDialog = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!registration) return;
    try {
      const updated = await cancelMutation.mutateAsync({
        registrationId: registration.id,
      });
      setCancelModalVisible(false);

      if (updated && updated.status === 'pending') {
        setBannerMessage({
          variant: 'warning',
          text: 'Đã quá giờ đóng đăng ký, yêu cầu cắt suất của bạn đã được chuyển cho Quản lý xét duyệt.',
        });
      } else {
        setBannerMessage({
          variant: 'success',
          text: 'Đã cắt suất ăn thành công. Nhà bếp đã được cập nhật.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cắt suất ăn thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const handleOpenGuestModal = () => {
    setGuestCountInput(currentGuests);
    setGuestModalVisible(true);
  };

  const handleSaveGuests = async () => {
    if (!meal) return;
    try {
      await updateGuestsMutation.mutateAsync({
        mealId: meal.id,
        guestCount: guestCountInput,
        registrationId: registration?.id,
      });
      setGuestModalVisible(false);
      setBannerMessage({
        variant: 'success',
        text: `Đã cập nhật số khách (${guestCountInput} khách) thành công.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật số khách thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  return (
    <ScreenContainer
      scrollable
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      backgroundColor={colors.background}
    >
      <Header
        title="Chi tiết suất ăn"
        subtitle={meal ? formatFullDisplayDate(meal.mealDate) : ''}
        showBack
      />

      {bannerMessage && (
        <ResultBanner
          variant={bannerMessage.variant}
          message={bannerMessage.text}
          onDismiss={() => setBannerMessage(null)}
        />
      )}

      {/* 1. TÌNH TRẠNG BẾP & THỰC ĐƠN */}
      {meal && (
        <Card
          variant="elevated"
          padding="xl"
          style={[
            styles.mainCard,
            isMealCancelled && styles.mainCardCancelled,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.dateCol}>
              <Text style={styles.fullDateText}>
                {formatFullDisplayDate(meal.mealDate)}
              </Text>
              {isToday && (
                <View style={styles.todayPill}>
                  <Text style={styles.todayPillText}>Hôm nay</Text>
                </View>
              )}
            </View>

            <Badge
              type="mealRegistration"
              value={regStatus}
              isMealCancelled={isMealCancelled}
            />
          </View>

          {/* Thông báo bếp nghỉ hoặc chi tiết thực đơn */}
          {isMealCancelled ? (
            <View style={styles.kitchenClosedAlert}>
              <Ionicons
                name="alert-circle"
                size={24}
                color={colors.status.kitchenClosed.dot}
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Bếp nghỉ phục vụ</Text>
                <Text style={styles.alertDesc}>
                  {meal.note || 'Nhà bếp nghỉ phục vụ theo lịch cơ quan hoặc bảo trì định kỳ.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.menuSection}>
              <Text style={styles.sectionLabel}>Thực đơn dự kiến:</Text>
              <View style={styles.menuBox}>
                <Ionicons name="restaurant" size={20} color={colors.primary} />
                <Text style={styles.menuDetailText}>
                  {meal.note || 'Thực đơn cơm trưa tiêu chuẩn văn phòng: 1 món mặn, 1 món rau xào, 1 món canh & tráng miệng.'}
                </Text>
              </View>
            </View>
          )}
        </Card>
      )}

      {/* 2. TRẠNG THÁI SUẤT ĂN CỦA BẠN */}
      {!isMealCancelled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đăng ký của bạn</Text>

          <Card variant="elevated" padding="lg" style={styles.statusCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Người dùng:</Text>
              <Text style={styles.infoValue}>{user?.fullName} (@{user?.username})</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái suất:</Text>
              <Badge
                type="mealRegistration"
                value={regStatus}
                size="sm"
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khách ăn kèm:</Text>
              <Text style={styles.infoValue}>
                {currentGuests > 0 ? `${currentGuests} người` : 'Không có khách'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tiền ăn dự kiến:</Text>
              <Text style={[styles.infoValue, styles.priceHighlight]}>
                {isRegistered || isPending
                  ? formatCurrency(mealPrice * (1 + currentGuests))
                  : '0 đ'}
              </Text>
            </View>

            {isCompleted && (
              <View style={styles.completedNotice}>
                <Ionicons name="checkmark-circle" size={18} color={colors.status.completed.dot} />
                <Text style={styles.completedText}>
                  Suất ăn này đã được phục vụ và hoàn thành.
                </Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* 3. NÚT THAO TÁC NGHIỆP VỤ */}
      {meal && !isMealCancelled && !isCompleted && !isPast && (
        <View style={styles.actionsContainer}>
          {isRegistered || isPending ? (
            <View style={styles.btnStack}>
              <Button
                title={`Điều chỉnh khách (${currentGuests} khách)`}
                variant="secondary"
                size="lg"
                loading={updateGuestsMutation.isPending}
                disabled={updateGuestsMutation.isPending || cancelMutation.isPending}
                leftIcon={
                  <Ionicons name="people-outline" size={20} color={colors.text} />
                }
                onPress={handleOpenGuestModal}
                fullWidth
              />

              <Button
                title="Cắt suất ăn ngày này"
                variant="danger"
                size="lg"
                loading={cancelMutation.isPending}
                disabled={cancelMutation.isPending || updateGuestsMutation.isPending}
                leftIcon={
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={colors.textInverse}
                  />
                }
                onPress={handleOpenCancelDialog}
                fullWidth
              />
            </View>
          ) : (
            <View style={styles.btnStack}>
              <Button
                title={isCancelled ? 'Đăng ký lại suất ăn' : 'Đăng ký suất ăn này'}
                variant="primary"
                size="lg"
                loading={registerMutation.isPending}
                disabled={registerMutation.isPending}
                leftIcon={
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color={colors.textInverse}
                  />
                }
                onPress={() => handleRegister(0)}
                fullWidth
              />

              <Button
                title="Đăng ký kèm thêm khách"
                variant="outline"
                size="md"
                disabled={registerMutation.isPending}
                leftIcon={
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                }
                onPress={handleOpenGuestModal}
                fullWidth
              />
            </View>
          )}
        </View>
      )}

      {/* Modal xác nhận Cắt suất */}
      <ConfirmDialog
        visible={cancelModalVisible}
        title="Xác nhận cắt suất ăn"
        message={`Bạn đang thực hiện cắt suất ăn ngày ${meal ? formatFullDisplayDate(meal.mealDate) : ''}. Vui lòng xác nhận:`}
        confirmText="Xác nhận cắt"
        cancelText="Giữ lại"
        isDestructive
        iconName="close-circle-outline"
        loading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalVisible(false)}
      />

      {/* Modal điều chỉnh số khách */}
      <ConfirmDialog
        visible={guestModalVisible}
        title="Chọn số lượng khách ăn kèm"
        message="Số lượng khách sẽ được cập nhật cùng với suất ăn của bạn:"
        confirmText="Lưu thay đổi"
        cancelText="Hủy"
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
            label="Số khách ăn kèm"
          />
        </View>
      </ConfirmDialog>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  mainCardCancelled: {
    backgroundColor: '#FFF8F8',
    borderColor: colors.status.kitchenClosed.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dateCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  fullDateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  todayPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  todayPillText: {
    fontSize: typography.sizes['2xs'],
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  kitchenClosedAlert: {
    flexDirection: 'row',
    backgroundColor: colors.status.kitchenClosed.bg,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.kitchenClosed.border,
    gap: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.kitchenClosed.text,
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: typography.sizes.xs,
    color: colors.status.kitchenClosed.text,
    lineHeight: 18,
  },
  menuSection: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  menuBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  menuDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
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
  statusCard: {
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  priceHighlight: {
    color: colors.primaryDark,
    fontSize: typography.sizes.base,
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.completed.bg,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  completedText: {
    fontSize: typography.sizes.xs,
    color: colors.status.completed.text,
    fontWeight: typography.weights.medium,
  },
  actionsContainer: {
    marginBottom: spacing['3xl'],
  },
  btnStack: {
    gap: spacing.md,
  },
  modalGuestCounterBox: {
    paddingVertical: spacing.sm,
  },
});
