/**
 * Common Component - ConfirmDialog
 * Hộp thoại xác nhận thao tác (Cắt suất, Đăng xuất, Lưu thay đổi...)
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
  iconName?: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDestructive = false,
  loading = false,
  iconName,
  children,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialogCard, shadows.lg]}>
              {iconName && (
                <View
                  style={[
                    styles.iconCircle,
                    isDestructive ? styles.iconCircleDanger : styles.iconCirclePrimary,
                  ]}
                >
                  <Ionicons
                    name={iconName as any}
                    size={28}
                    color={
                      isDestructive
                        ? colors.status.cancelled.dot
                        : colors.primary
                    }
                  />
                </View>
              )}

              <Text style={styles.title}>{title}</Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {children && <View style={styles.customContentBox}>{children}</View>}

              <View style={styles.buttonRow}>
                <Button
                  title={cancelText}
                  variant="secondary"
                  size="md"
                  disabled={loading}
                  onPress={onCancel}
                  style={styles.actionButton}
                />
                <Button
                  title={confirmText}
                  variant={isDestructive ? 'danger' : 'primary'}
                  size="md"
                  loading={loading}
                  onPress={onConfirm}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCirclePrimary: {
    backgroundColor: colors.primaryLight,
  },
  iconCircleDanger: {
    backgroundColor: colors.status.cancelled.bg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  customContentBox: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
