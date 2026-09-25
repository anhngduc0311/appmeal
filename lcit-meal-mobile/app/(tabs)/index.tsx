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
  useWindowDimensions,
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
import { KitchenHome } from '../../src/components/meals/KitchenHome';

export default function HomeScreen() {
  const { role } = useAuth();
  return role === 'kitchen' ? <KitchenHome /> : <PersonalHomeScreen />;
}

function PersonalHomeScreen() {
  const router = useRouter();
  const wide = useWindowDimensions().width >= 850;
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
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}><Ionicons name="restaurant" size={18} color={colors.textInverse} /></View>
        <Text style={styles.brand}>LCIT <Text style={styles.brandLight}>MEAL</Text></Text>
        <Text style={styles.brandCaption}>BỮA TRƯA MỖI NGÀY</Text>
      </View>
      <Header
        title={`Xin chào, ${user?.fullName?.split(' ').slice(-1)[0] || 'Bạn'}`}
        subtitle="Một ngày làm việc tốt bắt đầu từ một bữa ăn ngon."
        userRole={role || 'employee'} isMockMode={useMockData}
        rightAction={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Thông báo" onPress={() => router.push('/(tabs)/notifications')} style={styles.notifBtn}><Ionicons name="notifications-outline" size={22} color={colors.text} /></TouchableOpacity>}
      />
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>BỮA TRƯA TẠI LCIT</Text>
          <Text style={[styles.heroTitle, wide && {fontSize: 36}]}>Trọn bữa ngon,{'\n'}vẹn ngày làm việc.</Text>
          <View style={styles.cutoff}><Ionicons name="time-outline" size={16} color="#DCEAA0" /><Text style={styles.heroNote}>Chốt đăng ký & cắt suất lúc {cutoffTime}</Text></View>
        </View>
        {wide && <View style={styles.plateOuter}><View style={styles.plateInner}><Ionicons name="restaurant-outline" size={58} color="#DCEAA0" /></View></View>}
      </View>
      <View style={[styles.columns, wide && styles.columnsWide]}>
        <View style={styles.mainColumn}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Suất ăn hôm nay</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/schedule')} style={styles.textLink}><Text style={styles.link}>Xem lịch ăn →</Text></TouchableOpacity></View>
          {todayMeal ? <MealCard dateStr={todayStr} meal={todayMeal} registration={todayReg}
            onPress={() => router.push(`/meal/${todayMeal.id}` as any)} onRegister={handleRegisterToday}
            onCancel={() => setCancelModalVisible(true)} onUpdateGuests={(_id, guests) => {setGuestCountInput(guests); setGuestModalVisible(true);}}
          /> : <Card padding="2xl" style={styles.empty}><Ionicons name="cafe-outline" size={32} color={colors.primary} /><Text style={styles.body}>Hôm nay nhà bếp không bố trí lịch nấu ăn.</Text></Card>}
          <Text style={[styles.sectionTitle, {marginTop: 18, marginBottom: 16}]}>Tiện ích của bạn</Text>
          <View style={styles.quickGrid}>
            <Card onPress={() => router.push('/(tabs)/schedule')} style={styles.quickCard} padding="xl"><View style={styles.actionIcon}><Ionicons name="calendar-outline" size={24} color={colors.primary} /></View><Text style={styles.actionTitle}>Lịch ăn</Text><Text style={styles.body}>Chủ động sắp xếp bữa trưa</Text><Ionicons name="arrow-forward" size={19} color={colors.primary} style={{marginTop: 16}} /></Card>
            <Card onPress={() => router.push('/meal-options' as any)} style={styles.quickCard} padding="xl"><View style={[styles.actionIcon, {backgroundColor: '#F4EBD8'}]}><Ionicons name="receipt-outline" size={24} color="#8A672C" /></View><Text style={styles.actionTitle}>Báo cắt suất</Text><Text style={styles.body}>Điều chỉnh những ngày vắng</Text><Ionicons name="arrow-forward" size={19} color={colors.primary} style={{marginTop: 16}} /></Card>
          </View>
        </View>
        <View style={[styles.sideColumn, wide && {width: 320}]}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Thanh toán</Text></View>
          <Card padding="2xl" style={styles.paymentCard}>
            <View style={styles.paymentTop}><Text style={styles.paymentLabel}>TIỀN ĂN CỦA BẠN</Text><Ionicons name="wallet-outline" size={22} color={colors.primary} /></View>
            <Text style={styles.paymentAmount}>{formatCurrency(totalUnpaidAmount)}</Text>
            <Text style={styles.body}>{unpaidCount > 0 ? `${unpaidCount} kỳ chưa thanh toán` : 'Các khoản thanh toán đã hoàn tất'}</Text>
            <View style={styles.divider} />
            <Text style={[styles.body, {marginBottom: 20}]}>Theo dõi tiền ăn và chuyển khoản thuận tiện bằng mã QR.</Text>
            <Button title="Xem thanh toán" onPress={() => router.push('/(tabs)/payments')} fullWidth rightIcon={<Ionicons name="arrow-forward" size={18} color="white" />} />
          </Card>
          {(role === 'admin' || role === 'manager') && <Card onPress={() => router.push('/management')} padding="xl" style={styles.managementCard}><Ionicons name="grid-outline" size={24} color={colors.primary} /><Text style={styles.actionTitle}>Trung tâm quản lý</Text><Text style={styles.body}>Suất ăn, lịch bếp và thu tiền toàn đơn vị →</Text></Card>}
        </View>
      </View>
      <View style={{marginTop: 28}}><MockModeBanner /></View>
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
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, marginBottom: 14},
  brandIcon: {width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center'},
  brand: {fontSize: 17, fontWeight: '800', letterSpacing: 1, color: colors.primaryDark}, brandLight: {fontWeight: '400'},
  brandCaption: {marginLeft: 'auto', fontSize: 9, letterSpacing: 1.3, color: colors.textSecondary},
  notifBtn: {width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'},
  hero: {backgroundColor: colors.primaryDark, borderRadius: 24, padding: 28, marginBottom: 26, flexDirection: 'row', alignItems: 'center', overflow: 'hidden'},
  heroCopy: {flex: 1}, eyebrow: {fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#DCEAA0', marginBottom: 14},
  heroTitle: {fontSize: 28, lineHeight: 40, fontWeight: '700', letterSpacing: -0.6, color: '#FFFFFF'},
  cutoff: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22}, heroNote: {fontSize: 12, color: '#D5E4D8', flexShrink: 1, lineHeight: 19},
  plateOuter: {width: 168, height: 168, borderRadius: 84, borderWidth: 1, borderColor: '#587B5F', alignItems: 'center', justifyContent: 'center', marginHorizontal: 32},
  plateInner: {width: 136, height: 136, borderRadius: 68, borderWidth: 14, borderColor: '#325D46', backgroundColor: '#244F3D', alignItems: 'center', justifyContent: 'center'},
  columns: {gap: 26}, columnsWide: {flexDirection: 'row', alignItems: 'flex-start'}, mainColumn: {flex: 1, minWidth: 0}, sideColumn: {gap: 0},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, marginBottom: 10, gap: 8},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: colors.text}, textLink: {minHeight: 44, justifyContent: 'center'}, link: {fontSize: 12, fontWeight: '600', color: colors.primary},
  quickGrid: {flexDirection: 'row', gap: 12}, quickCard: {flex: 1}, actionIcon: {width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 18},
  actionTitle: {fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8}, body: {fontSize: 13, lineHeight: 21, color: colors.textSecondary},
  paymentCard: {backgroundColor: '#EEF2E3', borderColor: '#DAE2CA'}, paymentTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, paymentLabel: {fontSize: 10, letterSpacing: 1.3, fontWeight: '700', color: colors.primaryDark},
  paymentAmount: {fontSize: 30, fontWeight: '700', letterSpacing: -0.8, color: colors.primaryDark, marginTop: 22, marginBottom: 6}, divider: {height: 1, backgroundColor: '#D6DEC8', marginVertical: 22},
  managementCard: {marginTop: 16, gap: 8}, empty: {gap: 14, alignItems: 'center'}, modalGuestCounterBox: {paddingVertical: 8},
});
