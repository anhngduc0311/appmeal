import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../common/ScreenContainer';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { ErrorState, LoadingState } from '../states';
import { useDashboardHome } from '../../hooks/useDashboardData';
import { useAuth } from '../../providers/AuthProvider';
import { formatDisplayDate } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function KitchenHome() {
  const { user } = useAuth();
  const { data, isLoading, isRefetching, error, refetch } = useDashboardHome();
  const meal = data?.todayMeal;
  const staff = data?.todayStaff;
  const cancelled = Boolean(meal?.isCancelled ?? meal?.is_cancelled);
  const total = cancelled ? 0 : Number(staff?.totalMealSlots ?? staff?.total_meal_slots ?? 0);

  return (
    <ScreenContainer scrollable refreshing={isRefetching} onRefresh={() => { void refetch(); }}>
      <Header title="Bếp ăn hôm nay" subtitle={user?.fullName} userRole="kitchen" />
      {isLoading ? <LoadingState message="Đang tải số suất cần nấu..." /> : error ? (
        <ErrorState message={error.message} onRetry={() => { void refetch(); }} />
      ) : (
        <Card padding="xl">
          <Text style={styles.title}>{formatDisplayDate(meal?.mealDate ?? meal?.meal_date ?? new Date())}</Text>
          <Text style={styles.total}>{total}</Text>
          <Text style={styles.title}>Tổng suất cần chuẩn bị</Text>
          <Text style={styles.detail}>Cán bộ: {cancelled ? 0 : Number(staff?.registeredStaffCount ?? staff?.registered_staff_count ?? 0)}</Text>
          <Text style={styles.detail}>Khách: {cancelled ? 0 : Number(staff?.totalGuestCount ?? staff?.total_guest_count ?? 0)}</Text>
          {(!meal || cancelled) && <Text style={styles.detail}>{cancelled ? 'Bếp nghỉ phục vụ hôm nay.' : 'Hôm nay chưa có lịch nấu ăn.'}</Text>}
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  total: { fontSize: 48, fontWeight: '700', color: colors.primary, marginVertical: spacing.md },
  detail: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.sm },
});
