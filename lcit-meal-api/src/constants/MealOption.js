// Khớp với cột `meal_option`.`type`
const MEAL_OPTION_TYPE = {
  CANCEL_TODAY: "cancel_today", // Hủy ăn ngay trong ngày
  CANCEL_SCHEDULE: "cancel_schedule", // Hủy ăn theo khoảng ngày
  CANCEL_PERMANENT: "cancel_permanent", // Hủy ăn dài hạn (nghỉ thai sản, nghỉ việc...)
};

// Khớp với cột `meal_option`.`status`
const MEAL_OPTION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Các type không cần chờ duyệt, được tự động approve khi tạo.
// Cắt hôm nay (cancel_today) tự động duyệt trước giờ chốt.
// Cắt theo khoảng ngày / tùy chỉnh (cancel_schedule) và Cắt dài hạn (cancel_permanent) BẮT BUỘC cần Quản lý duyệt.
const AUTO_APPROVE_TYPES = [
  MEAL_OPTION_TYPE.CANCEL_TODAY,
];

module.exports = {
  MEAL_OPTION_TYPE,
  MEAL_OPTION_STATUS,
  AUTO_APPROVE_TYPES,
};
