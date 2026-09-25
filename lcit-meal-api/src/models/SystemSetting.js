class SystemSetting {
  constructor(data) {
    this.id = data.id;
    this.settingKey = data.setting_key;
    this.settingValue = data.setting_value;
    this.displayName = data.display_name;
    this.dataType = data.data_type;
    this.description = data.description;
    this.updatedAt = data.updated_at;
    this.updatedBy = data.updated_by;
  }

  // Ép kiểu setting_value theo data_type để service khác dùng trực tiếp
  // (vd: meal_price -> number, auto_register_enabled -> boolean)
  get typedValue() {
    if (this.settingValue === null || this.settingValue === undefined) {
      return null;
    }

    switch (this.dataType) {
      case "integer":
        return parseInt(this.settingValue, 10);
      case "boolean":
        return this.settingValue === "1" || this.settingValue === "true";
      default:
        return this.settingValue;
    }
  }

  toJSON() {
    const { ...safeData } = this;
    safeData.typedValue = this.typedValue;
    return safeData;
  }
}

module.exports = SystemSetting;
