class AuditLog {
  constructor(data) {
    ((this.id = data.id),
      (this.log_actor = data.log_actor),
      (this.actor_name = data.actor_name),
      (this.log_action = data.log_action),
      (this.log_target = data.log_target),
      (this.log_result = data.log_result),
      (this.log_detail = data.log_detail),
      (this.log_time = data.log_time),
      (this.ip_address = data.ip_address),
      (this.user_agent = data.user_agent),
      (this.status = data.status),
      (this.old_data = data.old_data),
      (this.new_data = data.new_data));
  }
}

module.exports = AuditLog;
