class MealOption {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.userName = data.user_full_name;
    this.type = data.type;
    this.fromDate = data.from_date;
    this.toDate = data.to_date;
    this.note = data.note;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.createdBy = data.created_by;
    this.updatedAt = data.updated_at;
    this.updatedBy = data.updated_by;
    this.approvedAt = data.approved_at;
    this.approvedBy = data.approved_by;
  }
}

module.exports = MealOption;
