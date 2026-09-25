/**
 * Tab Screen - Lịch ăn (Meal Schedule)
 * Xem lịch ăn các ngày trong tháng, trạng thái suất ăn cá nhân,
 * đăng ký ăn, cập nhật số khách, cắt suất hoặc cắt theo khoảng ngày.
 * Kết nối thực tế TanStack React Query (T22, T25)
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
import { MealCard } from '../../src/components/meals/MealCard';
import { GuestCounter } from '../../src/components/meals/GuestCounter';
import { DatePickerModal } from '../../src/components/meals/DatePickerModal';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { ResultBanner } from '../../src/components/common/ResultBanner';
import { EmptyState } from '../../src/components/states/EmptyState';
import {
  useMeals,
  useMyRegistrations,
  useRegisterMealMutation,
  useCancelRegistrationMutation,
  useUpdateGuestCountMutation,
  useCreateMealOptionMutation,
} from '../../src/hooks/useMealsData';
import {
  formatDisplayDate,
} from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function ScheduleScreen() {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<'all' | 'registered' | 'cancelled'>('all');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Dialogs
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [rangePickerVisible, setRangePickerVisible] = useState(false);

  // Queries
  const { data: meals = [], isLoading: loadingMeals, refetch: refetchMeals } = useMeals();
  const { data: registrations = [], isLoading: loadingRegs, refetch: refetchRegs } = useMyRegistrations();

  // Mutations
  const registerMutation = useRegisterMealMutation();
  const cancelMutation = useCancelRegistrationMutation();
  const updateGuestsMutation = useUpdateGuestCountMutation();
  const createMealOptionMutation = useCreateMealOptionMutation();

  const isRefreshing = loadingMeals || loadingRegs;

  const handleRefresh = async () => {
    await Promise.all([refetchMeals(), refetchRegs()]);
  };

  const handleRegister = async (mealId: number) => {
    try {
      await registerMutation.mutateAsync({ mealId, guestCount: 0 });
      setBannerMessage('Đăng ký suất ăn thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký suất ăn thất bại.';
      Alert.alert('Thông báo', msg);
    }
  };

  const handleOpenCancel = (regId: number) => {
    setSelectedRegId(regId);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRegId) return;
    try {
      const res = await cancelMutation.mutateAsync({ registrationId: selectedRegId });
      setCancelModalVisible(false);
      setSelectedRegId(null);

      if (res && res.status === 'pending') {
        setBannerMessage('Yêu cầu cắt suất của bạn đã được gửi cho Quản lý xét duyệt.');
      } else {
        setBannerMessage('Đã cắt suất ăn thành công.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cắt suất ăn thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const handleOpenGuestCounter = (mealId: number, currentGuests: number) => {
    setSelectedMealId(mealId);
    setGuestCount(currentGuests);
    setGuestModalVisible(true);
  };

  const handleSaveGuests = async () => {
    if (!selectedMealId) return;
    try {
      const reg = registrations.find((r) => r.mealId === selectedMealId);
      await updateGuestsMutation.mutateAsync({
        mealId: selectedMealId,
        guestCount,
        registrationId: reg?.id,
      });
      setGuestModalVisible(false);
      setSelectedMealId(null);
      setBannerMessage(`Đã cập nhật số khách (${guestCount} khách) thành công.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật số khách thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const handleSelectDateRange = async (fromDate: string, toDate: string) => {
    try {
      await createMealOptionMutation.mutateAsync({
        type: 'cancel_schedule',
        fromDate,
        toDate,
        note: 'Cắt suất theo khoảng ngày',
      });
      setBannerMessage(`Đã tạo yêu cầu cắt suất từ ${formatDisplayDate(fromDate)} đến ${formatDisplayDate(toDate)}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo yêu cầu cắt suất thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  // Lọc danh sách theo filterMode
  const filteredMeals = meals.filter((meal) => {
    const reg = registrations.find((r) => r.mealId === meal.id || r.mealDate === meal.mealDate);
    if (filterMode === 'registered') {
      return reg && (reg.status === 'confirmed' || reg.status === 'completed' || reg.status === 'pending');
    }
    if (filterMode === 'cancelled') {
      return reg && reg.status === 'cancelled';
    }
    return true;
  });

  return (
    <ScreenContainer
      scrollable
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      backgroundColor={colors.background}
    >
      <Header
        title="Lịch ăn cơ quan"
        subtitle="Đăng ký, điều chỉnh khách và cắt suất theo ngày"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setRangePickerVisible(true)}
            style={styles.rangeBtn}
            accessibilityLabel="Cắt suất theo khoảng"
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.rangeBtnText}>Cắt khoảng</Text>
          </TouchableOpacity>
        }
      />

      {bannerMessage && (
        <ResultBanner
          variant="success"
          message={bannerMessage}
          onDismiss={() => setBannerMessage(null)}
        />
      )}

      {/* Bộ lọc trạng thái */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setFilterMode('all')}
          style={[styles.filterChip, filterMode === 'all' && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterText,
              filterMode === 'all' && styles.filterTextActive,
            ]}
          >
            Tất cả ({meals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setFilterMode('registered')}
          style={[
            styles.filterChip,
            filterMode === 'registered' && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filterMode === 'registered' && styles.filterTextActive,
            ]}
          >
            Đã đăng ký
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setFilterMode('cancelled')}
          style={[
            styles.filterChip,
            filterMode === 'cancelled' && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filterMode === 'cancelled' && styles.filterTextActive,
            ]}
          >
            Đã cắt suất
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách ngày ăn */}
      <View style={styles.listContainer}>
        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal) => {
            const reg = registrations.find((r) => r.mealId === meal.id || r.mealDate === meal.mealDate);
            return (
              <MealCard
                key={meal.id}
                dateStr={meal.mealDate}
                meal={meal}
                registration={reg}
                onPress={() => router.push(`/meal/${meal.id}` as any)}
                onRegister={handleRegister}
                onCancel={handleOpenCancel}
                onUpdateGuests={handleOpenGuestCounter}
              />
            );
          })
        ) : (
          <EmptyState
            iconName="calendar-outline"
            title="Không tìm thấy ngày ăn phù hợp"
            description="Không có ngày ăn nào khớp với bộ lọc bạn đã chọn."
            actionText="Xem tất cả"
            onAction={() => setFilterMode('all')}
          />
        )}
      </View>

      {/* Modal Cắt suất */}
      <ConfirmDialog
        visible={cancelModalVisible}
        title="Xác nhận cắt suất ăn"
        message="Bạn có chắc chắn muốn hủy suất ăn này? Hệ thống sẽ cập nhật trạng thái theo quy định của nhà bếp."
        confirmText="Xác nhận cắt"
        cancelText="Giữ lại"
        isDestructive
        iconName="trash-outline"
        loading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setSelectedRegId(null);
        }}
      />

      {/* Modal chọn số lượng khách */}
      <ConfirmDialog
        visible={guestModalVisible}
        title="Điều chỉnh số lượng khách"
        message="Chọn số lượng khách ăn kèm (tối đa 10 người):"
        confirmText="Xác nhận"
        cancelText="Đóng"
        iconName="people-outline"
        loading={updateGuestsMutation.isPending}
        onConfirm={handleSaveGuests}
        onCancel={() => {
          setGuestModalVisible(false);
          setSelectedMealId(null);
        }}
      >
        <View style={styles.modalGuestCounterBox}>
          <GuestCounter
            value={guestCount}
            onChange={setGuestCount}
            min={0}
            max={10}
            label="Số khách ăn kèm"
          />
        </View>
      </ConfirmDialog>

      {/* Modal chọn khoảng ngày để cắt suất */}
      <DatePickerModal
        visible={rangePickerVisible}
        mode="range"
        title="Chọn khoảng ngày cắt suất"
        onSelectRange={handleSelectDateRange}
        onClose={() => setRangePickerVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary300,
  },
  rangeBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  listContainer: {
    paddingBottom: spacing['3xl'],
  },
  modalGuestCounterBox: {
    paddingVertical: spacing.sm,
  },
});
