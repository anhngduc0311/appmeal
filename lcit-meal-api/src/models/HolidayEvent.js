class HolidayEvent {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.reason = data.reason;
    this.fromDate = data.from_date;
    this.toDate = data.to_date;
    this.status = data.status;
    this.createdBy = data.created_by;
    this.createdByName = data.created_by_name;
    this.createdAt = data.created_at;
    this.restoredBy = data.restored_by;
    this.restoredAt = data.restored_at;
  }
}

module.exports = HolidayEvent;
