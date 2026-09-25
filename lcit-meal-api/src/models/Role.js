class Role {
  constructor(data) {
    this.id = data.id;
    this.displayName = data.display_name;
    this.code = data.code;
    this.description = data.description;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.createdBy = data.created_by;
    this.updatedAt = data.updated_at;
    this.updatedBy = data.updated_by;
  }
}

module.exports = Role;
