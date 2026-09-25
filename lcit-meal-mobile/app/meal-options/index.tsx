/**
 * Screen: Cắt suất theo yêu cầu & Lịch sử - T15, T22, T25
 * - Tạo yêu cầu cắt suất: Cắt hôm nay (cancel_today), Cắt theo khoảng (cancel_schedule), Cắt dài hạn (cancel_permanent)
 * - Cả 3 loại được hệ thống tự động duyệt (Approved) theo đúng API hiện tại
 * - Xem danh sách lịch sử các yêu cầu đã gửi
 * - Khóa nút khi mutation đang chạy
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { DatePickerModal } from '../../src/components/meals/DatePickerModal';
import { ResultBanner } from '../../src/components/common/ResultBanner';
import { EmptyState } from '../../src/components/states/EmptyState';
import {
  useMyMealOptions,
  useCreateMealOptionMutation,
} from '../../src/hooks/useMealsData';
import { MealOptionType } from '../../src/types';
import {
  formatBusinessDate,
  formatDisplayDate,
} from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function MealOptionsScreen() {
  const todayStr = formatBusinessDate(new Date());

  // Tab: 'create' | 'history'
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form states
  const [optionType, setOptionType] = useState<MealOptionType>('cancel_schedule');
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{
    variant: 'success' | 'error';
    text: string;
  } | null>(null);

  // Queries & Mutations
  const { data: options = [], isLoading: loadingOptions, refetch: refetchOptions } = useMyMealOptions();
  const createMutation = useCreateMealOptionMutation();

  const handleSubmit = async () => {
    if (!fromDate) {
      setBannerMessage({ variant: 'error', text: 'Vui lòng chọn ngày bắt đầu cắt suất.' });
      return;
    }

    const finalToDate =
      optionType === 'cancel_today'
        ? fromDate
        : optionType === 'cancel_permanent'
        ? '2099-12-31'
        : toDate || fromDate;

    try {
      await createMutation.mutateAsync({
        type: optionType,
        fromDate,
        toDate: finalToDate,
        note: note.trim() || undefined,
      });

      setBannerMessage({
        variant: 'success',
        text:
          optionType === 'cancel_permanent'
            ? `Đã tạo yêu cầu cắt suất dài hạn từ ${formatDisplayDate(fromDate)} thành công!`
            : `Đã cắt suất ăn từ ${formatDisplayDate(fromDate)} đến ${formatDisplayDate(finalToDate)} thành công!`,
      });

      setNote('');
      setActiveTab('history');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo yêu cầu cắt suất thất bại.';
      Alert.alert('Lỗi thao tác', msg);
    }
  };

  const handleSelectDateRange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  };

  const handleSelectSingleDate = (d: string) => {
    setFromDate(d);
    setToDate(d);
  };

  return (
    <ScreenContainer
      scrollable
      refreshing={loadingOptions}
      onRefresh={refetchOptions}
      backgroundColor={colors.background}
    >
      <Header
        title="Yêu cầu cắt suất"
        subtitle="Cắt suất hôm nay, theo khoảng ngày hoặc dài hạn"
        showBack
      />

      {bannerMessage && (
        <ResultBanner
          variant={bannerMessage.variant}
          message={bannerMessage.text}
          onDismiss={() => setBannerMessage(null)}
        />
      )}

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('create')}
          style={[styles.tabBtn, activeTab === 'create' && styles.tabBtnActive]}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'create' && styles.tabBtnTextActive,
            ]}
          >
            Tạo yêu cầu mới
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('history')}
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'history' && styles.tabBtnTextActive,
            ]}
          >
            Lịch sử ({options.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. TAB TẠO YÊU CẦU MỚI */}
      {activeTab === 'create' ? (
        <View style={styles.formContainer}>
          {/* Chọn loại cắt suất */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text style={styles.fieldLabel}>1. Chọn loại cắt suất:</Text>

            <View style={styles.typeGrid}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setOptionType('cancel_today');
                  setFromDate(todayStr);
                  setToDate(todayStr);
                }}
                style={[
                  styles.typeOption,
                  optionType === 'cancel_today' && styles.typeOptionActive,
                ]}
              >
                <Ionicons
                  name="today-outline"
                  size={22}
                  color={optionType === 'cancel_today' ? colors.primaryDark : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTitle,
                    optionType === 'cancel_today' && styles.typeTitleActive,
                  ]}
                >
                  Cắt hôm nay
                </Text>
                <Text style={styles.typeDesc}>Chỉ cắt bữa trưa hôm nay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOptionType('cancel_schedule')}
                style={[
                  styles.typeOption,
                  optionType === 'cancel_schedule' && styles.typeOptionActive,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={optionType === 'cancel_schedule' ? colors.primaryDark : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTitle,
                    optionType === 'cancel_schedule' && styles.typeTitleActive,
                  ]}
                >
                  Cắt theo khoảng
                </Text>
                <Text style={styles.typeDesc}>Từ ngày đến ngày</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOptionType('cancel_permanent')}
                style={[
                  styles.typeOption,
                  optionType === 'cancel_permanent' && styles.typeOptionActive,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={optionType === 'cancel_permanent' ? colors.primaryDark : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTitle,
                    optionType === 'cancel_permanent' && styles.typeTitleActive,
                  ]}
                >
                  Cắt dài hạn
                </Text>
                <Text style={styles.typeDesc}>Nghỉ phép dài hạn</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Chọn thời gian */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text style={styles.fieldLabel}>2. Thời gian hiệu lực:</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDateModalVisible(true)}
              style={styles.datePickerTrigger}
            >
              <View style={styles.dateTriggerRow}>
                <Ionicons name="calendar" size={22} color={colors.primary} />
                <View style={styles.dateTriggerTextCol}>
                  <Text style={styles.dateTriggerSub}>Khoảng ngày đã chọn:</Text>
                  <Text style={styles.dateTriggerMain}>
                    {optionType === 'cancel_today'
                      ? formatDisplayDate(todayStr)
                      : optionType === 'cancel_permanent'
                      ? `Bắt đầu từ ${formatDisplayDate(fromDate)} (dài hạn)`
                      : `Từ ${formatDisplayDate(fromDate)} đến ${formatDisplayDate(toDate || fromDate)}`}
                  </Text>
                </View>
              </View>
              <Text style={styles.changeDateText}>Thay đổi</Text>
            </TouchableOpacity>
          </Card>

          {/* Nhập lý do */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text style={styles.fieldLabel}>3. Lý do / Ghi chú (không bắt buộc):</Text>
            <Input
              placeholder="Ví dụ: Đi công tác tại cảng, Nghỉ phép..."
              value={note}
              onChangeText={setNote}
              leftIcon={
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />
          </Card>

          {/* Thông tin quy định duyệt */}
          <View style={styles.policyNotice}>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.confirmed.dot} />
            <Text style={styles.policyText}>
              Yêu cầu cắt suất sẽ được <Text style={styles.policyBold}>tự động duyệt ngay</Text> và đồng bộ hủy các suất ăn tương ứng trong khoảng ngày đã chọn.
            </Text>
          </View>

          {/* Nút gửi yêu cầu */}
          <Button
            title="Xác nhận gửi yêu cầu cắt suất"
            variant="primary"
            size="lg"
            loading={createMutation.isPending}
            disabled={createMutation.isPending}
            onPress={handleSubmit}
            fullWidth
            style={styles.submitBtn}
          />
        </View>
      ) : (
        /* 2. TAB LỊCH SỬ YÊU CẦU */
        <View style={styles.historyContainer}>
          {options.length > 0 ? (
            options.map((item) => {
              const typeLabel =
                item.type === 'cancel_today'
                  ? 'Cắt hôm nay'
                  : item.type === 'cancel_schedule'
                  ? 'Cắt theo khoảng'
                  : 'Cắt dài hạn';

              return (
                <Card
                  key={item.id}
                  variant="elevated"
                  padding="lg"
                  style={styles.historyCard}
                >
                  <View style={styles.historyHeader}>
                    <View>
                      <Text style={styles.historyType}>{typeLabel}</Text>
                      <Text style={styles.historyDates}>
                        {formatDisplayDate(item.fromDate)} → {formatDisplayDate(item.toDate)}
                      </Text>
                    </View>
                    <Badge type="mealOption" value={item.status} size="sm" />
                  </View>

                  {item.note && (
                    <Text style={styles.historyNote}>
                      Lý do: <Text style={styles.historyNoteContent}>{item.note}</Text>
                    </Text>
                  )}

                  {item.createdAt && (
                    <Text style={styles.historyTime}>
                      Tạo lúc: {item.createdAt}
                    </Text>
                  )}
                </Card>
              );
            })
          ) : (
            <EmptyState
              iconName="document-text-outline"
              title="Chưa có yêu cầu cắt suất nào"
              description="Bạn chưa tạo yêu cầu cắt suất ăn nào trước đây."
              actionText="Tạo yêu cầu ngay"
              onAction={() => setActiveTab('create')}
            />
          )}
        </View>
      )}

      {/* DatePicker Modal */}
      <DatePickerModal
        visible={dateModalVisible}
        mode={optionType === 'cancel_schedule' ? 'range' : 'single'}
        title={
          optionType === 'cancel_today'
            ? 'Chọn ngày cắt'
            : optionType === 'cancel_permanent'
            ? 'Chọn ngày bắt đầu cắt dài hạn'
            : 'Chọn khoảng ngày cắt suất'
        }
        onSelectSingle={handleSelectSingleDate}
        onSelectRange={handleSelectDateRange}
        onClose={() => setDateModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  formContainer: {
    paddingBottom: spacing['3xl'],
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeGrid: {
    gap: spacing.sm,
  },
  typeOption: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeOptionActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary,
  },
  typeTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 4,
  },
  typeTitleActive: {
    color: colors.primaryDark,
  },
  typeDesc: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  dateTriggerTextCol: {
    flex: 1,
  },
  dateTriggerSub: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
  },
  dateTriggerMain: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 2,
  },
  changeDateText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.confirmed.bg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  policyText: {
    fontSize: typography.sizes.xs,
    color: colors.status.confirmed.text,
    flex: 1,
    lineHeight: 18,
  },
  policyBold: {
    fontWeight: typography.weights.bold,
  },
  submitBtn: {
    marginBottom: spacing.xl,
  },
  historyContainer: {
    paddingBottom: spacing['3xl'],
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  historyType: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  historyDates: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  historyNote: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  historyNoteContent: {
    color: colors.text,
    fontStyle: 'italic',
  },
  historyTime: {
    fontSize: typography.sizes['2xs'],
    color: colors.textMuted,
    marginTop: 4,
  },
});
