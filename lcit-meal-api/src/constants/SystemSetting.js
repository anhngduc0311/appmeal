// Khớp với cột `system_setting`.`data_type`
const SETTING_DATA_TYPE = {
  STRING: "string",
  INTEGER: "integer",
  BOOLEAN: "boolean",
};

// Các setting_key mặc định được seed sẵn trong qlsa.sql
// (tránh gõ nhầm chuỗi rải rác khắp code khi cần đọc cấu hình)
const SETTING_KEY = {
  REGISTRATION_CLOSE_TIME: "registration_close_time",
  MEAL_PRICE: "meal_price",
  GUEST_MEAL_PRICE: "guest_meal_price",
  AUTO_REGISTER_ENABLED: "auto_register_enabled",
  AUTO_REGISTER_START_DAY: "auto_register_start_day",
  MAX_GUEST_PER_REGISTRATION: "max_guest_per_registration",
  PAYMENT_DUE_DAY: "payment_due_day",
  PAYMENT_REMINDER_ENABLED: "payment_reminder_enabled",
  PAYMENT_QR_IMAGE: "payment_qr_image",
  // Giờ (HH:mm) cronjob tự động chuyển suất ăn "đã đăng ký" (confirmed) đã
  // qua bữa sang "đã hoàn thành" (completed) - xem jobs/mealCompletionJob.js
  MEAL_COMPLETION_TIME: "meal_completion_time",
};

module.exports = { SETTING_DATA_TYPE, SETTING_KEY };
