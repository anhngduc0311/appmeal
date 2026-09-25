/**
 * Meal Component - DatePickerModal
 * Modal chọn ngày đơn hoặc chọn khoảng ngày (Từ ngày - Đến ngày)
 * Hỗ trợ chọn nhanh ngày trong tuần / tháng hiện tại.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import {
  formatBusinessDate,
  formatDisplayDate,
  getShortDayOfWeek,
} from '../../utils/formatters';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export interface DatePickerModalProps {
  visible: boolean;
  mode?: 'single' | 'range';
  initialDate?: string; // YYYY-MM-DD
  initialFromDate?: string;
  initialToDate?: string;
  minDate?: string;
  title?: string;
  onSelectSingle?: (date: string) => void;
  onSelectRange?: (fromDate: string, toDate: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  mode = 'single',
  initialDate,
  initialFromDate,
  initialToDate,
  minDate,
  title,
  onSelectSingle,
  onSelectRange,
  onClose,
}) => {
  const todayStr = formatBusinessDate(new Date());

  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || todayStr
  );
  const [fromDate, setFromDate] = useState<string>(
    initialFromDate || todayStr
  );
  const [toDate, setToDate] = useState<string>(
    initialToDate || todayStr
  );

  // Sinh 30 ngày tiếp theo để lựa chọn
  const generateAvailableDates = () => {
    const dates: { dateStr: string; display: string; shortDay: string; isPast: boolean }[] = [];
    const base = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(base.getDate() + i);
      const str = formatBusinessDate(d);
      dates.push({
        dateStr: str,
        display: formatDisplayDate(str),
        shortDay: getShortDayOfWeek(str),
        isPast: false,
      });
    }
    return dates;
  };

  const dates = generateAvailableDates();

  const handleDayPress = (dateStr: string) => {
    if (mode === 'single') {
      setSelectedDate(dateStr);
    } else {
      if (!fromDate || (fromDate && toDate)) {
        setFromDate(dateStr);
        setToDate('');
      } else if (fromDate && !toDate) {
        if (new Date(dateStr).getTime() < new Date(fromDate).getTime()) {
          setFromDate(dateStr);
          setToDate(fromDate);
        } else {
          setToDate(dateStr);
        }
      }
    }
  };

  const handleConfirm = () => {
    if (mode === 'single') {
      onSelectSingle?.(selectedDate);
    } else {
      const finalToDate = toDate || fromDate;
      onSelectRange?.(fromDate, finalToDate);
    }
    onClose();
  };

  const isDaySelected = (dateStr: string) => {
    if (mode === 'single') {
      return selectedDate === dateStr;
    }
    if (fromDate === dateStr || toDate === dateStr) return true;
    if (fromDate && toDate) {
      const current = new Date(dateStr).getTime();
      const from = new Date(fromDate).getTime();
      const to = new Date(toDate).getTime();
      return current > from && current < to;
    }
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, shadows.xl]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {title || (mode === 'single' ? 'Chọn ngày ăn' : 'Chọn khoảng ngày')}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessibilityLabel="Đóng"
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Tóm tắt lựa chọn */}
              <View style={styles.summaryBox}>
                {mode === 'single' ? (
                  <Text style={styles.summaryText}>
                    Ngày đã chọn:{' '}
                    <Text style={styles.summaryHighlight}>
                      {formatDisplayDate(selectedDate)}
                    </Text>
                  </Text>
                ) : (
                  <Text style={styles.summaryText}>
                    Từ{' '}
                    <Text style={styles.summaryHighlight}>
                      {formatDisplayDate(fromDate)}
                    </Text>{' '}
                    đến{' '}
                    <Text style={styles.summaryHighlight}>
                      {formatDisplayDate(toDate || fromDate)}
                    </Text>
                  </Text>
                )}
              </View>

              {/* Danh sách cuộn các ngày */}
              <ScrollView
                style={styles.datesScroll}
                contentContainerStyle={styles.datesGrid}
                showsVerticalScrollIndicator={false}
              >
                {dates.map((item) => {
                  const selected = isDaySelected(item.dateStr);
                  const isBoundary =
                    item.dateStr === selectedDate ||
                    item.dateStr === fromDate ||
                    item.dateStr === toDate;

                  return (
                    <TouchableOpacity
                      key={item.dateStr}
                      activeOpacity={0.7}
                      onPress={() => handleDayPress(item.dateStr)}
                      style={[
                        styles.dateChip,
                        selected && styles.dateChipSelected,
                        isBoundary && styles.dateChipBoundary,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.chipDay,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {item.shortDay}
                      </Text>
                      <Text
                        style={[
                          styles.chipDate,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {item.display.slice(0, 5)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Action buttons */}
              <View style={styles.buttonRow}>
                <Button
                  title="Hủy"
                  variant="secondary"
                  size="md"
                  onPress={onClose}
                  style={styles.btn}
                />
                <Button
                  title="Áp dụng"
                  variant="primary"
                  size="md"
                  onPress={handleConfirm}
                  style={styles.btn}
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
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  closeBtn: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  summaryBox: {
    backgroundColor: colors.primary50,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  summaryText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  datesScroll: {
    maxHeight: 280,
    marginBottom: spacing.lg,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  dateChip: {
    width: '22%',
    minHeight: 52,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  dateChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary300,
  },
  dateChipBoundary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  chipDay: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  chipDate: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
  },
});
