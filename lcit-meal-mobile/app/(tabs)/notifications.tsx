import { formatDateTime } from '../../src/utils/formatters';
/**
 * Tab Screen - Thông báo (Notifications) - T17, T23
 * Danh sách thông báo cá nhân, đếm số thông báo chưa đọc và đánh dấu đã xem
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { EmptyState } from '../../src/components/states/EmptyState';
import {
  useMyNotifications,
  useMarkNotificationSeenMutation,
  useMarkAllNotificationsSeenMutation,
} from '../../src/hooks/useNotificationsData';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

export default function NotificationsScreen() {
  // Queries & Mutations
  const {
    data: notifications = [],
    isLoading: loadingNotifications,
    refetch: refetchNotifications,
  } = useMyNotifications();

  const markSeenMutation = useMarkNotificationSeenMutation();
  const markAllSeenMutation = useMarkAllNotificationsSeenMutation();

  const handleRefresh = async () => {
    await refetchNotifications();
  };

  const handleMarkAsSeen = (id: number) => {
    markSeenMutation.mutate(id);
  };

  const handleMarkAllAsSeen = () => {
    markAllSeenMutation.mutate();
  };

  const unreadCount = notifications.filter((n) => !n.isSeen).length;

  return (
    <ScreenContainer
      scrollable
      refreshing={loadingNotifications}
      onRefresh={handleRefresh}
      backgroundColor={colors.background}
    >
      <Header
        title="Thông báo"
        subtitle={unreadCount > 0 ? `Bạn có ${unreadCount} thông báo mới` : 'Hộp thư thông báo của bạn'}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAllAsSeen}
              style={styles.markAllBtn}
            >
              <Text style={styles.markAllText}>Đã đọc tất cả</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.listContainer}>
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const isUnread = !item.isSeen;

            return (
              <Card
                key={item.id}
                variant="elevated"
                padding="lg"
                onPress={() => handleMarkAsSeen(item.id)}
                style={[
                  styles.notifCard,
                  isUnread && styles.notifCardUnread,
                ]}
              >
                <View style={styles.cardRow}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconCircle,
                      isUnread ? styles.iconCircleUnread : styles.iconCircleRead,
                    ]}
                  >
                    <Ionicons
                      name={
                        item.type === 'PAYMENT_DUE' || item.type === 'PAYMENT_OVERDUE'
                          ? 'wallet-outline'
                          : item.type === 'APPROVAL'
                          ? 'checkmark-done-circle-outline'
                          : 'information-circle-outline'
                      }
                      size={20}
                      color={isUnread ? colors.primaryDark : colors.textMuted}
                    />
                  </View>

                  {/* Nội dung */}
                  <View style={styles.contentCol}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notifTitle,
                          isUnread && styles.notifTitleUnread,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {isUnread && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notifBody}>{item.content}</Text>
                    <Text style={styles.notifTime}>{formatDateTime(item.createdAt)}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            iconName="notifications-off-outline"
            title="Không có thông báo nào"
            description="Bạn đã đọc hết các thông báo từ nhà bếp và quản trị hệ thống."
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  markAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  markAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: spacing['2xl'],
  },
  notifCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  notifCardUnread: {
    backgroundColor: '#F7FCF9',
    borderColor: colors.primary300,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconCircleUnread: {
    backgroundColor: colors.primaryLight,
  },
  iconCircleRead: {
    backgroundColor: colors.surfaceSubtle,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.xs,
  },
  notifTitleUnread: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
