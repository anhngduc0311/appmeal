/**
 * Showcase Screen - Thư viện Component & Design System
 * Trang tổng hợp kiểm thử tất cả các Component và Trạng thái của Giai đoạn 1:
 * - Nút (Buttons), Ô nhập (Input, PasswordInput)
 * - Badges trạng thái có cả Nhãn và Màu sắc
 * - MealCard, Bộ đếm khách (GuestCounter), Hộp thoại xác nhận (ConfirmDialog)
 * - Biểu ngữ kết quả (ResultBanner), DatePickerModal
 * - Các trạng thái trang: LoadingState, EmptyState, ErrorState, OfflineState, ForbiddenState, SessionExpiredModal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../src/components/common/ScreenContainer';
import { Header } from '../src/components/common/Header';
import { Card } from '../src/components/common/Card';
import { Button } from '../src/components/common/Button';
import { Input } from '../src/components/common/Input';
import { PasswordInput } from '../src/components/common/PasswordInput';
import { Badge } from '../src/components/common/Badge';
import { ConfirmDialog } from '../src/components/common/ConfirmDialog';
import { ResultBanner } from '../src/components/common/ResultBanner';
import { MealCard } from '../src/components/meals/MealCard';
import { GuestCounter } from '../src/components/meals/GuestCounter';
import { DatePickerModal } from '../src/components/meals/DatePickerModal';
import { LoadingState } from '../src/components/states/LoadingState';
import { EmptyState } from '../src/components/states/EmptyState';
import { ErrorState } from '../src/components/states/ErrorState';
import { OfflineState } from '../src/components/states/OfflineState';
import { ForbiddenState } from '../src/components/states/ForbiddenState';
import { SessionExpiredModal } from '../src/components/states/SessionExpiredModal';
import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { typography } from '../src/theme/typography';
import { formatBusinessDate } from '../src/utils/formatters';

export default function ComponentShowcaseScreen() {
  // States cho interactive testing
  const [guestCount, setGuestCount] = useState(2);
  const [inputText, setInputText] = useState('');
  const [passwordText, setPasswordText] = useState('Secret123');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatBusinessDate(new Date()));

  return (
    <ScreenContainer scrollable backgroundColor={colors.background}>
      <Header
        title="Thư viện Component"
        subtitle="Giai đoạn 1 — Design Tokens & UI Kit"
        showBack
      />

      {/* 1. NÚT BẤM (BUTTONS) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Nút bấm (Button Variants & Sizes)</Text>
        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text style={styles.subTitle}>Biến thể (Variants):</Text>
          <View style={styles.buttonStack}>
            <Button title="Primary Button (Xanh lá chính)" variant="primary" />
            <Button title="Secondary Button (Nền phụ)" variant="secondary" />
            <Button title="Outline Button (Viền xanh)" variant="outline" />
            <Button title="Danger Button (Cắt suất / Xóa)" variant="danger" />
            <Button title="Ghost Button" variant="ghost" />
          </View>

          <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Trạng thái (States):</Text>
          <View style={styles.buttonRow}>
            <Button title="Đang xử lý" variant="primary" loading style={styles.flexBtn} />
            <Button title="Bị khóa" variant="primary" disabled style={styles.flexBtn} />
          </View>

          <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Kích thước (Sizes):</Text>
          <View style={styles.buttonRow}>
            <Button title="Size SM (36px)" size="sm" />
            <Button title="Size MD (48px chuẩn)" size="md" />
          </View>
        </Card>
      </View>

      {/* 2. Ô NHẬP LIỆU (INPUTS) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Ô nhập liệu (Inputs & Password)</Text>
        <Card variant="elevated" padding="lg" style={styles.card}>
          <Input
            label="Ô nhập văn bản tiêu chuẩn"
            placeholder="Nhập tên đăng nhập hoặc họ tên..."
            value={inputText}
            onChangeText={setInputText}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            helperText="Chiều cao tối thiểu 48px, viền xanh khi focus."
          />

          <Input
            label="Ô nhập có thông báo lỗi"
            placeholder="Nhập thông tin..."
            value="Dữ liệu không hợp lệ"
            error="Trường này là bắt buộc và phải đúng định dạng."
            leftIcon={<Ionicons name="alert-circle-outline" size={20} color={colors.status.cancelled.dot} />}
          />

          <PasswordInput
            label="Ô nhập mật khẩu (Có ẩn/hiện)"
            placeholder="Nhập mật khẩu của bạn..."
            value={passwordText}
            onChangeText={setPasswordText}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />
        </Card>
      </View>

      {/* 3. NHÃN TRẠNG THÁI (BADGES) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Nhãn trạng thái (Status Badges: Nhãn + Màu)</Text>
        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text style={styles.subTitle}>Trạng thái Suất ăn (Meal Registration):</Text>
          <View style={styles.badgeRow}>
            <Badge type="mealRegistration" value="confirmed" />
            <Badge type="mealRegistration" value="pending" />
            <Badge type="mealRegistration" value="completed" />
            <Badge type="mealRegistration" value="cancelled" />
            <Badge type="mealRegistration" isMealCancelled />
          </View>

          <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Trạng thái Thanh toán (Payment):</Text>
          <View style={styles.badgeRow}>
            <Badge type="payment" value="paid" />
            <Badge type="payment" value="unpaid" />
            <Badge type="payment" value="overdue" />
          </View>

          <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Vai trò (Roles):</Text>
          <View style={styles.badgeRow}>
            <Badge type="role" value="admin" />
            <Badge type="role" value="manager" />
            <Badge type="role" value="employee" />
            <Badge type="role" value="kitchen" />
          </View>
        </Card>
      </View>

      {/* 4. MEAL CARD & BỘ ĐẾM KHÁCH */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Card suất ăn & Bộ đếm khách</Text>
        <MealCard
          dateStr={formatBusinessDate(new Date())}
          meal={{
            id: 999,
            mealDate: formatBusinessDate(new Date()),
            isCancelled: false,
            status: 'active',
            note: 'Bữa trưa: Bò lúc lắc khoai tây, Canh kim chi thịt heo',
          }}
          registration={{
            id: 888,
            userId: 1,
            mealId: 999,
            guestCount: 2,
            status: 'confirmed',
          }}
          onRegister={() => {}}
          onCancel={() => setDialogVisible(true)}
          onUpdateGuests={() => {}}
        />

        <GuestCounter
          value={guestCount}
          onChange={setGuestCount}
          style={{ marginTop: spacing.md }}
        />
      </View>

      {/* 5. BIỂU NGỮ THÔNG BÁO (RESULT BANNERS) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Biểu ngữ kết quả (Result Banners)</Text>
        <ResultBanner
          variant="success"
          title="Thành công"
          message="Yêu cầu đăng ký suất ăn của bạn đã được ghi nhận."
          onDismiss={() => {}}
        />
        <ResultBanner
          variant="warning"
          title="Lưu ý quan trọng"
          message="Hôm nay đã quá giờ chốt cắt suất trực tiếp (08:00)."
        />
        <ResultBanner
          variant="error"
          title="Không thể thực hiện"
          message="Máy chủ phản hồi lỗi 409: Đăng ký suất ăn đã tồn tại."
          actionText="Thử lại"
          onAction={() => {}}
        />
        <ResultBanner
          variant="info"
          title="Thông tin"
          message="Nhà bếp đã cập nhật thực đơn tuần mới trên hệ thống."
        />
      </View>

      {/* 6. HỘP THOẠI & MODAL (DIALOGS) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Hộp thoại xác nhận & DatePicker</Text>
        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.buttonStack}>
            <Button
              title="Mở ConfirmDialog (Cắt suất)"
              variant="outline"
              onPress={() => setDialogVisible(true)}
            />
            <Button
              title="Mở DatePickerModal (Chọn ngày/khoảng)"
              variant="outline"
              onPress={() => setDateModalVisible(true)}
            />
            <Button
              title="Mở SessionExpiredModal (Hết phiên)"
              variant="danger"
              onPress={() => setSessionExpiredVisible(true)}
            />
          </View>
        </Card>
      </View>

      {/* 7. CÁC TRẠNG THÁI TRANG (STATES) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Các trạng thái trang (Page States)</Text>

        <Text style={styles.subTitle}>Trạng thái Đang tải (LoadingState):</Text>
        <Card variant="flat" padding="md" style={styles.stateContainer}>
          <LoadingState message="Đang tải danh sách món ăn hôm nay..." />
        </Card>

        <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Trạng thái Trống (EmptyState):</Text>
        <Card variant="flat" padding="md" style={styles.stateContainer}>
          <EmptyState
            title="Chưa có lịch ăn trong tuần"
            description="Nhà bếp chưa cập nhật lịch ăn cho tuần này. Vui lòng quay lại sau."
            actionText="Tải lại dữ liệu"
            onAction={() => {}}
          />
        </Card>

        <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Trạng thái Lỗi (ErrorState):</Text>
        <Card variant="flat" padding="md" style={styles.stateContainer}>
          <ErrorState
            title="Không thể tải lịch ăn"
            message="Máy chủ đang bảo trì hoặc mạng gián đoạn. Vui lòng thử lại."
            onRetry={() => {}}
          />
        </Card>

        <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Trạng thái Mất mạng (OfflineState):</Text>
        <Card variant="flat" padding="md" style={styles.stateContainer}>
          <OfflineState onRetry={() => {}} onEnableMock={() => {}} />
        </Card>

        <Text style={[styles.subTitle, { marginTop: spacing.md }]}>Trạng thái Không có quyền (ForbiddenState):</Text>
        <Card variant="flat" padding="md" style={styles.stateContainer}>
          <ForbiddenState onGoBack={() => {}} />
        </Card>
      </View>

      {/* Modals test */}
      <ConfirmDialog
        visible={dialogVisible}
        title="Xác nhận cắt suất ăn"
        message="Bạn có chắc muốn hủy suất ăn ngày hôm nay không?"
        isDestructive
        confirmText="Đồng ý cắt"
        cancelText="Giữ lại"
        iconName="close-circle-outline"
        onConfirm={() => setDialogVisible(false)}
        onCancel={() => setDialogVisible(false)}
      />

      <DatePickerModal
        visible={dateModalVisible}
        mode="single"
        initialDate={selectedDate}
        onSelectSingle={(d) => setSelectedDate(d)}
        onClose={() => setDateModalVisible(false)}
      />

      <SessionExpiredModal
        visible={sessionExpiredVisible}
        onLoginAgain={() => setSessionExpiredVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
  },
  buttonStack: {
    gap: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  flexBtn: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stateContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
