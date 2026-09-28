/**
 * Cấu Hình Hệ Thống (Admin Only)
 * T34: Lịch thứ trong tuần, giờ đóng, các key được hỗ trợ, upload QR thanh toán;
 * phân biệt cập nhật từng mục và lưu toàn bộ.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ForbiddenState } from '../../src/components/states/ForbiddenState';
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useSystemSettings,
  useMealScheduleDays,
  useBulkUpdateSettings,
  useUpdateScheduleDays,
} from '../../src/hooks/useManagementSettings';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';
import { MealScheduleDayConfig } from '../../src/types';

const DAY_NAMES = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

export default function ManagementSettingsScreen() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = role === 'admin';

  // Days state
  const [days, setDays] = useState<MealScheduleDayConfig[]>([
    { dayOfWeek: 0, isEnabled: false, notes: 'Chủ nhật nghỉ' },
    { dayOfWeek: 1, isEnabled: true, notes: 'Bữa trưa đầu tuần' },
    { dayOfWeek: 2, isEnabled: true, notes: 'Bữa trưa thứ 3' },
    { dayOfWeek: 3, isEnabled: true, notes: 'Bữa trưa thứ 4' },
    { dayOfWeek: 4, isEnabled: true, notes: 'Bữa trưa thứ 5' },
    { dayOfWeek: 5, isEnabled: true, notes: 'Bữa trưa thứ 6' },
    { dayOfWeek: 6, isEnabled: false, notes: 'Thứ 7 nghỉ' },
  ]);

  // Settings values state
  const [mealPrice, setMealPrice] = useState('30000');
  const [guestPrice, setGuestPrice] = useState('35000');
  const [closeTime, setCloseTime] = useState('08:00');
  const [completionTime, setCompletionTime] = useState('12:00');
  const [paymentQrUrl, setPaymentQrUrl] = useState('');

  const { data: rawSettings = [], refetch: refetchSettings } = useSystemSettings();
  const { data: daysResponse, refetch: refetchDays } = useMealScheduleDays();

  const bulkUpdateMutation = useBulkUpdateSettings();
  const updateDaysMutation = useUpdateScheduleDays();

  // Populate data when query loads
  useEffect(() => {
    if (daysResponse?.days && daysResponse.days.length > 0) {
      const timer = setTimeout(() => {
        setDays(daysResponse.days);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [daysResponse]);

  useEffect(() => {
    if (rawSettings.length > 0) {
      const timer = setTimeout(() => {
        const mp = rawSettings.find((s) => s.settingKey === 'meal_price');
        if (mp) setMealPrice(mp.settingValue);

        const gp = rawSettings.find((s) => s.settingKey === 'guest_meal_price');
        if (gp) setGuestPrice(gp.settingValue);

        const ct = rawSettings.find((s) => s.settingKey === 'registration_close_time');
        if (ct) setCloseTime(ct.settingValue);

        const comp = rawSettings.find((s) => s.settingKey === 'meal_completion_time');
        if (comp) setCompletionTime(comp.settingValue);

        const qr = rawSettings.find((s) => s.settingKey === 'payment_qr_image');
        if (qr) setPaymentQrUrl(qr.settingValue);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [rawSettings]);

  if (!isAdmin) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Cấu hình hệ thống" showBack onBack={() => router.back()} />
        <ForbiddenState
          title="Chỉ dành cho Quản trị viên"
          message={`Tài khoản (${user?.fullName} - ${role}) không có quyền thay đổi cấu hình hệ thống.`}
          onGoBack={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSettings(), refetchDays()]);
    setRefreshing(false);
  };

  const toggleDay = (dayOfWeek: number) => {
    setDays((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isEnabled: !d.isEnabled } : d))
    );
  };

  const handleSaveDays = async () => {
    try {
      await updateDaysMutation.mutateAsync(days);
      Alert.alert('Thành công', 'Đã lưu cấu hình các ngày ăn trong tuần.');
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi lưu lịch thứ', error.message || 'Thao tác thất bại');
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      await bulkUpdateMutation.mutateAsync([
        { settingKey: 'meal_price', settingValue: mealPrice },
        { settingKey: 'guest_meal_price', settingValue: guestPrice },
        { settingKey: 'registration_close_time', settingValue: closeTime },
        { settingKey: 'meal_completion_time', settingValue: completionTime },
        { settingKey: 'payment_qr_image', settingValue: paymentQrUrl },
      ]);
      Alert.alert('Thành công', 'Đã lưu cấu hình chung của hệ thống.');
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi lưu cấu hình', error.message || 'Thao tác thất bại');
    }
  };

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      <Header
        title="Cấu hình Hệ thống"
        subtitle="Lịch thứ, giờ đóng đăng ký, đơn giá & mã QR"
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Phần 1: Lịch thứ trong tuần */}
        <Card variant="elevated" padding="md" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>1. Các ngày ăn trong tuần</Text>
              <Text style={styles.sectionSubtitle}>
                Bật/tắt các ngày nhà bếp phục vụ nấu ăn mặc định
              </Text>
            </View>
            <Button
              title="Lưu lịch thứ"
              variant="outline"
              size="sm"
              loading={updateDaysMutation.isPending}
              onPress={handleSaveDays}
            />
          </View>

          <View style={styles.daysList}>
            {days.map((d) => {
              const isEnabled = Boolean(d.isEnabled);
              return (
                <View key={d.dayOfWeek} style={styles.dayRow}>
                  <View style={styles.dayInfo}>
                    <Text style={[styles.dayName, isEnabled && styles.dayNameActive]}>
                      {DAY_NAMES[d.dayOfWeek]}
                    </Text>
                    <Text style={styles.dayNotes}>{d.notes || 'Không có ghi chú'}</Text>
                  </View>

                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleDay(d.dayOfWeek)}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={isEnabled ? colors.primary : '#F4F3F4'}
                  />
                </View>
              );
            })}
          </View>
        </Card>

        {/* Phần 2: Đơn giá & Khung giờ */}
        <Card variant="elevated" padding="md" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>2. Đơn giá & Thời gian cắt suất</Text>
              <Text style={styles.sectionSubtitle}>Thiết lập giá tiền và giờ chốt danh sách</Text>
            </View>
            <Button
              title="Lưu cài đặt"
              variant="primary"
              size="sm"
              loading={bulkUpdateMutation.isPending}
              onPress={handleSaveGeneralSettings}
            />
          </View>

          <View style={styles.inputsGrid}>
            <View style={styles.rowInputs}>
              <View style={styles.halfCol}>
                <Input
                  label="Giá suất cán bộ (VND)"
                  value={mealPrice}
                  onChangeText={setMealPrice}
                  keyboardType="numeric"
                  placeholder="30000"
                />
              </View>
              <View style={styles.halfCol}>
                <Input
                  label="Giá suất khách (VND)"
                  value={guestPrice}
                  onChangeText={setGuestPrice}
                  keyboardType="numeric"
                  placeholder="35000"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfCol}>
                <Input
                  label="Giờ đóng báo suất (HH:mm)"
                  value={closeTime}
                  onChangeText={setCloseTime}
                  placeholder="08:00"
                />
              </View>
              <View style={styles.halfCol}>
                <Input
                  label="Giờ chốt hoàn thành (HH:mm)"
                  value={completionTime}
                  onChangeText={setCompletionTime}
                  placeholder="12:00"
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Phần 3: Mã QR thanh toán */}
        <Card variant="elevated" padding="md" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Mã QR Thanh Toán Ngân Hàng</Text>
          <Text style={styles.sectionSubtitle}>
            Hiển thị cho cán bộ quét chuyển khoản khi xem khoản thanh toán
          </Text>

          <Input
            label="URL hình ảnh mã QR ngân hàng"
            value={paymentQrUrl}
            onChangeText={setPaymentQrUrl}
            placeholder="VD: https://lcit.vn/static/qr-bank.png"
          />

          {paymentQrUrl ? (
            <View style={styles.qrPreviewBox}>
              <Text style={styles.qrPreviewLabel}>Xem trước mã QR:</Text>
              <Image
                source={{ uri: paymentQrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          ) : null}

          <Button
            title="Cập nhật mã QR"
            variant="outline"
            size="md"
            style={styles.saveQrBtn}
            loading={bulkUpdateMutation.isPending}
            onPress={handleSaveGeneralSettings}
          />
        </Card>
      </ScrollView>
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
  sectionCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionHeaderRow: {
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
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  daysList: {
    gap: spacing.xs,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  dayNameActive: {
    color: colors.primaryDark,
  },
  dayNotes: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  inputsGrid: {
    marginTop: spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfCol: {
    flex: 1,
  },
  qrPreviewBox: {
    alignItems: 'center',
    marginVertical: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundDark,
    borderRadius: radius.lg,
  },
  qrPreviewLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  qrImage: {
    width: 140,
    height: 140,
    borderRadius: radius.md,
  },
  saveQrBtn: {
    marginTop: spacing.xs,
  },
});
