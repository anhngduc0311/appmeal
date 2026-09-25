/**
 * Meal Component - MealCard
 * Thẻ hiển thị thông tin suất ăn cho từng ngày:
 * - Thứ & ngày tháng rõ ràng
 * - Trạng thái suất ăn cá nhân (có cả nhãn tiếng Việt và màu tương ứng)
 * - Tình trạng bếp (hoạt động / bếp nghỉ)
 * - Số lượng khách ăn kèm
 * - Các nút thao tác nhanh: Đăng ký, Đổi khách, Cắt suất
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Meal, MealRegistration } from '../../types';
import {
  formatFullDisplayDate,
  formatBusinessDate,
} from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

export interface MealCardProps {
  dateStr: string;
  meal?: Meal;
  registration?: MealRegistration;
  onRegister?: (mealId: number) => void;
  onCancel?: (registrationId: number) => void;
  onUpdateGuests?: (mealId: number, currentGuests: number) => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const MealCard: React.FC<MealCardProps> = ({
  dateStr,
  meal,
  registration,
  onRegister,
  onCancel,
  onUpdateGuests,
  onPress,
  style,
}) => {
  const isMealCancelled = !!meal?.isCancelled;
  const isToday = formatBusinessDate(new Date()) === dateStr;
  const isPast = new Date(dateStr).getTime() < new Date(formatBusinessDate(new Date())).getTime();

  const regStatus = registration?.status;
  const isRegistered = regStatus === 'confirmed';
  const isCompleted = regStatus === 'completed';
  const isPending = regStatus === 'pending';
  const isCancelled = regStatus === 'cancelled';
  const guestCount = registration?.guestCount || 0;

  return (
    <Card
      variant="elevated"
      padding="lg"
      style={[
        styles.card,
        isToday && styles.cardToday,
        isMealCancelled && styles.cardCancelledMeal,
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        {/* Header dòng ngày & Badge trạng thái */}
        <View style={styles.headerRow}>
          <View style={styles.dateCol}>
            <View style={styles.dateBadgeRow}>
              <Text style={[styles.dateText, isToday && styles.dateTextToday]}>
                {formatFullDisplayDate(dateStr)}
              </Text>
              {isToday && (
                <View style={styles.todayPill}>
                  <Text style={styles.todayPillText}>Hôm nay</Text>
                </View>
              )}
            </View>
          </View>

          <Badge
            type="mealRegistration"
            value={regStatus}
            isMealCancelled={isMealCancelled}
            size="sm"
          />
        </View>

        {/* Thông tin món ăn hoặc thông báo bếp nghỉ */}
        <View style={styles.contentBox}>
          {isMealCancelled ? (
            <View style={styles.kitchenAlert}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={colors.status.kitchenClosed.dot}
              />
              <Text style={styles.kitchenAlertText}>
                {meal?.note || 'Nhà bếp nghỉ phục vụ trong ngày này.'}
              </Text>
            </View>
          ) : (
            <View style={styles.menuRow}>
              <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
              <Text style={styles.menuText} numberOfLines={2}>
                {meal?.note || 'Thực đơn cơm trưa tiêu chuẩn văn phòng'}
              </Text>
            </View>
          )}

          {/* Khách ăn kèm nếu có */}
          {registration && guestCount > 0 && !isMealCancelled && (
            <View style={styles.guestPill}>
              <Ionicons name="people-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.guestPillText}>
                Kèm {guestCount} khách ăn
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Dòng nút hành động (Chỉ hiển thị khi bếp mở và ngày chưa hoàn thành) */}
      {!isMealCancelled && !isCompleted && !isPast && (
        <View style={styles.actionsRow}>
          {isRegistered || isPending ? (
            <>
              {onUpdateGuests && (
                <Button
                  title={`Khách (${guestCount})`}
                  variant="secondary"
                  size="sm"
                  leftIcon={
                    <Ionicons
                      name="people-outline"
                      size={16}
                      color={colors.text}
                    />
                  }
                  onPress={() => meal && onUpdateGuests(meal.id, guestCount)}
                  style={styles.actionBtn}
                />
              )}
              {onCancel && registration && (
                <Button
                  title="Cắt suất"
                  variant="danger"
                  size="sm"
                  leftIcon={
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color={colors.textInverse}
                    />
                  }
                  onPress={() => onCancel(registration.id)}
                  style={styles.actionBtn}
                />
              )}
            </>
          ) : (
            <>
              {onRegister && meal && (
                <Button
                  title={isCancelled ? 'Đăng ký lại' : 'Đăng ký ăn'}
                  variant="primary"
                  size="sm"
                  leftIcon={
                    <Ionicons
                      name="checkmark-outline"
                      size={16}
                      color={colors.textInverse}
                    />
                  }
                  onPress={() => onRegister(meal.id)}
                  fullWidth
                />
              )}
            </>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardToday: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FAFDFB',
  },
  cardCancelledMeal: {
    backgroundColor: '#FFFBFB',
    borderColor: colors.status.kitchenClosed.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  dateTextToday: {
    color: colors.primaryDark,
  },
  todayPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  todayPillText: {
    fontSize: typography.sizes['2xs'],
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  contentBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  kitchenAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  kitchenAlertText: {
    fontSize: typography.sizes.xs,
    color: colors.status.kitchenClosed.text,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  guestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 4,
    marginTop: 2,
  },
  guestPillText: {
    fontSize: typography.sizes['2xs'],
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
