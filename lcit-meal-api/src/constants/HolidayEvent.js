// Khớp với cột `holiday_event`.`status`
const HOLIDAY_EVENT_STATUS = {
  ACTIVE: "active", // Đang áp dụng - các ngày trong khoảng đã bị hủy
  RESTORED: "inactive", // Khớp CHECK constraint của database.
};

module.exports = { HOLIDAY_EVENT_STATUS };
