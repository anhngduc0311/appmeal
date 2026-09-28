/**
 * Tab Screen - Tài khoản (Account) - T18, T21, T26
 * Hồ sơ cá nhân, đổi vai trò thử nghiệm, chuyển chế độ Dữ liệu Mẫu/API thật,
 * cấu hình API URL cho emulator/thiết bị thật, điều hướng đến trang Quản lý (nếu có quyền) và Đăng xuất.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function AccountScreen() {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const isStaffManager = role === 'admin' || role === 'manager';

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer scrollable backgroundColor={colors.background}>
      <Header title="Tài khoản cá nhân" />

      {/* Profile Card */}
      <Card variant="elevated" padding="xl" style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'Người dùng'}</Text>
            <Text style={styles.profileUsername}>@{user?.username || 'user'}</Text>
            <View style={styles.badgeWrapper}>
              <Badge type="role" value={role || 'employee'} size="sm" />
            </View>
          </View>
        </View>

        <View style={styles.contactInfoBox}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.contactText}>
              {user?.email || 'Chưa cập nhật email'}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.contactText}>
              {user?.phone || 'Chưa cập nhật SĐT'}
            </Text>
          </View>
        </View>

        {/* Nút sửa thông tin */}
        <Button
          title="Chỉnh sửa thông tin & Đổi mật khẩu"
          variant="outline"
          size="sm"
          leftIcon={<Ionicons name="create-outline" size={16} color={colors.primary} />}
          onPress={() => router.push('/profile/edit' as any)}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {/* Menu Nghiệp vụ Suất ăn */}
      {role !== 'kitchen' && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nghiệp vụ suất ăn</Text>
        <Card
          variant="elevated"
          padding="lg"
          onPress={() => router.push('/meal-options' as any)}
          style={styles.adminEntryCard}
        >
          <View style={styles.menuItemRow}>
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar-outline" size={22} color="#B45309" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Yêu cầu cắt suất ăn</Text>
              <Text style={styles.menuItemSubtitle}>
                Cắt suất theo ngày / khoảng và xem lịch sử yêu cầu
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      </View>
      )}
      {/* Khu vực Quản trị / Quản lý (Chỉ hiển thị với Admin & Manager) */}
      {isStaffManager && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chức năng Quản lý</Text>
          <Card
            variant="elevated"
            padding="lg"
            onPress={() => router.push('/management')}
            style={styles.adminEntryCard}
          >
            <View style={styles.menuItemRow}>
              <View style={[styles.menuIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="shield-checkmark" size={22} color="#1D4ED8" />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Bảng điều khiển Quản lý</Text>
                <Text style={styles.menuItemSubtitle}>
                  Lịch bếp, danh sách suất ăn và phê duyệt
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Card>
        </View>
      )}



      {/* Nút Đăng xuất */}
      <Button
        title="Đăng xuất"
        variant="danger"
        size="lg"
        leftIcon={
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.textInverse}
          />
        }
        onPress={() => setLogoutModalVisible(true)}
        fullWidth
        style={styles.logoutBtn}
      />


      {/* Modal xác nhận Đăng xuất */}
      <ConfirmDialog
        visible={logoutModalVisible}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng LCIT Meal không?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        isDestructive
        iconName="log-out-outline"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  profileUsername: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
  },
  contactInfoBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  adminEntryCard: {
    backgroundColor: colors.surface,
    borderColor: '#93C5FD',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: spacing.md,
    marginBottom: spacing['3xl'],
  },
});
