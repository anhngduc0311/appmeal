// Trạng thái "theo thời gian thực" của 1 bếp ăn - tính từ `meal.meal_date`
// so với ngày/giờ hiện tại (giờ VN) và giờ cấu hình
// `system_setting.meal_completion_time` (mặc định "12:00").
//
// KHÁC với `meal.status` (cột DB, chỉ có active/inactive) và
// `meal_registration.status` (pending/confirmed/completed/cancelled) -
// đây là giá trị được TÍNH LẠI mỗi lần truy vấn (không lưu DB), trả về qua
// field `completionStatus` của Meal, dùng để hiển thị cho FE
// (xem repos/MealRepository.js#filter()).
const MEAL_COMPLETION_STATUS = {
  // Ngày đã qua, hoặc là hôm nay nhưng đã qua giờ hoàn thành suất ăn
  COMPLETED: "completed",
  // Là hôm nay và chưa tới giờ hoàn thành -> bữa ăn đang được phục vụ
  SERVING: "serving",
  // Ngày trong tương lai, chưa tới ngày ăn
  PENDING: "pending",
};

module.exports = MEAL_COMPLETION_STATUS;
