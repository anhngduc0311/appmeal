/**
 * Management Dashboard Screen
 * T27, T28: Bảng điều khiển quản lý tổng quan, KPI suất ăn & khách, Biểu đồ chu kỳ, Hàng chờ duyệt và Menu phân hệ
 * Có Role Guard: Chỉ Admin và Manager được truy cập (chặn cả direct deep link).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { ForbiddenState } from '../../src/components/states/ForbiddenState';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { useAuth } from '../../src/providers/AuthProvider';
import { useDashboardHome, useDashboardChart } from '../../src/hooks/useDashboardData';
import {
  useManagementRegistrations,
  useApproveCancelRegistration,
  useRejectCancelRegistration,
} from '../../src/hooks/useManagementRegistrations';
import { formatCurrency, formatBusinessDateDisplay } from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function ManagementDashboardScreen() {
  const router = useRouter();
  const wide = useWindowDimensions().width >= 850;
  const { user, role } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [refreshing, setRefreshing] = useState(false);

  // Quick action state
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const hasAccess = role === 'admin' || role === 'manager';

  const {
    data: homeData,
    isLoading: isLoadingHome,
    refetch: refetchHome,
  } = useDashboardHome();

  const {
    data: chartData,
    isLoading: isLoadingChart,
    refetch: refetchChart,
  } = useDashboardChart(selectedPeriod);

  const { data: pendingRegs = [], refetch: refetchRegs } = useManagementRegistrations({
    status: 'pending',
  });

  const approveMutation = useApproveCancelRegistration();
  const rejectMutation = useRejectCancelRegistration();

  if (!hasAccess) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Khu vực Quản lý" showBack onBack={() => router.replace('/(tabs)')} />
        <ForbiddenState
          title="Không có quyền Quản lý"
          message={`Tài khoản hiện tại (${user?.fullName || 'Người dùng'} - vai trò ${role || 'chưa cấp'}) không có quyền truy cập vào trung tâm Quản trị.`}
          onGoBack={() => router.replace('/(tabs)')}
        />
      </ScreenContainer>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchHome(), refetchChart(), refetchRegs()]);
    setRefreshing(false);
  };

  const handleConfirmAction = async () => {
    if (!selectedRegId || !actionType) return;
    if (actionType === 'approve') {
      await approveMutation.mutateAsync(selectedRegId);
    } else {
      await rejectMutation.mutateAsync(selectedRegId);
    }
    setSelectedRegId(null);
    setActionType(null);
    refetchHome();
    refetchRegs();
  };

  const todaySlots = homeData?.todayStaff?.total_meal_slots ?? homeData?.todayMeal?.total_meal_slots ?? 0;
  const todayStaffCount = homeData?.todayStaff?.registered_staff_count ?? 0;
  const todayGuestCount = homeData?.todayStaff?.total_guest_count ?? 0;
  const pendingCount = pendingRegs.length || homeData?.pendingMealOptionCount || 0;
  const outstandingAmount = homeData?.outstanding?.total_outstanding_amount ?? 0;
  const unpaidRecords = homeData?.outstanding?.unpaid_record_count ?? 0;

  // Chart data calculation
  const points = chartData?.data || homeData?.weeklyChart || [];
  const maxSlots = Math.max(...points.map((p) => p.total_meal_slots || 0), 1);

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      <Header
        title="Tổng quan quản lý"
        subtitle={`Theo dõi hoạt động bữa ăn · ${user?.fullName || ''}`}
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
        rightAction={
          <TouchableOpacity
            style={styles.refreshHeaderBtn}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={colors.primaryDark} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingHome}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* KPI Cards Overview */}
        <View style={[styles.kpiContainer, wide && {flexDirection: 'row', gap: 16}]}>
          {/* Card 1: Hôm nay */}
          <Card variant="elevated" padding="md" style={[styles.kpiCardLarge, wide && {flex: 1}]}>
            <View style={styles.kpiHeaderRow}>
              <View style={[styles.kpiIconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="restaurant" size={20} color={colors.primaryDark} />
              </View>
              <Badge label="Hôm nay" variant="success" size="sm" />
            </View>
            <Text style={styles.kpiBigNumber}>{todaySlots}</Text>
            <Text style={styles.kpiLabel}>Tổng suất cần nấu hôm nay</Text>
            <View style={styles.kpiSubRow}>
              <Text style={styles.kpiSubText}>
                • Cán bộ: <Text style={styles.boldText}>{todayStaffCount}</Text>
              </Text>
              <Text style={styles.kpiSubText}>
                • Khách: <Text style={[styles.boldText, { color: colors.warning }]}>{todayGuestCount}</Text>
              </Text>
            </View>
          </Card>

          {/* Card 2 & 3: Pending & Outstanding */}
          <View style={[styles.kpiRowSmall, wide && {flex: 1.2}]}>
            <Card
              variant="elevated"
              padding="md"
              style={styles.kpiCardSmall}
              onPress={() => router.push('/management/registrations' as any)}
            >
              <View style={[styles.kpiIconSmall, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={16} color="#B45309" />
              </View>
              <Text style={[styles.kpiNumberSmall, { color: '#B45309' }]}>{pendingCount}</Text>
              <Text style={styles.kpiSmallLabel}>Chờ duyệt cắt</Text>
            </Card>

            <Card
              variant="elevated"
              padding="md"
              style={styles.kpiCardSmall}
              onPress={() => router.push('/management/payments' as any)}
            >
              <View style={[styles.kpiIconSmall, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
              </View>
              <Text style={[styles.kpiNumberSmall, { color: '#DC2626', fontSize: wide ? 26 : 20 }]}>
                {formatCurrency(outstandingAmount)}
              </Text>
              <Text style={styles.kpiSmallLabel}>{unpaidRecords} khoản chưa thu</Text>
            </Card>
          </View>
        </View>

        {/* Biểu đồ số lượng suất ăn & Cán bộ */}
        <Card variant="elevated" padding="md" style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.sectionTitle}>Biểu đồ suất ăn thực tế</Text>
              <Text style={styles.sectionSubtitle}>Chỉ tính các suất đã hoàn thành qua trưa</Text>
            </View>

            {/* Period selector */}
            <View style={styles.periodTabs}>
              {(['week', 'month', 'year'] as const).map((p) => {
                const isActive = selectedPeriod === p;
                const label = p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm';
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.periodTab, isActive && styles.periodTabActive]}
                    onPress={() => setSelectedPeriod(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.periodTabText, isActive && styles.periodTabTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {isLoadingChart ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.barChartWrapper}>
              <View style={styles.chartBarsContainer}>
                {points.map((pt, idx) => {
                  const heightPercent = maxSlots > 0 ? (pt.total_meal_slots / maxSlots) * 100 : 0;
                  const isZero = pt.total_meal_slots === 0;
                  return (
                    <View key={idx} style={styles.barCol}>
                      <Text style={styles.barValueText}>
                        {pt.total_meal_slots > 0 ? pt.total_meal_slots : ''}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${Math.max(heightPercent, 4)}%`,
                              backgroundColor: isZero ? colors.borderLight : colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabelText} numberOfLines={1}>
                        {pt.meal_date.includes('(') ? pt.meal_date.split(' ')[0] : pt.meal_date}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </Card>

        {/* Hàng chờ duyệt nhanh (Pending queue) */}
        {pendingRegs.length > 0 && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.rowAlign}>
                <Text style={styles.sectionTitle}>Hàng chờ duyệt cắt suất</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{pendingRegs.length}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/management/registrations' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {pendingRegs.slice(0, 3).map((item) => (
              <Card key={item.id} variant="elevated" padding="md" style={styles.pendingCard}>
                <View style={styles.pendingCardHeader}>
                  <View style={styles.pendingAvatarBox}>
                    <Ionicons name="person" size={16} color={colors.primaryDark} />
                  </View>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingName}>{item.user?.fullName || 'Cán bộ'}</Text>
                    <Text style={styles.pendingDate}>
                      Ngày ăn: {formatBusinessDateDisplay(item.mealDate || '')}
                    </Text>
                  </View>
                  <Badge label="Chờ duyệt" variant="warning" size="sm" />
                </View>

                <View style={styles.pendingActions}>
                  <Button
                    title="Từ chối"
                    variant="outline"
                    size="sm"
                    style={styles.actionBtnSmall}
                    onPress={() => {
                      setSelectedRegId(item.id);
                      setActionType('reject');
                    }}
                  />
                  <Button
                    title="Duyệt cắt"
                    variant="primary"
                    size="sm"
                    style={styles.actionBtnSmall}
                    onPress={() => {
                      setSelectedRegId(item.id);
                      setActionType('approve');
                    }}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Menu Phân hệ Quản lý & Nghiệp vụ */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Chức năng Nghiệp vụ Quản trị</Text>
          <Text style={styles.sectionSubtitle}>Lựa chọn phân hệ cần quản lý bên dưới</Text>

          <View style={styles.gridMenu}>
            {/* Phân hệ 1: Lịch bếp & Ngày nghỉ */}
            <Card
              variant="elevated"
              padding="md"
              style={[styles.menuGridItem, wide && {width: '24%'}]}
              onPress={() => router.push('/management/meals' as any)}
            >
              <View style={[styles.menuGridIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="restaurant-outline" size={24} color={colors.primaryDark} />
              </View>
              <Text style={styles.menuGridTitle}>Lịch bếp & Nghỉ lễ</Text>
              <Text style={styles.menuGridDesc}>Tạo, sửa lịch nấu, báo hủy và sự kiện nghỉ</Text>
            </Card>

            {/* Phân hệ 2: Danh sách đăng ký & Duyệt cắt */}
            <Card
              variant="elevated"
              padding="md"
              style={[styles.menuGridItem, wide && {width: '24%'}]}
              onPress={() => router.push('/management/registrations' as any)}
            >
              <View style={[styles.menuGridIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="checkbox-outline" size={24} color="#B45309" />
              </View>
              <Text style={styles.menuGridTitle}>Đăng ký & Duyệt cắt</Text>
              <Text style={styles.menuGridDesc}>Tổng hợp suất ăn, duyệt cắt, thao tác hộ</Text>
            </Card>

            {/* Phân hệ 3: Thu tiền ăn */}
            <Card
              variant="elevated"
              padding="md"
              style={[styles.menuGridItem, wide && {width: '24%'}]}
              onPress={() => router.push('/management/payments' as any)}
            >
              <View style={[styles.menuGridIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="wallet-outline" size={24} color="#15803D" />
              </View>
              <Text style={styles.menuGridTitle}>Quản lý Thu tiền</Text>
              <Text style={styles.menuGridDesc}>Lập hóa đơn, xác nhận đã đóng & xuất báo cáo</Text>
            </Card>

            {/* Phân hệ 4: Người dùng (Admin / Manager) */}
            <Card
              variant="elevated"
              padding="md"
              style={[styles.menuGridItem, wide && {width: '24%'}]}
              onPress={() => router.push('/management/users' as any)}
            >
              <View style={[styles.menuGridIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="people-outline" size={24} color="#7E22CE" />
              </View>
              <Text style={styles.menuGridTitle}>Người dùng & Vai trò</Text>
              <Text style={styles.menuGridDesc}>
                {role === 'admin' ? 'Tạo tài khoản, phân quyền role' : 'Danh sách cán bộ cơ quan'}
              </Text>
            </Card>

            {/* Phân hệ 5: Phát thông báo */}
            <Card
              variant="elevated"
              padding="md"
              style={[styles.menuGridItem, wide && {width: '24%'}]}
              onPress={() => router.push('/management/notifications' as any)}
            >
              <View style={[styles.menuGridIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="megaphone-outline" size={24} color="#0369A1" />
              </View>
              <Text style={styles.menuGridTitle}>Soạn & Phát thông báo</Text>
              <Text style={styles.menuGridDesc}>Gửi broadcast hoặc chọn cán bộ nhận</Text>
            </Card>

            {/* Phân hệ 6: Cấu hình hệ thống (Admin only) */}
            {role === 'admin' && (
              <Card
                variant="elevated"
                padding="md"
                style={[styles.menuGridItem, wide && {width: '24%'}]}
                onPress={() => router.push('/management/settings' as any)}
              >
                <View style={[styles.menuGridIcon, { backgroundColor: '#FCE7F3' }]}>
                  <Ionicons name="settings-outline" size={24} color="#BE185D" />
                </View>
                <Text style={styles.menuGridTitle}>Cấu hình hệ thống</Text>
                <Text style={styles.menuGridDesc}>Lịch thứ, giờ đóng, giá tiền & QR</Text>
              </Card>
            )}

            {/* Phân hệ 7: Audit Logs (Admin only) */}
            {role === 'admin' && (
              <Card
                variant="elevated"
                padding="md"
                style={[styles.menuGridItem, wide && {width: '24%'}]}
                onPress={() => router.push('/management/audit' as any)}
              >
                <View style={[styles.menuGridIcon, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="document-text-outline" size={24} color="#475569" />
                </View>
                <Text style={styles.menuGridTitle}>Nhật ký hệ thống</Text>
                <Text style={styles.menuGridDesc}>Vết thao tác, an toàn và bảo mật</Text>
              </Card>
            )}

            {/* Phân hệ 8: Công cụ Admin (Admin/Manager) */}
            <Card
              variant="elevated"
              padding="md"
              style={[styles.menuGridItem, wide && {width: '24%'}]}
              onPress={() => router.push('/management/admin-tools' as any)}
            >
              <View style={[styles.menuGridIcon, { backgroundColor: '#FEF9C3' }]}>
                <Ionicons name="construct-outline" size={24} color="#A16207" />
              </View>
              <Text style={styles.menuGridTitle}>Công cụ quản trị</Text>
              <Text style={styles.menuGridDesc}>Chạy sinh lịch tự động & chốt hoàn thành</Text>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Dialog for Quick Action */}
      <ConfirmDialog
        visible={selectedRegId !== null}
        title={actionType === 'approve' ? 'Xác nhận duyệt cắt suất' : 'Từ chối yêu cầu cắt suất'}
        message={
          actionType === 'approve'
            ? 'Bạn có chắc chắn muốn duyệt yêu cầu cắt suất này? Suất ăn sẽ được chuyển sang trạng thái Đã hủy (Cancelled).'
            : 'Bạn có chắc chắn muốn từ chối yêu cầu cắt suất này? Suất ăn sẽ tiếp tục được giữ ở trạng thái Đã xác nhận (Confirmed).'
        }
        confirmText={actionType === 'approve' ? 'Duyệt cắt' : 'Từ chối'}
        cancelText="Hủy bỏ"
        variant={actionType === 'approve' ? 'primary' : 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setSelectedRegId(null);
          setActionType(null);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 2,
    paddingBottom: spacing['3xl'],
  },
  refreshHeaderBtn: {
    padding: spacing.xs,
  },
  kpiContainer: {
    marginBottom: spacing.md,
  },
  kpiCardLarge: {
    padding: 24,
    marginBottom: spacing.sm,
    backgroundColor: colors.primaryDark,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBigNumber: {
    fontSize: 44,
    fontWeight: typography.weights.extrabold,
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  kpiLabel: {
    fontSize: typography.sizes.sm,
    color: '#D5E4D8',
    marginBottom: spacing.xs,
  },
  kpiSubRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  kpiSubText: {
    fontSize: typography.sizes.xs,
    color: '#D5E4D8',
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  kpiRowSmall: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  kpiCardSmall: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  kpiIconSmall: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  kpiNumberSmall: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
  },
  kpiSmallLabel: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: radius.full,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  periodTabActive: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodTabText: {
    fontSize: typography.sizes['2xs'],
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  periodTabTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  chartLoading: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChartWrapper: {
    paddingTop: spacing.sm,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueText: {
    fontSize: 9,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: colors.backgroundDark,
    borderRadius: radius.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.full,
  },
  barLabelText: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },
  sectionWrapper: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeCount: {
    backgroundColor: colors.status.pending.bg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.status.pending.text,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  pendingCard: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  pendingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pendingAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  pendingDate: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  actionBtnSmall: {
    minWidth: 80,
    height: 32,
  },
  gridMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  menuGridItem: {
    width: '48%',
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  menuGridIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  menuGridTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  menuGridDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
