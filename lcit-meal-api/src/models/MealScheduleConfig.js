// Khớp với bảng `meal_schedule_config` (xem migration trong qlsa_clean.sql).
// day_of_week: 0 = Chủ Nhật ... 6 = Thứ Bảy.
class MealScheduleConfig {
  constructor(data) {
    this.id = data.id;
    this.dayOfWeek = data.day_of_week;
    this.isEnabled = !!data.is_enabled;
    this.notes = data.notes;
    this.updatedBy = data.updated_by;
    this.updatedByName = data.updated_by_name;
    this.updatedAt = data.updated_at;
    this.createdAt = data.created_at;
  }
}

module.exports = MealScheduleConfig;
