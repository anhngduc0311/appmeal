class Meal {
  constructor(data) {
    this.id = data.id;
    this.mealDate = data.meal_date;
    this.isCancelled = !!Number(data.is_cancelled);
    this.cancelledBy = data.cancelled_by;
    this.note = data.note;
    this.status = data.status;
    this.createdAt = data.created_at;

    // Trạng thái theo thời gian thực (completed/serving/pending) - chỉ có
    // khi query kèm COMPLETION_STATUS_SQL (xem repos/MealRepository.js
    // filter()/getByDate()), KHÔNG phải cột gốc của bảng meal.
    if (data.completion_status !== undefined) {
      this.completionStatus = data.completion_status;
    }

    // Số liệu tổng hợp khi repository JOIN thêm với meal_registration
    // (chỉ có mặt ở các query summary, không phải cột gốc của bảng meal)
    if (data.registered_count !== undefined) {
      this.registeredCount = Number(data.registered_count) || 0;
    }
    if (data.guest_count_total !== undefined) {
      this.guestCountTotal = Number(data.guest_count_total) || 0;
    }
  }
}

module.exports = Meal;
