class Notification {
  constructor(data) {
    ((this.id = data.id),
      (this.title = data.title),
      (this.content = data.content),
      (this.url = data.url),
      (this.status = data.status),
      (this.created_at = data.created_at),
      (this.created_by = data.created_by),
      (this.updated_at = data.updated_at),
      (this.updated_by = data.updated_by));

    if (data.is_seen !== undefined) {
      this.isSeen = !!Number(data.is_seen);
    }

    if (data.seen_at !== undefined) {
      this.seenAt = data.seen_at;
    }
  }
}

module.exports = Notification;
