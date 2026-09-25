/**
 * Công Cụ Quản Trị Hệ Thống (Admin Tools)
 * Kích hoạt thủ công Auto-schedule sinh lịch ăn và Chốt hoàn thành suất ăn (Meal Completion)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { ForbiddenState } from '../../src/components/states/ForbiddenState';
import { useAuth } from '../../src/providers/AuthProvider';
import { adminToolsService } from '../../src/services/adminToolsService';
import { formatBusinessDateDisplay } from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function ManagementAdminToolsScreen() {
  const router = useRouter();
  const { user, role, isMockMode } = useAuth();

  const isAdmin = role === 'admin';
  const hasAccess = role === 'admin' || role === 'manager';

  // Form states
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthStr = nextMonthDate.toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedDate, setSelectedDate] = useState(now.toISOString().slice(0, 10));

  // Running states
  const [isRunningSchedule, setIsRunningSchedule] = useState(false);
  const [isRunningCompletion, setIsRunningCompletion] = useState(false);

  // Confirm dialogs
  const [isConfirmScheduleOpen, setIsConfirmScheduleOpen] = useState(false);
  const [isConfirmCompletionOpen, setIsConfirmCompletionOpen] = useState(false);

  if (!hasAccess) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Công cụ Quản trị" showBack onBack={() => router.back()} />
        <ForbiddenState
          title="Không có quyền truy cập"
          message={`Tài khoản (${user?.fullName} - ${role}) không có quyền kích hoạt công cụ quản trị hệ thống.`}
          onGoBack={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const handleRunSchedule = async () => {
    setIsConfirmScheduleOpen(false);
    setIsRunningSchedule(true);
    try {
      const res = await adminToolsService.runAutoSchedule(selectedMonth, isMockMode);
      Alert.alert(
        'Thành công',
        res.message || `Đã sinh lịch và đăng ký ăn tự động thành công cho tháng ${selectedMonth}.`
      );
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi kích hoạt', error.message || 'Chạy job thất bại');
    } finally {
      setIsRunningSchedule(false);
    }
  };

  const handleRunCompletion = async () => {
    setIsConfirmCompletionOpen(false);
    setIsRunningCompletion(true);
    try {
      const res = await adminToolsService.runMealCompletion(selectedDate, isMockMode);
      Alert.alert(
        'Thành công',
        res.message || `Đã chốt hoàn thành các suất ăn cho ngày ${selectedDate}.`
      );
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi kích hoạt', error.message || 'Chạy job thất bại');
    } finally {
      setIsRunningCompletion(false);
    }
  };

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      <Header
        title="Công cụ Quản trị Hệ thống"
        subtitle="Kích hoạt thủ công các tiến trình tự động"
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tool 1: Auto Schedule */}
        <Card variant="elevated" padding="md" style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <View style={[styles.toolIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="calendar" size={22} color={colors.primaryDark} />
            </View>
            <View style={styles.toolHeaderText}>
              <Text style={styles.toolTitle}>Sinh lịch ăn & Đăng ký tự động</Text>
              <Text style={styles.toolSubtitle}>API: POST /api/admin-tools/run-auto-schedule</Text>
            </View>
          </View>

          <Text style={styles.toolDesc}>
            Tiến trình này sẽ tự động tạo các ngày bếp ăn trong tháng theo cấu hình lịch thứ và tự
            động đăng ký suất ăn mặc định cho tất cả cán bộ nhân viên đang hoạt động (trừ các ngày
            nghỉ lễ hoặc đã báo cắt suất).
          </Text>

          <Text style={styles.sectionLabel}>Chọn tháng cần tạo lịch:</Text>
          <View style={styles.monthChipsRow}>
            {[currentMonthStr, nextMonthStr].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.monthChip, selectedMonth === m && styles.monthChipActive]}
                onPress={() => setSelectedMonth(m)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === m && styles.monthChipTextActive,
                  ]}
                >
                  Tháng {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Hoặc nhập tháng tùy ý (YYYY-MM)"
            value={selectedMonth}
            onChangeText={setSelectedMonth}
            placeholder="2026-10"
          />

          <Button
            title="Kích hoạt sinh lịch ăn"
            variant="primary"
            size="md"
            loading={isRunningSchedule}
            onPress={() => setIsConfirmScheduleOpen(true)}
            style={styles.actionBtn}
          />
        </Card>

        {/* Tool 2: Meal Completion (Admin only) */}
        {isAdmin && (
          <Card variant="elevated" padding="md" style={styles.toolCard}>
            <View style={styles.toolHeader}>
              <View style={[styles.toolIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="checkmark-done-circle" size={22} color="#B45309" />
              </View>
              <View style={styles.toolHeaderText}>
                <Text style={styles.toolTitle}>Chốt suất ăn hoàn thành (Completion)</Text>
                <Text style={styles.toolSubtitle}>
                  API: POST /api/admin-tools/run-meal-completion
                </Text>
              </View>
            </View>

            <Text style={styles.toolDesc}>
              Chuyển toàn bộ suất ăn đang ở trạng thái <Text style={styles.boldText}>Confirmed</Text>{' '}
              của ngày được chọn sang trạng thái <Text style={styles.boldText}>Completed</Text> sau
              khi bữa trưa kết thúc để phục vụ tính phí và thống kê báo cáo.
            </Text>

            <Input
              label="Ngày cần chốt suất ăn (YYYY-MM-DD)"
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="VD: 2026-09-25"
            />

            <Button
              title="Chốt trạng thái hoàn thành"
              variant="outline"
              size="md"
              loading={isRunningCompletion}
              onPress={() => setIsConfirmCompletionOpen(true)}
              style={styles.actionBtn}
            />
          </Card>
        )}
      </ScrollView>

      {/* Confirm Schedule Dialog */}
      <ConfirmDialog
        visible={isConfirmScheduleOpen}
        title="Xác nhận sinh lịch tự động"
        message={`Bạn có chắc chắn muốn kích hoạt sinh lịch ăn và đăng ký tự động cho tháng ${selectedMonth}? Hệ thống sẽ bỏ qua các ngày trùng đã có.`}
        confirmText="Kích hoạt ngay"
        cancelText="Hủy"
        variant="primary"
        onConfirm={handleRunSchedule}
        onCancel={() => setIsConfirmScheduleOpen(false)}
      />

      {/* Confirm Completion Dialog */}
      <ConfirmDialog
        visible={isConfirmCompletionOpen}
        title="Xác nhận chốt hoàn thành suất ăn"
        message={`Bạn có chắc chắn muốn chuyển toàn bộ suất ăn ngày ${formatBusinessDateDisplay(
          selectedDate
        )} sang trạng thái Đã hoàn thành (Completed)?`}
        confirmText="Chốt ngay"
        cancelText="Hủy"
        variant="primary"
        onConfirm={handleRunCompletion}
        onCancel={() => setIsConfirmCompletionOpen(false)}
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
  toolCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  toolIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  toolHeaderText: {
    flex: 1,
  },
  toolTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  toolSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  toolDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  monthChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  monthChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
  },
  monthChipActive: {
    backgroundColor: colors.primaryLight,
  },
  monthChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  monthChipTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  actionBtn: {
    marginTop: spacing.sm,
  },
  boldText: {
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
