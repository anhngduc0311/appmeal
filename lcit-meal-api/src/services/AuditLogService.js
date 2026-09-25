const AppError = require("../ultis/AppError");

class AuditLogService {
  constructor(auditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  async list() {
    return this.auditLogRepository.list();
  }

  async get(id) {
    const auditLog = await this.auditLogRepository.get(id);

    if (!auditLog) {
      throw new AppError("Audit log không tồn tại", 404);
    }

    return auditLog;
  }

  async filter(query, actor, action, target, result, status) {
    return this.auditLogRepository.filter(
      query,
      actor,
      action,
      target,
      result,
      status,
    );
  }

  /**
   * Hàm dùng chung để ghi Audit Log
   *
   * Các module khác chỉ cần gọi:
   *
   * auditLogService.create({
   *     logActor: userId,
   *     logAction: "CREATE",
   *     logTarget: "USER",
   *     logResult: "SUCCESS",
   *     logDetail: "Tạo user mới",
   *     ipAddress: "...",
   *     userAgent: "...",
   *     status: "1",
   *     oldData: null,
   *     newData: user
   * });
   */
  async create(data) {
    this.validateCreateData(data);

    return this.auditLogRepository.create({
      ...data,

      logDetail: this.stringifyData(data.logDetail),

      oldData: this.stringifyData(data.oldData),

      newData: this.stringifyData(data.newData),
    });
  }

  validateCreateData(data) {
    if (!data.logAction) {
      throw new AppError("logAction là bắt buộc", 400);
    }

    if (!data.logTarget) {
      throw new AppError("logTarget là bắt buộc", 400);
    }

    if (!data.logResult) {
      throw new AppError("logResult là bắt buộc", 400);
    }
  }

  stringifyData(data) {
    if (data === undefined || data === null) {
      return null;
    }

    if (typeof data === "string") {
      return data;
    }

    return JSON.stringify(data);
  }
}

module.exports = AuditLogService;
