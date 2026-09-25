// Khớp với cột `meal_registration`.`status`
const MEAL_REGISTRATION_STATUS = {
  PENDING: "pending", // Đăng ký muộn / đăng ký kèm khách -> chờ quản lý xác nhận
  CONFIRMED: "confirmed", // Đã đăng ký, CHƯA tới giờ ăn / chưa được job đánh dấu hoàn thành
  COMPLETED: "completed", // Suất ăn đã THỰC SỰ diễn ra (qua giờ ăn trưa - xem jobs/mealCompletionJob.js)
  CANCELLED: "cancelled",
};

module.exports = MEAL_REGISTRATION_STATUS;
