import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../common/ScreenContainer';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { DatePickerModal } from '../common/DatePickerModal';
import { Button } from '../common/Button';
import { ErrorState, LoadingState } from '../states';
import { useDashboardHome } from '../../hooks/useDashboardData';
import { useAuth } from '../../providers/AuthProvider';
import { formatDisplayDate, formatBusinessDate, getFullDayOfWeek } from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export function KitchenHome() {
  const { user } = useAuth();
  const today = formatBusinessDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { data, isLoading, isRefetching, error, refetch } = useDashboardHome(selectedDate);
  const changeDate = (offset: number) => {
    setSelectedDate((date) => {
      const [year, month, day] = date.split('-').map(Number);
      return formatBusinessDate(new Date(year, month - 1, day + offset));
    });
  };
  const meal = data?.todayMeal;
  const staff = data?.todayStaff;
  const cancelled = Boolean(meal?.isCancelled ?? meal?.is_cancelled);
  const total = cancelled ? 0 : Number(staff?.totalMealSlots ?? staff?.total_meal_slots ?? 0);

  return (
    <ScreenContainer scrollable refreshing={isRefetching} onRefresh={() => { void refetch(); }}>
      <Header title="Lịch bếp ăn" subtitle={user?.fullName} userRole="kitchen" />
      <View style={styles.dateNavigation}>
        <TouchableOpacity style={styles.dateArrow} accessibilityRole="button" accessibilityLabel="Xem ngày trước" onPress={() => changeDate(-1)}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateSelect} accessibilityRole="button" accessibilityLabel={`Chọn ngày xem bếp ăn, ${formatDisplayDate(selectedDate)}`} onPress={() => setDatePickerOpen(true)}>
          <Text style={styles.dateHint}>{selectedDate === today ? 'Hôm nay' : getFullDayOfWeek(selectedDate)}</Text>
          <View style={styles.dateLabel}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.title}>{formatDisplayDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateArrow} accessibilityRole="button" accessibilityLabel="Xem ngày tiếp theo" onPress={() => changeDate(1)}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {selectedDate !== today && <Button title="Về hôm nay" variant="ghost" onPress={() => setSelectedDate(today)} style={styles.todayButton} />}
      {isLoading ? <LoadingState message="Đang tải số suất cần nấu..." /> : error ? (
        <ErrorState message={error.message} onRetry={() => { void refetch(); }} />
      ) : (
        <Card padding="xl">
          <Text style={styles.title}>{formatDisplayDate(selectedDate)}</Text>
          <Text style={styles.total}>{total}</Text>
          <Text style={styles.title}>Tổng suất cần chuẩn bị</Text>
          <Text style={styles.detail}>Cán bộ: {cancelled ? 0 : Number(staff?.registeredStaffCount ?? staff?.registered_staff_count ?? 0)}</Text>
          <Text style={styles.detail}>Khách: {cancelled ? 0 : Number(staff?.totalGuestCount ?? staff?.total_guest_count ?? 0)}</Text>
          {(!meal || cancelled) && <Text style={styles.detail}>{cancelled ? 'Bếp nghỉ phục vụ ngày này.' : 'Ngày này chưa có lịch nấu ăn.'}</Text>}
        </Card>
      )}
      {datePickerOpen && <DatePickerModal visible mode="single" initialDate={selectedDate}
        title="Chọn ngày xem bếp ăn" onSelectSingle={setSelectedDate} onClose={() => setDatePickerOpen(false)} />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateNavigation: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: spacing.md },
  dateArrow: { width: 48, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
  dateSelect: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  dateHint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  dateLabel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  todayButton: { alignSelf: 'center', marginBottom: spacing.sm },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  total: { fontSize: 48, fontWeight: '700', color: colors.primary, marginVertical: spacing.md },
  detail: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.sm },
});
