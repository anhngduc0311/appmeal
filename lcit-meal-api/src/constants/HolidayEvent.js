// Khớp với cột `holiday_event`.`status`
const HOLIDAY_EVENT_STATUS = {
  ACTIVE: "active", // Đang áp dụng - các ngày trong khoảng đã bị hủy
  RESTORED: "restored", // QTV đã mở lại (huỷ nhầm) - bếp ăn được mở lại
};

module.exports = { HOLIDAY_EVENT_STATUS };
