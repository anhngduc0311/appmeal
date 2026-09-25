/**
 * Tab Screen - Thanh toán cá nhân (Payments)
 * Hiển thị danh sách các khoản tiền ăn cá nhân, trạng thái thanh toán và hướng dẫn quét mã QR
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { EmptyState } from '../../src/components/states/EmptyState';
import { useAuth } from '../../src/providers/AuthProvider';
import { useMockStore } from '../../src/hooks/useMockStore';
import { mockStore } from '../../src/services/mockStore';
import { Payment } from '../../src/types';
import {
  formatCurrency,
  formatDisplayDate,
  formatDateTime,
} from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';
import { shadows } from '../../src/theme/shadows';

export default function PaymentsScreen() {
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Dữ liệu reactive tự động đồng bộ
  const payments = useMockStore(useCallback(() => mockStore.getMyPayments(), []));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const handleOpenQr = (p: Payment) => {
    setSelectedPayment(p);
    setQrModalVisible(true);
  };

  const unpaidTotal = payments
    .filter((p) => p.status === 'unpaid' || p.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <ScreenContainer
      scrollable
      refreshing={refreshing}
      onRefresh={handleRefresh}
      backgroundColor={colors.background}
    >
      <Header
        title="Thanh toán tiền ăn"
        subtitle="Theo dõi và hoàn tất các khoản thu tiền ăn định kỳ"
      />

      {/* Tổng quan nợ tiền ăn */}
      <Card variant="elevated" padding="xl" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Tổng tiền cần thanh toán</Text>
          <Badge
            type="payment"
            value={unpaidTotal > 0 ? 'unpaid' : 'paid'}
            size="sm"
          />
        </View>

        <Text
          style={[
            styles.summaryAmount,
            unpaidTotal > 0 ? styles.amountUnpaid : styles.amountPaid,
          ]}
        >
          {formatCurrency(unpaidTotal)}
        </Text>

        <Text style={styles.summaryDesc}>
          {unpaidTotal > 0
            ? 'Vui lòng thanh toán chuyển khoản trước ngày đến hạn theo quy định cơ quan.'
            : 'Tất cả các khoản tiền ăn của bạn đã được thanh toán đầy đủ.'}
        </Text>
      </Card>

      {/* Danh sách các kỳ thu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử các kỳ thu ({payments.length})</Text>

        {payments.length > 0 ? (
          payments.map((item) => {
            const isUnpaid = item.status === 'unpaid' || item.status === 'overdue';

            return (
              <Card
                key={item.id}
                variant="elevated"
                padding="lg"
                style={styles.paymentItemCard}
              >
                <View style={styles.itemTopRow}>
                  <View>
                    <Text style={styles.itemTitle}>
                      Kỳ tiền ăn ngày {formatDisplayDate(item.paymentDate)}
                    </Text>
                    <Text style={styles.itemDate}>
                      {item.isPaid && item.paidAt
                        ? `Đã thanh toán lúc: ${formatDateTime(item.paidAt)}`
                        : `Hạn thanh toán: ${formatDisplayDate(item.paymentDate)}`}
                    </Text>
                  </View>

                  <Badge type="payment" value={item.status} size="sm" />
                </View>

                <View style={styles.itemBottomRow}>
                  <View>
                    <Text style={styles.itemAmountLabel}>Số tiền:</Text>
                    <Text style={styles.itemAmountValue}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>

                  {isUnpaid ? (
                    <Button
                      title="Quét mã QR"
                      variant="primary"
                      size="sm"
                      leftIcon={
                        <Ionicons
                          name="qr-code-outline"
                          size={16}
                          color={colors.textInverse}
                        />
                      }
                      onPress={() => handleOpenQr(item)}
                    />
                  ) : (
                    <View style={styles.paidCheckRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.status.confirmed.dot}
                      />
                      <Text style={styles.paidCheckText}>Đã hoàn tất</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            iconName="wallet-outline"
            title="Chưa có khoản thanh toán"
            description="Bạn hiện chưa có khoản tiền ăn nào phát sinh trên hệ thống."
          />
        )}
      </View>

      {/* Modal Quét mã QR chuyển khoản */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setQrModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.qrCard, shadows.xl]}>
                <View style={styles.qrHeader}>
                  <Text style={styles.qrTitle}>Mã QR Chuyển khoản</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setQrModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {selectedPayment && (
                  <>
                    <View style={styles.qrAmountBox}>
                      <Text style={styles.qrAmountLabel}>Số tiền cần chuyển:</Text>
                      <Text style={styles.qrAmountValue}>
                        {formatCurrency(selectedPayment.amount)}
                      </Text>
                    </View>

                    {/* QR Code Placeholder / Display */}
                    <View style={styles.qrImageBox}>
                      <Image
                        source={{
                          uri: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=LCITMEAL_PAYMENT_' + selectedPayment.id,
                        }}
                        style={styles.qrImage}
                      />
                    </View>

                    <View style={styles.qrInfoBox}>
                      <Text style={styles.qrInfoText}>
                        • Ngân hàng: <Text style={styles.qrBold}>MB Bank (Quân Đội)</Text>
                      </Text>
                      <Text style={styles.qrInfoText}>
                        • Số tài khoản: <Text style={styles.qrBold}>0888999888</Text>
                      </Text>
                      <Text style={styles.qrInfoText}>
                        • Chủ tài khoản: <Text style={styles.qrBold}>LCIT BẾP ĂN CƠ QUAN</Text>
                      </Text>
                      <Text style={styles.qrInfoText}>
                        • Nội dung CK: <Text style={styles.qrBold}>TIEN AN {user?.username?.toUpperCase()} T09</Text>
                      </Text>
                    </View>

                    <Button
                      title="Đã chuyển khoản xong"
                      variant="primary"
                      size="md"
                      onPress={() => {
                        setQrModalVisible(false);
                      }}
                      fullWidth
                      style={styles.doneBtn}
                    />
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryTitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  summaryAmount: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.extrabold,
    marginVertical: 4,
  },
  amountUnpaid: {
    color: colors.status.unpaid.dot,
  },
  amountPaid: {
    color: colors.status.confirmed.dot,
  },
  summaryDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentItemCard: {
    marginBottom: spacing.md,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  itemDate: {
    fontSize: typography.sizes['2xs'],
    color: colors.textMuted,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  itemAmountLabel: {
    fontSize: typography.sizes['2xs'],
    color: colors.textSecondary,
  },
  itemAmountValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  paidCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidCheckText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.status.confirmed.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  qrCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  qrTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  qrAmountBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrAmountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  qrAmountValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.extrabold,
    color: colors.primaryDark,
    marginTop: 2,
  },
  qrImageBox: {
    width: 200,
    height: 200,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  qrImage: {
    width: 180,
    height: 180,
    borderRadius: radius.md,
  },
  qrInfoBox: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 4,
  },
  qrInfoText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  qrBold: {
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  doneBtn: {
    marginTop: spacing.xs,
  },
});
