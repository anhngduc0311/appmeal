// Khớp với cột `meal_option`.`type`
// NGHIỆP VỤ MỚI: người dùng cắt suất ăn chỉ cần tự xác nhận, KHÔNG cần
// quản lý duyệt -> cả 3 loại đều được tự động duyệt ngay khi tạo.
const MEAL_OPTION_TYPE = {
  CANCEL_TODAY: "cancel_today", // Hủy ăn ngay trong ngày
  CANCEL_SCHEDULE: "cancel_schedule", // Hủy ăn theo khoảng ngày
  CANCEL_PERMANENT: "cancel_permanent", // Hủy ăn vĩnh viễn (nghỉ việc...)
};

// Khớp với cột `meal_option`.`status`
const MEAL_OPTION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Các type không cần chờ duyệt, được tự động approve khi tạo.
// Hiện tại là TẤT CẢ các loại cắt suất: người dùng tự xác nhận và cắt luôn,
// quản lý chỉ được thông báo để điều chỉnh số suất cần nấu (không duyệt).
// Trạng thái "pending" cùng 2 API duyệt/từ chối vẫn được giữ lại để xử lý
// nốt các yêu cầu cũ đã tạo trước khi đổi nghiệp vụ (dữ liệu lịch sử).
const AUTO_APPROVE_TYPES = Object.values(MEAL_OPTION_TYPE);

module.exports = {
  MEAL_OPTION_TYPE,
  MEAL_OPTION_STATUS,
  AUTO_APPROVE_TYPES,
};
