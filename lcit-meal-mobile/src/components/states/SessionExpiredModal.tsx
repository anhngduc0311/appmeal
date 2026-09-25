/**
 * State Component - SessionExpiredModal
 * Hộp thoại thông báo hết phiên đăng nhập và yêu cầu đăng nhập lại
 */

import React from 'react';
import { ConfirmDialog } from '../common/ConfirmDialog';

export interface SessionExpiredModalProps {
  visible: boolean;
  onLoginAgain: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  visible,
  onLoginAgain,
}) => {
  return (
    <ConfirmDialog
      visible={visible}
      title="Phiên đăng nhập đã hết hạn"
      message="Thời gian đăng nhập của bạn đã hết hạn hoặc tài khoản đã đăng nhập từ thiết bị khác. Vui lòng đăng nhập lại để tiếp tục."
      confirmText="Đăng nhập lại"
      cancelText="Đóng"
      iconName="log-in-outline"
      onConfirm={onLoginAgain}
      onCancel={onLoginAgain}
    />
  );
};
