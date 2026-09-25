const { SETTING_DATA_TYPE } = require("../constants/SystemSetting");
const LOG_ACTION = require("../constants/LogAction");
const AppError = require("../ultis/AppError");
const fs = require("fs/promises");
const path = require("path");

class SystemSettingService {
  constructor(systemSettingRepository, auditLogService) {
    this.systemSettingRepository = systemSettingRepository;
    this.auditLogService = auditLogService;
  }

  async list() {
    return this.systemSettingRepository.list();
  }

  async get(id) {
    const setting = await this.systemSettingRepository.get(id);

    if (!setting) {
      throw new AppError("Cấu hình không tồn tại", 404);
    }

    return setting;
  }

  async getByKey(key) {
    const setting = await this.systemSettingRepository.getByKey(key);

    if (!setting) {
      throw new AppError("Cấu hình không tồn tại", 404);
    }

    return setting;
  }

  async create(data, actor = {}) {
    this.validateCreateData(data);

    const existing = await this.systemSettingRepository.getByKey(
      data.settingKey,
    );

    if (existing) {
      throw new AppError("setting_key đã tồn tại", 409);
    }

    const setting = await this.systemSettingRepository.create({
      settingKey: data.settingKey,
      settingValue: data.settingValue,
      displayName: data.displayName,
      dataType: data.dataType || SETTING_DATA_TYPE.STRING,
      description: data.description,
      updatedBy: actor.actorId || null,
    });

    await this.logAction(
      LOG_ACTION.ACTION_CREATE,
      actor,
      `system_setting:${setting.id}`,
      "Tạo cấu hình hệ thống mới",
      null,
      setting,
    );

    return setting;
  }

  validateCreateData(data) {
    if (!data.settingKey) {
      throw new AppError("settingKey là bắt buộc", 400);
    }

    if (data.settingValue === undefined || data.settingValue === null) {
      throw new AppError("settingValue là bắt buộc", 400);
    }
  }

  // Cập nhật giá trị 1 cấu hình theo key (vd: đổi đơn giá suất ăn) - ghi lại giá trị cũ/mới vào audit log
  async updateByKey(key, data, actor = {}) {
    const setting = await this.getByKey(key);

    const updated = await this.systemSettingRepository.updateByKey(key, {
      settingValue: data.settingValue,
      displayName: data.displayName,
      description: data.description,
      updatedBy: actor.actorId || null,
    });

    await this.logAction(
      LOG_ACTION.ACTION_UPDATE,
      actor,
      `system_setting:${setting.id}`,
      `Cập nhật cấu hình ${key}`,
      { settingValue: setting.settingValue },
      { settingValue: updated.settingValue },
    );

    return updated;
  }

  // Cập nhật nhiều cấu hình cùng lúc (vd: form "Quản lý cấu hình hệ thống" lưu
  // tất cả các trường 1 lần). Mỗi setting được ghi audit log riêng như updateByKey.
  async updateMany(settings, actor = {}) {
    if (!Array.isArray(settings) || settings.length === 0) {
      throw new AppError("Danh sách cấu hình không hợp lệ", 400);
    }

    const results = [];

    for (const item of settings) {
      const key = item.settingKey || item.setting_key;

      if (!key) {
        throw new AppError("settingKey là bắt buộc cho mỗi cấu hình", 400);
      }

      const settingValue =
        item.settingValue !== undefined
          ? item.settingValue
          : item.setting_value;

      const updated = await this.updateByKey(key, { settingValue }, actor);

      results.push(updated);
    }

    return results;
  }

  async uploadPaymentQr(file, actor = {}) {
    if (
      !file ||
      !["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)
    ) {
      throw new AppError("Ảnh QR không hợp lệ", 400);
    }

    const extension =
      file.mimetype === "image/jpeg" ? "jpg" : file.mimetype.split("/")[1];
    const uploadDir = path.join(__dirname, "../../public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `payment-qr-${Date.now()}.${extension}`;
    await fs.writeFile(path.join(uploadDir, filename), file.buffer);

    return this.updateByKey(
      "payment_qr_image",
      { settingValue: `/uploads/${filename}` },
      actor,
    );
  }

  async logAction(action, actor, target, detail, oldData, newData) {
    try {
      await this.auditLogService.create({
        logActor: actor.actorId || null,
        logAction: action,
        logTarget: target,
        logResult: "success",
        logDetail: detail,
        ipAddress: actor.ipAddress || null,
        userAgent: actor.userAgent || null,
        status: "success",
        oldData,
        newData,
      });
    } catch (error) {
      console.error("Ghi audit log thất bại:", error.message);
    }
  }
}

module.exports = SystemSettingService;
