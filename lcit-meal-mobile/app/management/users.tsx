/**
 * Quản lý Người Dùng & Vai Trò (Admin & Manager)
 * T32: Danh sách người dùng cho manager/admin; tạo/sửa/trạng thái/role chỉ cho admin;
 * hoàn thiện validation và kiểm tra trùng username.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
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
import { PasswordInput } from '../../src/components/common/PasswordInput';
import { ConfirmDialog } from '../../src/components/common/ConfirmDialog';
import { ForbiddenState } from '../../src/components/states/ForbiddenState';
import { EmptyState } from '../../src/components/states/EmptyState';
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '../../src/hooks/useManagementUsers';
import { userService } from '../../src/services/userService';
import { extractUserRole } from '../../src/types/auth';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';
import { User, UserRole } from '../../src/types';

export default function ManagementUsersScreen() {
  const router = useRouter();
  const { user: currentUser, role, isMockMode } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = role === 'admin';
  const hasAccess = role === 'admin' || role === 'manager';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoleId, setFormRoleId] = useState<number>(3); // Default 3: employee
  const [formStatus, setFormStatus] = useState<string>('active');

  // Username validation state
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const { data: users = [], isLoading, refetch } = useUsersList();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // Check username availability when typing in create modal
  useEffect(() => {
    if (!isCreateOpen || !formUsername.trim()) {
      const resetTimer = setTimeout(() => {
        setUsernameError('');
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    if (formUsername.includes(' ')) {
      const errTimer = setTimeout(() => {
        setUsernameError('Tên đăng nhập không được chứa dấu cách');
      }, 0);
      return () => clearTimeout(errTimer);
    }

    if (formUsername.length < 3) {
      const errTimer = setTimeout(() => {
        setUsernameError('Tên đăng nhập tối thiểu 3 ký tự');
      }, 0);
      return () => clearTimeout(errTimer);
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await userService.checkAvailability(formUsername.trim(), undefined, isMockMode);
        if (!res.available) {
          setUsernameError(res.message || 'Tên đăng nhập đã tồn tại trong hệ thống');
        } else {
          setUsernameError('');
        }
      } catch {
        setUsernameError('');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formUsername, isCreateOpen, isMockMode]);

  if (!hasAccess) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Người Dùng & Vai Trò" showBack onBack={() => router.back()} />
        <ForbiddenState
          title="Không có quyền truy cập"
          message={`Tài khoản (${currentUser?.fullName} - ${role}) không có quyền quản trị người dùng.`}
          onGoBack={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredUsers = users.filter((u) => {
    const userRole = extractUserRole(u);
    const matchRole = roleFilter === 'all' || userRole === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !searchQuery ||
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));
    return matchRole && matchQuery;
  });

  const handleCreateUser = async () => {
    if (!formFullName.trim() || !formUsername.trim() || !formPassword.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Họ tên, Tên đăng nhập và Mật khẩu.');
      return;
    }
    if (usernameError) {
      Alert.alert('Lỗi tên đăng nhập', usernameError);
      return;
    }

    try {
      await createMutation.mutateAsync({
        fullName: formFullName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        roleId: formRoleId,
        status: formStatus,
      });
      setIsCreateOpen(false);
      setFormFullName('');
      setFormUsername('');
      setFormPassword('');
      setFormEmail('');
      setFormPhone('');
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi tạo người dùng', error.message || 'Thao tác thất bại');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        data: {
          fullName: formFullName.trim() || undefined,
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          roleId: formRoleId,
          status: formStatus,
          password: formPassword.trim() || undefined,
        },
      });
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi cập nhật', error.message || 'Thao tác thất bại');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetId) return;
    await deleteMutation.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  };

  const getRoleBadgeVariant = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'kitchen':
        return 'completed';
      default:
        return 'confirmed';
    }
  };

  const getRoleDisplayName = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản lý bếp';
      case 'kitchen':
        return 'Nhân viên bếp';
      default:
        return 'Cán bộ nhân viên';
    }
  };

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      <Header
        title="Quản lý Người Dùng & Vai Trò"
        subtitle={isAdmin ? 'Tạo tài khoản, phân quyền Role và trạng thái' : 'Danh sách cán bộ cơ quan (Chỉ xem)'}
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
        rightAction={
          isAdmin ? (
            <TouchableOpacity
              style={styles.addHeaderBtn}
              onPress={() => {
                setFormFullName('');
                setFormUsername('');
                setFormPassword('123456');
                setFormEmail('');
                setFormPhone('');
                setFormRoleId(3);
                setFormStatus('active');
                setUsernameError('');
                setIsCreateOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add" size={22} color={colors.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Search Input */}
      <View style={styles.searchBarWrapper}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm theo họ tên, tên đăng nhập, SĐT..."
          style={styles.searchInput}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'admin', label: 'Admin' },
            { id: 'manager', label: 'Quản lý' },
            { id: 'employee', label: 'Cán bộ' },
            { id: 'kitchen', label: 'Bếp' },
          ].map((c) => {
            const isSelected = roleFilter === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setRoleFilter(c.id)}
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

      {/* Users List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy người dùng nào"
            message="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò."
          />
        ) : (
          filteredUsers.map((u) => {
            const userRole = extractUserRole(u);
            const isActive = String(u.status) === 'active' || String(u.status) === '1';
            return (
              <Card key={u.id} variant="elevated" padding="md" style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.avatarCircle}>
                    <Ionicons
                      name={
                        userRole === 'admin'
                          ? 'shield-checkmark'
                          : userRole === 'manager'
                          ? 'briefcase'
                          : 'person'
                      }
                      size={18}
                      color={colors.primaryDark}
                    />
                  </View>

                  <View style={styles.userInfoCol}>
                    <Text style={styles.fullNameText}>{u.fullName}</Text>
                    <Text style={styles.usernameText}>@{u.username}</Text>
                  </View>

                  <View style={styles.badgesCol}>
                    <Badge
                      label={getRoleDisplayName(userRole)}
                      variant={getRoleBadgeVariant(userRole)}
                      size="sm"
                    />
                  </View>
                </View>

                {/* Contact info */}
                <View style={styles.metaRow}>
                  {u.phone && (
                    <Text style={styles.metaText}>
                      <Ionicons name="call-outline" size={12} color={colors.textMuted} /> {u.phone}
                    </Text>
                  )}
                  {u.email && (
                    <Text style={styles.metaText}>
                      <Ionicons name="mail-outline" size={12} color={colors.textMuted} /> {u.email}
                    </Text>
                  )}
                  <Text style={[styles.metaText, { color: isActive ? '#15803D' : '#DC2626' }]}>
                    • {isActive ? 'Hoạt động' : 'Đã khóa'}
                  </Text>
                </View>

                {/* Admin Actions */}
                {isAdmin && (
                  <View style={styles.userFooter}>
                    <TouchableOpacity
                      style={styles.actionBtnSmall}
                      onPress={() => {
                        setSelectedUser(u);
                        setFormFullName(u.fullName);
                        setFormEmail(u.email || '');
                        setFormPhone(u.phone || '');
                        setFormStatus(String(u.status));
                        const rId =
                          userRole === 'admin' ? 1 : userRole === 'manager' ? 2 : userRole === 'kitchen' ? 4 : 3;
                        setFormRoleId(rId);
                        setFormPassword('');
                        setIsEditOpen(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color={colors.primary} />
                      <Text style={styles.actionBtnText}>Sửa / Đổi vai trò</Text>
                    </TouchableOpacity>

                    {u.id !== currentUser?.id && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => setDeleteTargetId(u.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Modal Thêm Người Dùng Mới (Admin only) */}
      <Modal visible={isCreateOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo tài khoản người dùng mới</Text>
              <TouchableOpacity onPress={() => setIsCreateOpen(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Họ và tên cán bộ (bắt buộc)"
                value={formFullName}
                onChangeText={setFormFullName}
                placeholder="VD: Nguyễn Văn Nam"
              />

              <Input
                label="Tên đăng nhập (bắt buộc)"
                value={formUsername}
                onChangeText={setFormUsername}
                placeholder="VD: nam_nv"
                autoCapitalize="none"
              />
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : isCheckingUsername ? (
                <Text style={styles.checkingText}>Đang kiểm tra tên đăng nhập...</Text>
              ) : null}

              <PasswordInput
                label="Mật khẩu khởi tạo"
                value={formPassword}
                onChangeText={setFormPassword}
                placeholder="Nhập mật khẩu..."
              />

              <Text style={styles.sectionLabel}>Phân quyền vai trò:</Text>
              <View style={styles.rolePickerRow}>
                {[
                  { id: 3, label: 'Cán bộ (Employee)' },
                  { id: 2, label: 'Quản lý (Manager)' },
                  { id: 1, label: 'Admin' },
                  { id: 4, label: 'Bếp (Kitchen)' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.roleChip, formRoleId === r.id && styles.roleChipActive]}
                    onPress={() => setFormRoleId(r.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        formRoleId === r.id && styles.roleChipTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Số điện thoại (tùy chọn)"
                value={formPhone}
                onChangeText={setFormPhone}
                placeholder="0901234567"
                keyboardType="phone-pad"
              />

              <Input
                label="Email (tùy chọn)"
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="nam.nv@lcit.vn"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.modalActionRow}>
                <Button
                  title="Hủy"
                  variant="secondary"
                  onPress={() => setIsCreateOpen(false)}
                  style={styles.modalBtnHalf}
                />
                <Button
                  title="Tạo tài khoản"
                  variant="primary"
                  onPress={handleCreateUser}
                  loading={createMutation.isPending}
                  style={styles.modalBtnHalf}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Sửa Người Dùng (Admin only) */}
      <Modal visible={isEditOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa tài khoản</Text>
              <TouchableOpacity onPress={() => setIsEditOpen(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.usernameInfo}>
                Tài khoản: <Text style={styles.boldText}>@{selectedUser?.username}</Text>
              </Text>

              <Input
                label="Họ và tên cán bộ"
                value={formFullName}
                onChangeText={setFormFullName}
              />

              <Text style={styles.sectionLabel}>Phân quyền vai trò:</Text>
              <View style={styles.rolePickerRow}>
                {[
                  { id: 3, label: 'Cán bộ (Employee)' },
                  { id: 2, label: 'Quản lý (Manager)' },
                  { id: 1, label: 'Admin' },
                  { id: 4, label: 'Bếp (Kitchen)' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.roleChip, formRoleId === r.id && styles.roleChipActive]}
                    onPress={() => setFormRoleId(r.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        formRoleId === r.id && styles.roleChipTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Trạng thái tài khoản:</Text>
              <View style={styles.statusRow}>
                {[
                  { id: 'active', label: 'Hoạt động' },
                  { id: 'locked', label: 'Khóa tài khoản' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.roleChip, formStatus === s.id && styles.roleChipActive]}
                    onPress={() => setFormStatus(s.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        formStatus === s.id && styles.roleChipTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <PasswordInput
                label="Đặt lại mật khẩu mới (nếu cần)"
                value={formPassword}
                onChangeText={setFormPassword}
                placeholder="Để trống nếu không đổi"
              />

              <Input
                label="Số điện thoại"
                value={formPhone}
                onChangeText={setFormPhone}
                keyboardType="phone-pad"
              />

              <Input
                label="Email"
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.modalActionRow}>
                <Button
                  title="Hủy"
                  variant="secondary"
                  onPress={() => setIsEditOpen(false)}
                  style={styles.modalBtnHalf}
                />
                <Button
                  title="Lưu thay đổi"
                  variant="primary"
                  onPress={handleUpdateUser}
                  loading={updateMutation.isPending}
                  style={styles.modalBtnHalf}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        visible={deleteTargetId !== null}
        title="Xóa tài khoản người dùng"
        message="Bạn có chắc chắn muốn xóa tài khoản này? Hành động này sẽ loại bỏ quyền truy cập của người dùng."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTargetId(null)}
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
  addHeaderBtn: {
    padding: spacing.xs,
  },
  searchBarWrapper: {
    position: 'relative',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  searchIcon: {
    position: 'absolute',
    left: 24,
    top: 22,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 34,
    height: 42,
  },
  clearBtn: {
    position: 'absolute',
    right: 24,
    top: 22,
    zIndex: 1,
  },
  chipsRow: {
    paddingVertical: spacing.xs,
  },
  chipsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundDark,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  userCard: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userInfoCol: {
    flex: 1,
  },
  fullNameText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  usernameText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badgesCol: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.xs,
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold,
  },
  deleteBtn: {
    padding: 6,
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
  usernameInfo: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  rolePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  roleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
  },
  roleChipActive: {
    backgroundColor: colors.primaryLight,
  },
  roleChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  roleChipTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  errorText: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  checkingText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtnHalf: {
    flex: 1,
  },
  boldText: {
    fontWeight: typography.weights.bold,
  },
});
