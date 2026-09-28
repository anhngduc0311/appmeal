/**
 * Quản lý Đăng Ký Suất Ăn & Duyệt Cắt Suất (Admin & Manager)
 * T30, T36: Tìm/lọc/phân trang danh sách suất ăn, duyệt/từ chối pending (tách biệt registration và meal-option),
 * thao tác đăng ký/cắt hộ đúng quyền, xuất báo cáo Excel có xác thực và chia sẻ file.
 * TỐI ƯU HÓA: FlatList virtualization mượt mà & DatePickerInput chọn ngày trực quan.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ResultBanner } from '../../src/components/common/ResultBanner';
import { LoadingState } from '../../src/components/states/LoadingState';
import { DatePickerModal } from '../../src/components/common/DatePickerModal';
import { DatePickerInput } from '../../src/components/common/DatePickerInput';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { ForbiddenState } from '../../src/components/states/ForbiddenState';
import { EmptyState } from '../../src/components/states/EmptyState';
import { GuestCounter } from '../../src/components/meals/GuestCounter';
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useManagementRegistrations,
  useApproveCancelRegistration,
  useRejectCancelRegistration,
  useConfirmRegistration,
  useRegisterOnBehalf,
  useManagementMealOptions,
  useApproveMealOption,
  useRejectMealOption,
  useCreateOptionOnBehalf,
} from '../../src/hooks/useManagementRegistrations';
import { useUsersList } from '../../src/hooks/useManagementUsers';
import { useManagementMeals } from '../../src/hooks/useManagementMeals';
import { exportService } from '../../src/services/exportService';
import { formatBusinessDate, formatBusinessDateDisplay } from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';
import { MealOptionType, MealRegistration, MealOption } from '../../src/types';

export default function ManagementRegistrationsScreen() {
  const router = useRouter();
  const { user, role, isMockMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'registrations' | 'options'>('registrations');
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
  const today = formatBusinessDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [notice, setNotice] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isRegisterOnBehalfOpen, setIsRegisterOnBehalfOpen] = useState(false);
  const [isOptionOnBehalfOpen, setIsOptionOnBehalfOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Form: Register on behalf
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [selectedMealId, setSelectedMealId] = useState<number>(0);
  const [guestCount, setGuestCount] = useState<number>(0);

  // Form: Option on behalf
  const [optionType, setOptionType] = useState<MealOptionType>('cancel_schedule');
  const [optionFromDate, setOptionFromDate] = useState('');
  const [optionToDate, setOptionToDate] = useState('');
  const [optionNote, setOptionNote] = useState('');

  // Confirm dialogs
  const [confirmApproveRegId, setConfirmApproveRegId] = useState<number | null>(null);
  const [confirmRejectRegId, setConfirmRejectRegId] = useState<number | null>(null);
  const [confirmApproveOptId, setConfirmApproveOptId] = useState<number | null>(null);
  const [confirmRejectOptId, setConfirmRejectOptId] = useState<number | null>(null);

  const hasAccess = role === 'admin' || role === 'manager';

  const {
    data: allRegistrations = [],
    isLoading: isLoadingRegs,
    isError: regsError,
    refetch: refetchRegs,
  } = useManagementRegistrations();

  const {
    data: allOptions = [],
    isLoading: isLoadingOptions,
    isError: optionsError,
    refetch: refetchOptions,
  } = useManagementMealOptions();

  const { data: users = [] } = useUsersList();
  const { data: meals = [] } = useManagementMeals();

  const approveRegMutation = useApproveCancelRegistration();
  const rejectRegMutation = useRejectCancelRegistration();
  const confirmRegMutation = useConfirmRegistration();
  const registerOnBehalfMutation = useRegisterOnBehalf();

  const approveOptMutation = useApproveMealOption();
  const rejectOptMutation = useRejectMealOption();
  const createOptOnBehalfMutation = useCreateOptionOnBehalf();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRegs(), refetchOptions()]);
    setRefreshing(false);
  };

  // API responses use userName; demo responses may include a nested user.
  const getPerson = useCallback((record: MealRegistration | MealOption) => {
    const person = users.find((u) => u.id === record.userId);
    return {
      name: record.user?.fullName || record.userName || person?.fullName || `Cán bộ #${record.userId}`,
      account: record.user?.username || person?.username,
    };
  }, [users]);
  const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
  const matchesSearch = (record: MealRegistration | MealOption) => {
    const person = getPerson(record);
    return normalizeSearch(`${person.name} ${person.account || ''} ${record.userId}`).includes(normalizeSearch(searchQuery));
  };
  const datedRegs = allRegistrations.filter((r) => !selectedDate || formatBusinessDate(r.mealDate || r.meal?.mealDate) === selectedDate);
  const searchedRegs = datedRegs.filter(matchesSearch);
  const searchedOptions = allOptions.filter(matchesSearch);
  const filteredRegs = searchedRegs.filter((r) => statusFilter === 'all' || r.status === statusFilter)
    .sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || (b.mealDate || '').localeCompare(a.mealDate || '') || a.id - b.id);
  const filteredOptions = searchedOptions.filter((o) => statusFilter === 'all' || o.status === statusFilter)
    .sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.id - a.id);
  const statusItems = activeTab === 'registrations' ? [
    { id: 'all', label: 'Tất cả' }, { id: 'pending', label: 'Chờ duyệt cắt' },
    { id: 'confirmed', label: 'Đã xác nhận' }, { id: 'cancelled', label: 'Đã cắt' }, { id: 'completed', label: 'Đã dùng bữa' },
  ] : [
    { id: 'all', label: 'Tất cả' }, { id: 'pending', label: 'Chờ duyệt' },
    { id: 'approved', label: 'Đã duyệt' }, { id: 'rejected', label: 'Đã từ chối' },
  ];
  const scope = activeTab === 'registrations' ? searchedRegs : searchedOptions;
  const pendingCount = scope.filter((item) => item.status === 'pending').length;
  const availableMeals = meals.filter((m) => !m.isCancelled && m.mealDate >= today).sort((a, b) => a.mealDate.localeCompare(b.mealDate));
  const selectableUsers = users.filter((u) => normalizeSearch(`${u.fullName} ${u.username}`).includes(normalizeSearch(userSearch)));
  const changeDate = (offset: number) => {
    const [year, month, day] = (selectedDate || today).split('-').map(Number);
    setSelectedDate(formatBusinessDate(new Date(year, month - 1, day + offset)));
  };
  const runAction = async (action: () => Promise<unknown>, message: string, close: () => void) => {
    try {
      await action();
      close();
      setNotice({ variant: 'success', message });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Thao tác thất bại. Vui lòng thử lại.';
      setNotice({ variant: 'error', message });
      Alert.alert('Không thể hoàn tất', message);
    }
  };
  const registrationContext = (id: number | null) => {
    const record = allRegistrations.find((r) => r.id === id);
    return record ? `${getPerson(record).name} · ${formatBusinessDateDisplay(record.mealDate || record.meal?.mealDate || '')}${record.guestCount ? ` · ${record.guestCount} khách` : ''}` : '';
  };
  const optionContext = (id: number | null) => {
    const record = allOptions.find((o) => o.id === id);
    return record ? `${getPerson(record).name} · ${formatBusinessDateDisplay(record.fromDate)} – ${formatBusinessDateDisplay(record.toDate)}` : '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportService.exportMealRegistrations(
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          from: selectedDate || undefined,
          to: selectedDate || undefined,
        },
        isMockMode
      );
      if (res.success) {
        Alert.alert('Thành công', res.message || 'Đã xuất file báo cáo Excel thành công.');
      } else {
        Alert.alert('Lỗi xuất file', res.message || 'Không thể xuất file báo cáo.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi', error.message || 'Xuất báo cáo thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegisterOnBehalf = async () => {
    if (!selectedUserId || !selectedMealId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn Cán bộ và Ngày ăn.');
      return;
    }
    await runAction(() => registerOnBehalfMutation.mutateAsync({ userId: selectedUserId, mealId: selectedMealId, guestCount }),
      'Đã đăng ký suất ăn hộ cán bộ.', () => { setIsRegisterOnBehalfOpen(false); setSelectedUserId(0); setGuestCount(0); });
  };

  const handleOptionOnBehalf = async () => {
    if (!selectedUserId || !optionFromDate.trim() || !optionToDate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn Cán bộ và khoảng ngày cắt.');
      return;
    }
    if (optionToDate < optionFromDate) {
      Alert.alert('Khoảng ngày không hợp lệ', 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
      return;
    }
    await runAction(() => createOptOnBehalfMutation.mutateAsync({
      userId: selectedUserId, type: optionType, fromDate: optionFromDate, toDate: optionToDate, note: optionNote.trim() || undefined,
    }), 'Đã tạo yêu cầu cắt suất hộ.', () => { setIsOptionOnBehalfOpen(false); setSelectedUserId(0); });
  };

  const renderRegistrationItem = useCallback(
    ({ item: reg }: { item: MealRegistration }) => {
      const isPending = reg.status === 'pending';
      return (
        <Card key={reg.id} variant="elevated" padding="md" style={[styles.itemCard, isPending && styles.pendingCard]}>
          <View style={styles.itemHeader}>
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={16} color={colors.primaryDark} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.userName}>{getPerson(reg).name}</Text>
              <Text style={styles.userUsername}>{getPerson(reg).account ? `@${getPerson(reg).account}` : `Mã cán bộ: ${reg.userId}`}</Text>
            </View>
            <Badge
              label={
                reg.status === 'confirmed'
                  ? 'Đã xác nhận'
                  : reg.status === 'pending'
                  ? 'Chờ duyệt cắt'
                  : reg.status === 'cancelled'
                  ? 'Đã cắt suất'
                  : 'Hoàn thành'
              }
              variant={
                reg.status === 'confirmed'
                  ? 'confirmed'
                  : reg.status === 'pending'
                  ? 'pending'
                  : reg.status === 'cancelled'
                  ? 'cancelled'
                  : 'completed'
              }
              size="sm"
            />
          </View>

          <View style={styles.itemMetaRow}>
            <Text style={styles.itemMetaText}>
              Ngày ăn:{' '}
              <Text style={styles.boldText}>
                {formatBusinessDateDisplay(reg.mealDate || reg.meal?.mealDate || '')}
              </Text>
            </Text>
            <Text style={styles.itemMetaText}>
              Khách:{' '}
              <Text
                style={[
                  styles.boldText,
                  reg.guestCount > 0 && { color: colors.warning },
                ]}
              >
                {reg.guestCount}
              </Text>
            </Text>
          </View>

          {/* Actions */}
          {(isPending || reg.status === 'cancelled') && <View style={styles.itemActionsRow}>
            {isPending && (
              <>
                <Button
                  title="Từ chối"
                  variant="outline"
                  size="sm"
                  style={styles.actionBtnSmall}
                  onPress={() => setConfirmRejectRegId(reg.id)}
                />
                <Button
                  title="Duyệt cắt"
                  variant="danger"
                  size="sm"
                  style={styles.actionBtnSmall}
                  onPress={() => setConfirmApproveRegId(reg.id)}
                />
              </>
            )}

            {reg.status === 'cancelled' && (
              <Button
                title="Xác nhận lại"
                variant="primary"
                size="sm"
                style={styles.actionBtnSmall}
                loading={confirmRegMutation.isPending && confirmRegMutation.variables === reg.id}
                disabled={confirmRegMutation.isPending}
                onPress={() => confirmRegMutation.mutate(reg.id, {
                  onSuccess: () => setNotice({ variant: 'success', message: 'Đã xác nhận lại suất ăn.' }),
                  onError: (error) => setNotice({ variant: 'error', message: error.message }),
                })}
              />
            )}
          </View>}
        </Card>
      );
    },
    [confirmRegMutation, getPerson]
  );

  const renderOptionItem = useCallback(({ item: opt }: { item: MealOption }) => {
    const isPending = opt.status === 'pending';
    const typeLabel =
      opt.type === 'cancel_today'
        ? 'Cắt hôm nay'
        : opt.type === 'cancel_schedule'
        ? 'Cắt theo khoảng'
        : 'Cắt dài hạn';

    return (
      <Card key={opt.id} variant="elevated" padding="md" style={[styles.itemCard, isPending && styles.pendingCard]}>
        <View style={styles.itemHeader}>
          <View style={[styles.avatarBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="document-text" size={16} color="#B45309" />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.userName}>{getPerson(opt).name}</Text>
            <Text style={styles.userUsername}>{typeLabel}</Text>
          </View>
          <Badge
            label={
              opt.status === 'approved'
                ? 'Đã duyệt'
                : opt.status === 'pending'
                ? 'Chờ duyệt'
                : 'Từ chối'
            }
            variant={
              opt.status === 'approved'
                ? 'confirmed'
                : opt.status === 'pending'
                ? 'pending'
                : 'cancelled'
            }
            size="sm"
          />
        </View>

        <View style={styles.itemMetaRow}>
          <Text style={styles.itemMetaText}>
            Từ: {formatBusinessDateDisplay(opt.fromDate)} - Đến:{' '}
            {formatBusinessDateDisplay(opt.toDate)}
          </Text>
        </View>

        {opt.note && <Text style={styles.optNoteText}>Lý do: {opt.note}</Text>}

        {isPending && (
          <View style={styles.itemActionsRow}>
            <Button
              title="Từ chối"
              variant="outline"
              size="sm"
              style={styles.actionBtnSmall}
              onPress={() => setConfirmRejectOptId(opt.id)}
            />
            <Button
              title="Duyệt yêu cầu"
              variant="primary"
              size="sm"
              style={styles.actionBtnSmall}
              onPress={() => setConfirmApproveOptId(opt.id)}
            />
          </View>
        )}
      </Card>
    );
  }, [getPerson]);

  if (!hasAccess) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Đăng Ký & Duyệt Cắt" showBack onBack={() => router.back()} />
        <ForbiddenState
          title="Không có quyền truy cập"
          message={`Tài khoản (${user?.fullName} - ${role}) không có quyền quản lý danh sách đăng ký suất ăn.`}
          onGoBack={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const ListHeader = (
    <View>
      <Header
        title="Quản lý suất ăn"
        subtitle="Theo dõi đăng ký và xử lý yêu cầu cắt suất"
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
        rightAction={activeTab === 'registrations' && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Xuất Excel theo ngày và trạng thái đang chọn"
            style={styles.exportHeaderBtn}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.7}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="download-outline" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
      />

      {/* Tabs */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'registrations' && styles.tabBtnActive]}
            accessibilityRole="tab" accessibilityState={{ selected: activeTab === 'registrations' }}
            onPress={() => { setActiveTab('registrations'); setStatusFilter('all'); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="restaurant-outline"
              size={15}
              color={activeTab === 'registrations' ? colors.primaryDark : colors.textMuted}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'registrations' && styles.tabBtnTextActive,
              ]}
            >
              Đăng ký theo ngày
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'options' && styles.tabBtnActive]}
            accessibilityRole="tab" accessibilityState={{ selected: activeTab === 'options' }}
            onPress={() => { setActiveTab('options'); setStatusFilter('pending'); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={activeTab === 'options' ? colors.primaryDark : colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'options' && styles.tabBtnTextActive]}>
              Yêu cầu cắt ({allOptions.filter((o) => o.status === 'pending').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {notice && <ResultBanner {...notice} onDismiss={() => setNotice(null)} />}
      {activeTab === 'registrations' && (
        <View style={styles.datePanel}>
          <View style={styles.dateNavigation}>
            <TouchableOpacity style={styles.dateArrow} accessibilityRole="button" accessibilityLabel="Ngày trước" onPress={() => changeDate(-1)}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateSelect} accessibilityRole="button" accessibilityLabel="Chọn ngày xem suất ăn" onPress={() => setDatePickerOpen(true)}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateText}>{selectedDate ? `${selectedDate === today ? 'Hôm nay · ' : ''}${formatBusinessDateDisplay(selectedDate)}` : 'Tất cả ngày'}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateArrow} accessibilityRole="button" accessibilityLabel="Ngày sau" onPress={() => changeDate(1)}>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dateShortcuts}>
            <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedDate(today)} style={styles.shortcut}><Text style={styles.shortcutText}>Về hôm nay</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedDate('')} style={styles.shortcut}><Text style={styles.shortcutText}>Xem tất cả ngày</Text></TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.searchBarContainer}>
        <Input value={searchQuery} onChangeText={setSearchQuery}
          accessibilityLabel="Tìm cán bộ" placeholder="Tìm tên, tài khoản hoặc mã cán bộ"
          autoCapitalize="none"
          leftIcon={<Ionicons name="search" size={18} color={colors.textMuted} />}
          rightIcon={searchQuery ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" onPress={() => setSearchQuery('')} style={styles.dateArrow}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity> : undefined}
        />
        <View style={styles.actionButtonsRow}>
          <Button
            title="Đăng ký hộ"
            variant="primary"
            size="sm"
            style={styles.onBehalfBtn}
            onPress={() => {
              setSelectedUserId(0);
              setUserSearch('');
              setNotice(null);
              setSelectedMealId(availableMeals.find((m) => m.mealDate === selectedDate)?.id || availableMeals[0]?.id || 0);
              setGuestCount(0);
              setIsRegisterOnBehalfOpen(true);
            }}
          />
          <Button
            title="Cắt suất hộ"
            variant="outline"
            size="sm"
            style={styles.onBehalfBtn}
            onPress={() => {
              setSelectedUserId(0);
              setUserSearch('');
              setNotice(null);
              const today = formatBusinessDate(new Date());
              setOptionType('cancel_schedule');
              setOptionFromDate(today);
              setOptionToDate(today);
              setOptionNote('');
              setIsOptionOnBehalfOpen(true);
            }}
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.pendingBanner, pendingCount === 0 && styles.noPendingBanner]} accessibilityRole="button" disabled={pendingCount === 0} onPress={() => setStatusFilter('pending')}>
        <Ionicons name={pendingCount ? "time-outline" : "checkmark-circle-outline"} size={20} color={pendingCount ? colors.status.pending.text : colors.primary} />
        <Text style={[styles.pendingText, pendingCount === 0 && styles.noPendingText]}>{pendingCount ? `${pendingCount} yêu cầu chờ duyệt` : 'Không có yêu cầu chờ duyệt'}{activeTab === 'registrations' && selectedDate ? ' trong ngày' : ''}</Text>
        {pendingCount > 0 && <Ionicons name="chevron-forward" size={18} color={colors.status.pending.text} />}
      </TouchableOpacity>
      {/* Filter Status Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {statusItems.map((c) => {
            const isSelected = statusFilter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                accessibilityRole="button" accessibilityState={{ selected: isSelected }}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setStatusFilter(c.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {c.label} ({scope.filter((item) => c.id === 'all' || item.status === c.id).length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <Text style={styles.resultCount}>{activeTab === 'registrations' ? `${filteredRegs.length} đăng ký` : `${filteredOptions.length} yêu cầu`} · Ưu tiên chờ duyệt</Text>
    </View>
  );

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      {activeTab === 'registrations' ? (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={filteredRegs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRegistrationItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            isLoadingRegs ? <LoadingState message="Đang tải đăng ký…" /> : regsError ? <EmptyState title="Chưa tải được đăng ký" actionText="Thử lại" onAction={handleRefresh} /> : <EmptyState
              title="Không tìm thấy đăng ký nào"
              description="Thử chọn ngày khác hoặc bỏ bộ lọc tìm kiếm."
              actionText="Xóa tìm kiếm và trạng thái" onAction={() => { setSearchQuery(''); setStatusFilter('all'); }}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshing={refreshing || isLoadingRegs}
          onRefresh={handleRefresh}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      ) : (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={filteredOptions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOptionItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            isLoadingOptions ? <LoadingState message="Đang tải yêu cầu…" /> : optionsError ? <EmptyState title="Chưa tải được yêu cầu" actionText="Thử lại" onAction={handleRefresh} /> : <EmptyState
              title="Không tìm thấy yêu cầu cắt suất nào"
              description="Thử thay đổi từ khóa hoặc bộ lọc."
              actionText="Xem tất cả yêu cầu" onAction={() => { setSearchQuery(''); setStatusFilter('all'); }}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshing={refreshing || isLoadingOptions}
          onRefresh={handleRefresh}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      <DatePickerModal key={selectedDate || today} visible={datePickerOpen} initialDate={selectedDate || today}
        title="Chọn ngày xem suất ăn" onSelectSingle={setSelectedDate} onClose={() => setDatePickerOpen(false)} />
      {/* Modal Đăng Ký Hộ Cán Bộ */}
      <Modal visible={isRegisterOnBehalfOpen} transparent animationType="slide" onRequestClose={() => setIsRegisterOnBehalfOpen(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalDialog} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đăng ký suất ăn hộ cán bộ</Text>
              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel="Đóng đăng ký hộ"
                style={styles.dateArrow}
                onPress={() => setIsRegisterOnBehalfOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {notice?.variant === 'error' && <ResultBanner {...notice} onDismiss={() => setNotice(null)} />}
            <Text style={styles.formSectionLabel}>1. Chọn Cán bộ nhân viên:</Text>
            <Input value={userSearch} onChangeText={setUserSearch} placeholder="Tìm cán bộ theo tên hoặc tài khoản" accessibilityLabel="Tìm cán bộ để thao tác hộ" />
            {selectableUsers.length === 0 && <Text style={styles.resultCount}>Không tìm thấy cán bộ phù hợp.</Text>}
            <ScrollView style={styles.userSelector} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {selectableUsers.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    accessibilityRole="button" accessibilityState={{ selected: isSelected }}
                    style={[styles.userSelectChip, isSelected && styles.userSelectChipActive]}
                    onPress={() => setSelectedUserId(u.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.userSelectText,
                        isSelected && styles.userSelectTextActive,
                      ]}
                    >
                      {u.fullName} · @{u.username}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.formSectionLabel}>2. Chọn Ngày ăn:</Text>
            <ScrollView horizontal style={styles.selectorScroll} showsHorizontalScrollIndicator={false}>
              {availableMeals.map((m) => {
                const isSelected = selectedMealId === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    accessibilityRole="button" accessibilityState={{ selected: isSelected }}
                    style={[styles.userSelectChip, isSelected && styles.userSelectChipActive]}
                    onPress={() => setSelectedMealId(m.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.userSelectText,
                        isSelected && styles.userSelectTextActive,
                      ]}
                    >
                      {formatBusinessDateDisplay(m.mealDate)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {availableMeals.length === 0 && <Text style={styles.resultCount}>Chưa có ngày ăn đang mở để đăng ký.</Text>}
            <Text style={styles.formSectionLabel}>3. Số khách đi kèm (0-10):</Text>
            <View style={styles.guestBox}>
              <GuestCounter value={guestCount} onChange={setGuestCount} />
            </View>

            <View style={styles.modalActionRow}>
              <Button
                title="Hủy"
                variant="secondary"
                onPress={() => setIsRegisterOnBehalfOpen(false)}
                style={styles.modalBtnHalf}
              />
              <Button
                title="Xác nhận đăng ký"
                variant="primary"
                onPress={handleRegisterOnBehalf}
                loading={registerOnBehalfMutation.isPending}
                disabled={!selectedUserId || !selectedMealId}
                style={styles.modalBtnHalf}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Cắt Suất Hộ Cán Bộ - Tích hợp DatePickerInput */}
      <Modal visible={isOptionOnBehalfOpen} transparent animationType="slide" onRequestClose={() => setIsOptionOnBehalfOpen(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalDialog} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo yêu cầu cắt suất hộ</Text>
              <TouchableOpacity
                accessibilityRole="button" accessibilityLabel="Đóng cắt suất hộ"
                style={styles.dateArrow}
                onPress={() => setIsOptionOnBehalfOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {notice?.variant === 'error' && <ResultBanner {...notice} onDismiss={() => setNotice(null)} />}
            <Text style={styles.formSectionLabel}>1. Chọn Cán bộ:</Text>
            <Input value={userSearch} onChangeText={setUserSearch} placeholder="Tìm cán bộ theo tên hoặc tài khoản" accessibilityLabel="Tìm cán bộ để thao tác hộ" />
            {selectableUsers.length === 0 && <Text style={styles.resultCount}>Không tìm thấy cán bộ phù hợp.</Text>}
            <ScrollView style={styles.userSelector} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {selectableUsers.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    accessibilityRole="button" accessibilityState={{ selected: isSelected }}
                    style={[styles.userSelectChip, isSelected && styles.userSelectChipActive]}
                    onPress={() => setSelectedUserId(u.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.userSelectText,
                        isSelected && styles.userSelectTextActive,
                      ]}
                    >
                      {u.fullName} · @{u.username}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.formSectionLabel}>2. Loại cắt:</Text>
            <View style={styles.typeRow}>
              {[
                { type: 'cancel_schedule' as const, label: 'Theo khoảng ngày' },
                { type: 'cancel_today' as const, label: 'Hôm nay' },
                { type: 'cancel_permanent' as const, label: 'Dài hạn' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.type}
                  accessibilityRole="button" accessibilityState={{ selected: optionType === t.type }}
                  style={[styles.typeChip, optionType === t.type && styles.typeChipActive]}
                  onPress={() => { setOptionType(t.type); if (t.type === 'cancel_today') { setOptionFromDate(today); setOptionToDate(today); } }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      optionType === t.type && styles.typeChipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* DatePickerInputs for accurate calendar picking */}
            <View style={styles.modalRowInputs}>
              <View style={styles.inputHalf}>
                <DatePickerInput
                  label="Từ ngày"
                  disabled={optionType === 'cancel_today'}
                  value={optionFromDate}
                  onChangeDate={setOptionFromDate}
                  placeholder="Chọn ngày..."
                />
              </View>
              <View style={styles.inputHalf}>
                <DatePickerInput
                  label="Đến ngày"
                  disabled={optionType === 'cancel_today'}
                  value={optionToDate}
                  onChangeDate={setOptionToDate}
                  placeholder="Chọn ngày..."
                  minDate={optionFromDate}
                />
              </View>
            </View>

            <Input
              label="Lý do cắt (tùy chọn)"
              value={optionNote}
              onChangeText={setOptionNote}
              placeholder="VD: Đi công tác cơ sở..."
            />

            <View style={styles.modalActionRow}>
              <Button
                title="Hủy"
                variant="secondary"
                onPress={() => setIsOptionOnBehalfOpen(false)}
                style={styles.modalBtnHalf}
              />
              <Button
                title="Tạo yêu cầu"
                variant="primary"
                onPress={handleOptionOnBehalf}
                loading={createOptOnBehalfMutation.isPending}
                disabled={!selectedUserId || !optionFromDate || !optionToDate || optionToDate < optionFromDate}
                style={styles.modalBtnHalf}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        visible={confirmApproveRegId !== null}
        loading={approveRegMutation.isPending}
        title="Duyệt yêu cầu cắt suất"
        message={`${registrationContext(confirmApproveRegId)}. Duyệt cắt suất ăn và khách đi kèm?`}
        confirmText="Duyệt cắt"
        cancelText="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (confirmApproveRegId) {
            await runAction(() => approveRegMutation.mutateAsync(confirmApproveRegId), 'Đã duyệt cắt suất.', () => setConfirmApproveRegId(null));
          }
        }}
        onCancel={() => setConfirmApproveRegId(null)}
      />

      <ConfirmDialog
        visible={confirmRejectRegId !== null}
        loading={rejectRegMutation.isPending}
        title="Từ chối yêu cầu cắt suất"
        message={`${registrationContext(confirmRejectRegId)}. Từ chối yêu cầu và giữ lại suất ăn?`}
        confirmText="Từ chối"
        cancelText="Hủy"
        variant="primary"
        onConfirm={async () => {
          if (confirmRejectRegId) {
            await runAction(() => rejectRegMutation.mutateAsync(confirmRejectRegId), 'Đã từ chối cắt suất.', () => setConfirmRejectRegId(null));
          }
        }}
        onCancel={() => setConfirmRejectRegId(null)}
      />

      <ConfirmDialog
        visible={confirmApproveOptId !== null}
        loading={approveOptMutation.isPending}
        title="Duyệt yêu cầu cắt khoảng"
        message={`${optionContext(confirmApproveOptId)}. Duyệt yêu cầu cắt suất này?`}
        confirmText="Duyệt"
        cancelText="Hủy"
        variant="primary"
        onConfirm={async () => {
          if (confirmApproveOptId) {
            await runAction(() => approveOptMutation.mutateAsync(confirmApproveOptId), 'Đã duyệt yêu cầu cắt suất.', () => setConfirmApproveOptId(null));
          }
        }}
        onCancel={() => setConfirmApproveOptId(null)}
      />

      <ConfirmDialog
        visible={confirmRejectOptId !== null}
        loading={rejectOptMutation.isPending}
        title="Từ chối yêu cầu cắt khoảng"
        message={`${optionContext(confirmRejectOptId)}. Từ chối yêu cầu cắt suất này?`}
        confirmText="Từ chối"
        cancelText="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (confirmRejectOptId) {
            await runAction(() => rejectOptMutation.mutateAsync(confirmRejectOptId), 'Đã từ chối yêu cầu cắt suất.', () => setConfirmRejectOptId(null));
          }
        }}
        onCancel={() => setConfirmRejectOptId(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  datePanel: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginVertical: spacing.sm },
  dateNavigation: { flexDirection: 'row', alignItems: 'center' },
  dateArrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  dateSelect: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, minHeight: 48 },
  dateText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primaryDark },
  dateShortcuts: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.borderLight },
  shortcut: { minHeight: 44, paddingHorizontal: spacing.md, justifyContent: 'center' },
  shortcutText: { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.status.pending.bg, borderRadius: radius.md, padding: spacing.md, marginVertical: spacing.sm, minHeight: 48 },
  pendingText: { flex: 1, fontSize: typography.sizes.sm, color: colors.status.pending.text, fontWeight: typography.weights.semibold },
  noPendingBanner: { backgroundColor: colors.primaryLight },
  noPendingText: { color: colors.primaryDark },
  pendingCard: { borderColor: colors.status.pending.border },
  resultCount: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginVertical: spacing.sm },
  modalContent: { padding: spacing.lg },
  userSelector: { maxHeight: 160, marginBottom: spacing.md },
  scrollContent: {
    padding: 0,
    paddingBottom: spacing['3xl'],
  },
  exportHeaderBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarWrapper: {
    paddingVertical: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: radius.lg,
    padding: 3,
  },
  tabBtn: {
    minHeight: 48,
    paddingHorizontal: spacing.xs,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  searchBarContainer: {
    paddingTop: spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  onBehalfBtn: {
    flex: 1,
    minHeight: 48,
    height: 'auto',
  },
  chipsContainer: {
    paddingVertical: spacing.xs,
  },
  chipsScroll: {
    gap: spacing.xs,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundDark,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  itemCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  userUsername: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemMetaRow: {
    flexWrap: 'wrap',
    gap: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 4,
  },
  itemMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  optNoteText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemActionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  actionBtnSmall: {
    minWidth: 80,
    minHeight: 48,
    height: 'auto',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalDialog: {
    flexGrow: 0,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    maxWidth: 520,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  formSectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  selectorScroll: {
    marginBottom: spacing.sm,
  },
  userSelectChip: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
    marginRight: spacing.xs,
  },
  userSelectChipActive: {
    backgroundColor: colors.primary,
  },
  userSelectText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  userSelectTextActive: {
    color: colors.surface,
    fontWeight: typography.weights.bold,
  },
  guestBox: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtnHalf: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  typeChip: {
    minHeight: 44,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
  },
  typeChipActive: {
    backgroundColor: colors.primaryLight,
  },
  typeChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  modalRowInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputHalf: {
    flex: 1,
  },
});
