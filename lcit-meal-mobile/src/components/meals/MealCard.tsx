/**
 * Meal Component - MealCard
 * Thẻ hiển thị thông tin suất ăn cho từng ngày:
 * - Thứ & ngày tháng rõ ràng
 * - Trạng thái suất ăn cá nhân (có cả nhãn tiếng Việt và màu tương ứng)
 * - Tình trạng bếp (hoạt động / bếp nghỉ)
 * - Các nút thao tác nhanh: Đăng ký ăn, Cắt suất
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
  getFullDayOfWeek,
  formatDisplayDate,
  getRelativeDateLabel,
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
  registering?: boolean;
  actionsDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MealCard: React.FC<MealCardProps> = ({
  dateStr,
  meal,
  registration,
  onRegister,
  onCancel,
  onPress,
  registering = false,
  actionsDisabled = false,
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
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`Xem suất ăn ${formatFullDisplayDate(dateStr)}`}
      >
        {/* Header dòng ngày & Badge trạng thái */}
        <View style={styles.headerRow}>
          <View style={styles.calendarTile}><Text style={styles.calendarMonth}>THÁNG {dateStr.slice(5, 7)}</Text><Text style={styles.calendarDay}>{dateStr.slice(8, 10)}</Text></View>
          <View style={styles.dateCol}>
            <View style={styles.dateBadgeRow}>
              <Text style={[styles.dateText, isToday && styles.dateTextToday]}>
                {isToday || getRelativeDateLabel(dateStr) === 'Ngày mai' ? getRelativeDateLabel(dateStr) : getFullDayOfWeek(dateStr)}
              </Text>
            </View>
            <Text style={styles.dateDetail}>{formatDisplayDate(dateStr)}</Text>
          <Badge
            type="mealRegistration"
            value={regStatus}
            isMealCancelled={isMealCancelled}
            size="sm"
          />
          </View>
          {onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
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
              <Text style={styles.menuText}>
                {meal?.note || 'Thực đơn cơm trưa tiêu chuẩn văn phòng'}
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
              {onCancel && registration && (
                <Button
                  title="Cắt suất"
                  disabled={actionsDisabled}
                  variant="outline"
                  size="sm"
                  leftIcon={
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color={colors.primary}
                    />
                  }
                  onPress={() => onCancel(registration.id)}
                  fullWidth
                />
              )}
            </>
          ) : (
            <>
              {onRegister && meal && (
                <Button
                  title={isCancelled ? 'Đăng ký lại' : 'Đăng ký ăn'}
                  loading={registering}
                  disabled={actionsDisabled}
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
  dateDetail: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginVertical: spacing.xs },
  calendarTile: {width: 52, height: 60, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12},
  calendarMonth: {fontSize: 8, letterSpacing: 0.5, fontWeight: '700', color: colors.primary},
  calendarDay: {fontSize: 23, fontWeight: '700', color: colors.primaryDark},
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardToday: {
    borderColor: colors.primary300,
    borderWidth: 1,
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
    alignItems: 'flex-start',
    marginRight: spacing.sm,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: typography.sizes.sm,
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
    padding: spacing.lg,
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
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  menuText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    height: 'auto',
  },
});
