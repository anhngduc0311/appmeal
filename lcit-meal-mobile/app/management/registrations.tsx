/**
 * Quản lý Đăng Ký Suất Ăn & Duyệt Cắt Suất (Admin & Manager)
 * T30, T36: Tìm/lọc/phân trang danh sách suất ăn, duyệt/từ chối pending (tách biệt registration và meal-option),
 * thao tác đăng ký/cắt hộ đúng quyền, xuất báo cáo Excel có xác thực và chia sẻ file.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
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
import { formatBusinessDateDisplay } from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';
import { MealOptionType } from '../../src/types';

export default function ManagementRegistrationsScreen() {
  const router = useRouter();
  const { user, role, isMockMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'registrations' | 'options'>('registrations');
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
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
    refetch: refetchRegs,
  } = useManagementRegistrations();

  const {
    data: allOptions = [],
    isLoading: isLoadingOptions,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRegs(), refetchOptions()]);
    setRefreshing(false);
  };

  // Filter logic
  const filteredRegs = allRegistrations.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchQuery =
      !searchQuery ||
      (r.user?.fullName && r.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.user?.username && r.user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.mealDate && r.mealDate.includes(searchQuery));
    return matchStatus && matchQuery;
  });

  const filteredOptions = allOptions.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchQuery =
      !searchQuery ||
      (o.user?.fullName && o.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.user?.username && o.user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportService.exportMealRegistrations(
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
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
    await registerOnBehalfMutation.mutateAsync({
      userId: selectedUserId,
      mealId: selectedMealId,
      guestCount,
    });
    setIsRegisterOnBehalfOpen(false);
    setSelectedUserId(0);
    setSelectedMealId(0);
    setGuestCount(0);
  };

  const handleOptionOnBehalf = async () => {
    if (!selectedUserId || !optionFromDate.trim() || !optionToDate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn Cán bộ và khoảng ngày cắt.');
      return;
    }
    await createOptOnBehalfMutation.mutateAsync({
      userId: selectedUserId,
      type: optionType,
      fromDate: optionFromDate.trim(),
      toDate: optionToDate.trim(),
      note: optionNote.trim() || undefined,
    });
    setIsOptionOnBehalfOpen(false);
    setSelectedUserId(0);
    setOptionFromDate('');
    setOptionToDate('');
    setOptionNote('');
  };

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      <Header
        title="Quản lý Đăng Ký & Duyệt Cắt"
        subtitle="Tổng hợp suất ăn, duyệt cắt và thao tác hộ"
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
        rightAction={
          <TouchableOpacity
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
        }
      />

      {/* Tabs */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'registrations' && styles.tabBtnActive]}
            onPress={() => setActiveTab('registrations')}
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
              Suất ăn ngày ({allRegistrations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'options' && styles.tabBtnActive]}
            onPress={() => setActiveTab('options')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={activeTab === 'options' ? colors.primaryDark : colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'options' && styles.tabBtnTextActive]}>
              Yêu cầu cắt khoảng ({allOptions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Actions Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo tên cán bộ, username, ngày..."
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.actionButtonsRow}>
          <Button
            title="Đăng ký hộ"
            variant="primary"
            size="sm"
            style={styles.onBehalfBtn}
            onPress={() => {
              if (users.length > 0) setSelectedUserId(users[0].id);
              if (meals.length > 0) setSelectedMealId(meals[0].id);
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
              if (users.length > 0) setSelectedUserId(users[0].id);
              const today = new Date().toISOString().slice(0, 10);
              setOptionFromDate(today);
              setOptionToDate(today);
              setOptionNote('');
              setIsOptionOnBehalfOpen(true);
            }}
          />
        </View>
      </View>

      {/* Filter Status Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ duyệt' },
            { id: 'confirmed', label: 'Đã xác nhận' },
            { id: 'cancelled', label: 'Đã hủy' },
            { id: 'completed', label: 'Đã ăn xong' },
          ].map((c) => {
            const isSelected = statusFilter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setStatusFilter(c.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List Container */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingRegs || isLoadingOptions}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {activeTab === 'registrations' ? (
          filteredRegs.length === 0 ? (
            <EmptyState
              title="Không tìm thấy đăng ký nào"
              message="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."
            />
          ) : (
            filteredRegs.map((reg) => {
              const isPending = reg.status === 'pending';
              return (
                <Card key={reg.id} variant="elevated" padding="md" style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.avatarBox}>
                      <Ionicons name="person" size={16} color={colors.primaryDark} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.userName}>{reg.user?.fullName || 'Cán bộ'}</Text>
                      <Text style={styles.userUsername}>@{reg.user?.username || 'user'}</Text>
                    </View>
                    <Badge
                      label={
                        reg.status === 'confirmed'
                          ? 'Đã xác nhận'
                          : reg.status === 'pending'
                          ? 'Chờ duyệt cắt'
                          : reg.status === 'cancelled'
                          ? 'Đã hủy'
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
                        {formatBusinessDateDisplay(reg.mealDate || '')}
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
                  <View style={styles.itemActionsRow}>
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
                        onPress={() => confirmRegMutation.mutate(reg.id)}
                      />
                    )}
                  </View>
                </Card>
              );
            })
          )
        ) : filteredOptions.length === 0 ? (
          <EmptyState
            title="Không tìm thấy yêu cầu cắt suất nào"
            message="Thử thay đổi từ khóa hoặc bộ lọc."
          />
        ) : (
          filteredOptions.map((opt) => {
            const isPending = opt.status === 'pending';
            const typeLabel =
              opt.type === 'cancel_today'
                ? 'Cắt hôm nay'
                : opt.type === 'cancel_schedule'
                ? 'Cắt theo khoảng'
                : 'Cắt dài hạn';

            return (
              <Card key={opt.id} variant="elevated" padding="md" style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={[styles.avatarBox, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="document-text" size={16} color="#B45309" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.userName}>{opt.user?.fullName || 'Cán bộ'}</Text>
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
          })
        )}
      </ScrollView>

      {/* Modal Đăng Ký Hộ Cán Bộ */}
      <Modal visible={isRegisterOnBehalfOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đăng ký suất ăn hộ cán bộ</Text>
              <TouchableOpacity
                onPress={() => setIsRegisterOnBehalfOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.formSectionLabel}>1. Chọn Cán bộ nhân viên:</Text>
            <ScrollView horizontal style={styles.selectorScroll} showsHorizontalScrollIndicator={false}>
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
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
                      {u.fullName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.formSectionLabel}>2. Chọn Ngày ăn:</Text>
            <ScrollView horizontal style={styles.selectorScroll} showsHorizontalScrollIndicator={false}>
              {meals.slice(0, 10).map((m) => {
                const isSelected = selectedMealId === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
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
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Cắt Suất Hộ Cán Bộ */}
      <Modal visible={isOptionOnBehalfOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo yêu cầu cắt suất hộ</Text>
              <TouchableOpacity
                onPress={() => setIsOptionOnBehalfOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.formSectionLabel}>1. Chọn Cán bộ:</Text>
            <ScrollView horizontal style={styles.selectorScroll} showsHorizontalScrollIndicator={false}>
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
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
                      {u.fullName}
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
                  style={[styles.typeChip, optionType === t.type && styles.typeChipActive]}
                  onPress={() => setOptionType(t.type)}
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

            <View style={styles.modalRowInputs}>
              <View style={styles.inputHalf}>
                <Input
                  label="Từ ngày (YYYY-MM-DD)"
                  value={optionFromDate}
                  onChangeText={setOptionFromDate}
                  placeholder="2026-09-25"
                />
              </View>
              <View style={styles.inputHalf}>
                <Input
                  label="Đến ngày (YYYY-MM-DD)"
                  value={optionToDate}
                  onChangeText={setOptionToDate}
                  placeholder="2026-09-30"
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
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        visible={confirmApproveRegId !== null}
        title="Duyệt yêu cầu cắt suất"
        message="Xác nhận duyệt cắt suất ăn này? Trạng thái sẽ chuyển sang Đã hủy (Cancelled)."
        confirmText="Duyệt cắt"
        cancelText="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (confirmApproveRegId) {
            await approveRegMutation.mutateAsync(confirmApproveRegId);
            setConfirmApproveRegId(null);
          }
        }}
        onCancel={() => setConfirmApproveRegId(null)}
      />

      <ConfirmDialog
        visible={confirmRejectRegId !== null}
        title="Từ chối yêu cầu cắt suất"
        message="Xác nhận từ chối cắt suất? Suất ăn sẽ tiếp tục giữ trạng thái Đã xác nhận (Confirmed)."
        confirmText="Từ chối"
        cancelText="Hủy"
        variant="primary"
        onConfirm={async () => {
          if (confirmRejectRegId) {
            await rejectRegMutation.mutateAsync(confirmRejectRegId);
            setConfirmRejectRegId(null);
          }
        }}
        onCancel={() => setConfirmRejectRegId(null)}
      />

      <ConfirmDialog
        visible={confirmApproveOptId !== null}
        title="Duyệt yêu cầu cắt khoảng"
        message="Xác nhận duyệt yêu cầu cắt suất khoảng ngày này cho cán bộ?"
        confirmText="Duyệt"
        cancelText="Hủy"
        variant="primary"
        onConfirm={async () => {
          if (confirmApproveOptId) {
            await approveOptMutation.mutateAsync(confirmApproveOptId);
            setConfirmApproveOptId(null);
          }
        }}
        onCancel={() => setConfirmApproveOptId(null)}
      />

      <ConfirmDialog
        visible={confirmRejectOptId !== null}
        title="Từ chối yêu cầu cắt khoảng"
        message="Xác nhận từ chối yêu cầu cắt suất khoảng ngày này?"
        confirmText="Từ chối"
        cancelText="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (confirmRejectOptId) {
            await rejectOptMutation.mutateAsync(confirmRejectOptId);
            setConfirmRejectOptId(null);
          }
        }}
        onCancel={() => setConfirmRejectOptId(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  exportHeaderBtn: {
    padding: spacing.xs,
  },
  tabBarWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: radius.lg,
    padding: 3,
  },
  tabBtn: {
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  searchInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 34,
    height: 44,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: spacing.sm,
    top: 14,
    zIndex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  onBehalfBtn: {
    flex: 1,
    height: 36,
  },
  chipsContainer: {
    paddingVertical: spacing.xs,
  },
  chipsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundDark,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  chipTextSelected: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  itemCard: {
    marginBottom: spacing.xs,
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
  },
  userName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  userUsername: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 4,
  },
  itemMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  optNoteText: {
    fontSize: 11,
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
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalDialog: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
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
    fontSize: 11,
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
    fontSize: 10,
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
