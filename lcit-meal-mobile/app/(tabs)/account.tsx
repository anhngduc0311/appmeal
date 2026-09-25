/**
 * Tab Screen - Tài khoản (Account)
 * Hồ sơ cá nhân, đổi vai trò thử nghiệm, chuyển chế độ Dữ liệu Mẫu/API thật,
 * điều hướng đến trang Quản lý (nếu có quyền) và Đăng xuất.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
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
import { mockUsers } from '../../src/mocks/fixtures';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function AccountScreen() {
  const router = useRouter();
  const { user, role, useMockData, setUseMockData, switchMockUser, logout } =
    useAuth();

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
      </Card>

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

      {/* Cài đặt & Tiện ích thử nghiệm (Giai đoạn 1 & 2) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Môi trường & Thử nghiệm</Text>

        <Card variant="elevated" padding="lg" style={styles.settingsCard}>
          {/* Toggle Chế độ Mock */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Chế độ Dữ liệu Mẫu (Mock)</Text>
              <Text style={styles.settingDesc}>
                {useMockData
                  ? 'Đang dùng dữ liệu cục bộ giả lập (Offline Demo)'
                  : 'Đang kết nối backend API thật (/api)'}
              </Text>
            </View>
            <Switch
              value={useMockData}
              onValueChange={setUseMockData}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={useMockData ? colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          {/* Chọn tài khoản test */}
          <Text style={styles.subHeading}>Chuyển nhanh tài khoản test:</Text>
          <View style={styles.mockUsersGrid}>
            {mockUsers.map((u) => {
              const isCurrent = user?.id === u.id;
              return (
                <TouchableOpacity
                  key={u.id}
                  activeOpacity={0.7}
                  onPress={() => switchMockUser(u.id)}
                  style={[
                    styles.mockUserChip,
                    isCurrent && styles.mockUserChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mockUserChipText,
                      isCurrent && styles.mockUserChipTextActive,
                    ]}
                  >
                    {u.fullName.split(' ').slice(-1)[0]} ({u.role})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Link đến Showcase */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/component-showcase')}
            style={styles.showcaseBtn}
          >
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
            <Text style={styles.showcaseBtnText}>
              Mở Thư viện Component (Showcase)
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </Card>
      </View>

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
  settingsCard: {
    backgroundColor: colors.surface,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  settingDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  subHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mockUsersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  mockUserChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mockUserChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  mockUserChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  mockUserChipTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
  showcaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  showcaseBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primaryDark,
    flex: 1,
    marginLeft: spacing.sm,
  },
  logoutBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  },
});
