/**
 * Soạn & Phát Thông Báo (Admin & Manager)
 * T33: Soạn/gửi thông báo theo người nhận hoặc broadcast đúng contract;
 * xem lại nội dung và đối tượng trước khi gửi.
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
import { useAuth } from '../../src/providers/AuthProvider';
import {
  useAllNotifications,
  useSendNotification,
  useDeleteNotification,
} from '../../src/hooks/useManagementNotifications';
import { useUsersList } from '../../src/hooks/useManagementUsers';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function ManagementNotificationsScreen() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [notifType, setNotifType] = useState<string>('SYSTEM');
  const [targetScope, setTargetScope] = useState<'broadcast' | 'custom'>('broadcast');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const hasAccess = role === 'admin' || role === 'manager';

  const { data: notifications = [], isLoading, refetch } = useAllNotifications();
  const { data: users = [] } = useUsersList();

  const sendMutation = useSendNotification();
  const deleteMutation = useDeleteNotification();

  if (!hasAccess) {
    return (
      <ScreenContainer scrollable={false}>
        <Header title="Phát Thông Báo" showBack onBack={() => router.back()} />
        <ForbiddenState
          title="Không có quyền truy cập"
          message={`Tài khoản (${user?.fullName} - ${role}) không có quyền phát thông báo toàn cơ quan.`}
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

  const toggleUserSelection = (userId: number) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleOpenPreview = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tiêu đề và Nội dung thông báo.');
      return;
    }
    if (targetScope === 'custom' && selectedUserIds.length === 0) {
      Alert.alert('Chưa chọn người nhận', 'Vui lòng chọn ít nhất 1 cán bộ nhận thông báo.');
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleConfirmSend = async () => {
    try {
      await sendMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        url: url.trim() || undefined,
        type: notifType,
        userIds: targetScope === 'custom' ? selectedUserIds : undefined,
      });

      setIsPreviewOpen(false);
      setTitle('');
      setContent('');
      setUrl('');
      setSelectedUserIds([]);
      setTargetScope('broadcast');
      setActiveTab('history');
      Alert.alert('Thành công', 'Thông báo đã được phát thành công.');
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Lỗi phát thông báo', error.message || 'Thao tác thất bại');
    }
  };

  const handleDeleteNotification = async () => {
    if (!deleteTargetId) return;
    await deleteMutation.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.background}>
      <Header
        title="Quản lý & Phát Thông Báo"
        subtitle="Soạn tin, broadcast hoặc gửi đích danh cán bộ"
        showBack
        onBack={() => router.back()}
        userRole={role || undefined}
      />

      {/* Tabs */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'compose' && styles.tabBtnActive]}
            onPress={() => setActiveTab('compose')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="create-outline"
              size={15}
              color={activeTab === 'compose' ? colors.primaryDark : colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'compose' && styles.tabBtnTextActive]}>
              Soạn thông báo mới
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={activeTab === 'history' ? colors.primaryDark : colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
              Lịch sử đã phát ({notifications.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
        {activeTab === 'compose' ? (
          <View style={styles.composeForm}>
            <Card variant="elevated" padding="md" style={styles.formCard}>
              <Text style={styles.formTitle}>Thông tin bản tin thông báo</Text>

              <Input
                label="Tiêu đề thông báo (bắt buộc)"
                value={title}
                onChangeText={setTitle}
                placeholder="VD: Nhắc nhở nộp tiền ăn kỳ tháng 09/2026"
              />

              <Input
                label="Nội dung chi tiết (bắt buộc)"
                value={content}
                onChangeText={setContent}
                placeholder="Nhập nội dung thông báo đầy đủ..."
                multiline
                style={{ height: 90 }}
              />

              {/* Loại thông báo */}
              <Text style={styles.fieldLabel}>Phân loại thông báo:</Text>
              <View style={styles.chipsRow}>
                {[
                  { id: 'SYSTEM', label: 'Hệ thống' },
                  { id: 'PAYMENT_DUE', label: 'Thanh toán' },
                  { id: 'LATE_REGISTRATION', label: 'Bếp ăn' },
                  { id: 'APPROVAL', label: 'Duyệt cắt' },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.chip, notifType === t.id && styles.chipActive]}
                    onPress={() => setNotifType(t.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, notifType === t.id && styles.chipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Đường dẫn liên kết (tùy chọn)"
                value={url}
                onChangeText={setUrl}
                placeholder="VD: /(tabs)/payments hoặc /(tabs)/schedule"
              />
            </Card>

            {/* Phạm vi đối tượng */}
            <Card variant="elevated" padding="md" style={styles.formCard}>
              <Text style={styles.formTitle}>Đối tượng tiếp nhận</Text>

              <View style={styles.scopeRow}>
                <TouchableOpacity
                  style={[styles.scopeBtn, targetScope === 'broadcast' && styles.scopeBtnActive]}
                  onPress={() => setTargetScope('broadcast')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={targetScope === 'broadcast' ? colors.primaryDark : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.scopeBtnText,
                      targetScope === 'broadcast' && styles.scopeBtnTextActive,
                    ]}
                  >
                    Toàn cơ quan (Broadcast)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scopeBtn, targetScope === 'custom' && styles.scopeBtnActive]}
                  onPress={() => setTargetScope('custom')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={targetScope === 'custom' ? colors.primaryDark : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.scopeBtnText,
                      targetScope === 'custom' && styles.scopeBtnTextActive,
                    ]}
                  >
                    Chọn từng cán bộ ({selectedUserIds.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {targetScope === 'custom' && (
                <View style={styles.customUsersList}>
                  <Text style={styles.selectUsersTitle}>Chọn cán bộ cần nhận thông báo:</Text>
                  <View style={styles.usersGrid}>
                    {users.map((u) => {
                      const isChecked = selectedUserIds.includes(u.id);
                      return (
                        <TouchableOpacity
                          key={u.id}
                          style={[styles.userItemCheck, isChecked && styles.userItemCheckActive]}
                          onPress={() => toggleUserSelection(u.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isChecked ? 'checkbox' : 'square-outline'}
                            size={18}
                            color={isChecked ? colors.primary : colors.textMuted}
                          />
                          <Text
                            style={[
                              styles.userItemCheckText,
                              isChecked && styles.userItemCheckTextActive,
                            ]}
                          >
                            {u.fullName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </Card>

            <Button
              title="Xem trước & Phát thông báo"
              variant="primary"
              size="lg"
              onPress={handleOpenPreview}
              style={styles.submitBtn}
            />
          </View>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="Chưa có thông báo nào được phát"
            message="Chuyển sang tab Soạn thông báo để gửi tin tức mới đến cán bộ."
          />
        ) : (
          notifications.map((n) => (
            <Card key={n.id} variant="elevated" padding="md" style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIconBox}>
                  <Ionicons name="megaphone" size={16} color={colors.primaryDark} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{n.title}</Text>
                  <Text style={styles.historyDate}>
                    {n.createdAt.replace('T', ' ').slice(0, 16)} · Người phát:{' '}
                    {n.creatorName || 'Quản trị viên'}
                  </Text>
                </View>
                {role === 'admin' && (
                  <TouchableOpacity
                    style={styles.deleteHistoryBtn}
                    onPress={() => setDeleteTargetId(n.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.historyContent}>{n.content}</Text>
              {n.url && <Text style={styles.historyUrl}>Liên kết: {n.url}</Text>}
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal Xem Trước Trước Khi Gửi (Review & Preview Modal) */}
      <Modal visible={isPreviewOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalDialogTitle}>Xem lại thông báo trước khi phát</Text>
              <TouchableOpacity onPress={() => setIsPreviewOpen(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Tiêu đề:</Text>
              <Text style={styles.previewTitleText}>{title}</Text>

              <Text style={[styles.previewLabel, { marginTop: spacing.sm }]}>Nội dung:</Text>
              <Text style={styles.previewContentText}>{content}</Text>

              <Text style={[styles.previewLabel, { marginTop: spacing.sm }]}>Đối tượng nhận:</Text>
              <View style={styles.targetSummaryRow}>
                <Badge
                  label={
                    targetScope === 'broadcast'
                      ? 'Toàn bộ cán bộ đang hoạt động (Broadcast)'
                      : `${selectedUserIds.length} cán bộ đã chọn`
                  }
                  variant={targetScope === 'broadcast' ? 'confirmed' : 'warning'}
                />
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <Button
                title="Chỉnh sửa lại"
                variant="secondary"
                onPress={() => setIsPreviewOpen(false)}
                style={styles.modalBtnHalf}
              />
              <Button
                title="Xác nhận gửi"
                variant="primary"
                onPress={handleConfirmSend}
                loading={sendMutation.isPending}
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        visible={deleteTargetId !== null}
        title="Xóa thông báo"
        message="Bạn có chắc chắn muốn xóa thông báo này khỏi hệ thống?"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDeleteNotification}
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
  composeForm: {
    gap: spacing.sm,
  },
  formCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  formTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  scopeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundDark,
  },
  scopeBtnActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  scopeBtnText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  scopeBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  customUsersList: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  selectUsersTitle: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  usersGrid: {
    gap: 4,
  },
  userItemCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundDark,
  },
  userItemCheckActive: {
    backgroundColor: colors.primaryLight,
  },
  userItemCheckText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  userItemCheckTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  historyCard: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  historyIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  historyDate: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  deleteHistoryBtn: {
    padding: 6,
  },
  historyContent: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginVertical: 4,
  },
  historyUrl: {
    fontSize: 10,
    color: colors.primary,
    fontStyle: 'italic',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalDialogTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  previewBox: {
    backgroundColor: colors.backgroundDark,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  previewTitleText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 2,
  },
  previewContentText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  targetSummaryRow: {
    marginTop: 4,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtnHalf: {
    flex: 1,
  },
});
