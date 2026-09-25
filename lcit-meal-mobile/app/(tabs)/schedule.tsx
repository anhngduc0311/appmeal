/**
 * Tab Screen - Lịch ăn (Meal Schedule)
 * Xem lịch ăn các ngày trong tháng, trạng thái suất ăn cá nhân,
 * đăng ký ăn, cập nhật số khách, cắt suất hoặc cắt theo khoảng ngày.
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
import { MealCard } from '../../src/components/meals/MealCard';
import { DatePickerModal } from '../../src/components/meals/DatePickerModal';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { ResultBanner } from '../../src/components/common/ResultBanner';
import { EmptyState } from '../../src/components/states/EmptyState';
import { useMockStore } from '../../src/hooks/useMockStore';
import { mockStore } from '../../src/services/mockStore';
import {
  formatDisplayDate,
} from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function ScheduleScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'registered' | 'cancelled'>('all');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Dialogs
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [rangePickerVisible, setRangePickerVisible] = useState(false);

  // Dữ liệu reactive tự động cập nhật
  const meals = useMockStore(useCallback(() => mockStore.getMeals(), []));
  const registrations = useMockStore(useCallback(() => mockStore.getMyRegistrations(), []));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const handleRegister = (mealId: number) => {
    mockStore.registerMeal(mealId, 0);
    setBannerMessage('Đăng ký suất ăn thành công!');
  };

  const handleOpenCancel = (regId: number) => {
    setSelectedRegId(regId);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    if (selectedRegId) {
      mockStore.cancelMealRegistration(selectedRegId);
      setCancelModalVisible(false);
      setSelectedRegId(null);
      setBannerMessage('Đã cắt suất ăn thành công.');
    }
  };

  const handleOpenGuestCounter = (mealId: number, currentGuests: number) => {
    setSelectedMealId(mealId);
    setGuestCount(currentGuests);
    setGuestModalVisible(true);
  };

  const handleSaveGuests = () => {
    if (selectedMealId) {
      mockStore.updateGuestCount(selectedMealId, guestCount);
      setGuestModalVisible(false);
      setSelectedMealId(null);
      setBannerMessage(`Đã cập nhật số khách (${guestCount} khách) thành công.`);
    }
  };

  const handleSelectDateRange = (fromDate: string, toDate: string) => {
    mockStore.createMealOption('cancel_schedule', fromDate, toDate, 'Cắt suất theo khoảng ngày');
    setBannerMessage(`Đã tạo yêu cầu cắt suất từ ${formatDisplayDate(fromDate)} đến ${formatDisplayDate(toDate)}.`);
  };

  // Lọc danh sách theo filterMode
  const filteredMeals = meals.filter((meal) => {
    const reg = registrations.find((r) => r.mealId === meal.id);
    if (filterMode === 'registered') {
      return reg && (reg.status === 'confirmed' || reg.status === 'completed');
    }
    if (filterMode === 'cancelled') {
      return reg && reg.status === 'cancelled';
    }
    return true;
  });

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
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
            const reg = registrations.find((r) => r.mealId === meal.id);
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
        message="Bạn có chắc chắn muốn hủy suất ăn này? Hệ thống sẽ ghi nhận và cập nhật trực tiếp."
        confirmText="Xác nhận cắt"
        cancelText="Giữ lại"
        isDestructive
        iconName="trash-outline"
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
        onConfirm={handleSaveGuests}
        onCancel={() => {
          setGuestModalVisible(false);
          setSelectedMealId(null);
        }}
      />

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
});
