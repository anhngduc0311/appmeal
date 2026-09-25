class MealRegistration {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.userName = data.user_full_name;
    this.mealId = data.meal_id;
    this.mealDate = data.meal_date;
    this.guestCount = data.guest_count;
    this.status = data.status;
    this.createdAt = data.created_at;
  }
}

module.exports = MealRegistration;
