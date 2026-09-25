const AppError = require("../ultis/AppError");
const LOG_ACTION = require("../constants/LogAction");

const DAY_NAMES = [
  "Chủ Nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

class MealScheduleConfigService {
  constructor(mealScheduleConfigRepository, auditLogService) {
    this.mealScheduleConfigRepository = mealScheduleConfigRepository;
    this.auditLogService = auditLogService;
  }

  // Trả về cả 7 ngày trong tuần + cờ "có áp dụng cấu hình này cho job tự
  // động tạo lịch (autoScheduleJob) hay không" để hiển thị chung 1 màn
  // hình trong trang Quản lý cấu hình hệ thống.
  async list() {
    const [days, useMealConfig] = await Promise.all([
      this.mealScheduleConfigRepository.list(),
      this.mealScheduleConfigRepository.getUseMealConfig(),
    ]);

    return { days, useMealConfig };
  }

  validateDay(item) {
    const dayOfWeek = parseInt(item.dayOfWeek, 10);

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new AppError(
        `day_of_week không hợp lệ: "${item.dayOfWeek}" (phải là số 0-6)`,
        400,
      );
    }

    return dayOfWeek;
  }

  // PUT - body: { days: [{ dayOfWeek, isEnabled, notes }, ...], useMealConfig? }
  async updateMany(payload, actor = {}) {
    const days = Array.isArray(payload?.days) ? payload.days : [];

    if (days.length === 0 && payload?.useMealConfig === undefined) {
      throw new AppError("Không có dữ liệu cấu hình để lưu", 400);
    }

    const parsedDays = days.map((item) => ({
      dayOfWeek: this.validateDay(item),
      isEnabled: !!item.isEnabled,
      notes: item.notes,
    }));

    // Không cho phép tắt hết tất cả các ngày - nếu không job tự động sẽ
    // không bao giờ tạo bếp ăn cho bất kỳ ngày nào.
    if (
      parsedDays.length >= 7 &&
      parsedDays.every((item) => !item.isEnabled)
    ) {
      throw new AppError(
        "Phải chọn ít nhất 1 ngày trong tuần có bố trí suất ăn",
        400,
      );
    }

    for (const item of parsedDays) {
      await this.mealScheduleConfigRepository.upsert(
        item.dayOfWeek,
        item.isEnabled,
        item.notes,
        actor.actorId || null,
      );
    }

    if (payload?.useMealConfig !== undefined) {
      await this.mealScheduleConfigRepository.setUseMealConfig(
        !!payload.useMealConfig,
      );
    }

    const result = await this.list();

    const enabledNames = result.days
      .filter((day) => day.isEnabled)
      .map((day) => DAY_NAMES[day.dayOfWeek])
      .join(", ");

    await this.logAction(
      actor,
      `Cập nhật cấu hình ngày ăn trong tuần: ${enabledNames || "(không có ngày nào)"}` +
        (payload?.useMealConfig !== undefined
          ? `. ${result.useMealConfig ? "Đã bật" : "Đã tắt"} áp dụng cấu hình này cho job tự động tạo lịch ăn.`
          : "."),
    );

    return result;
  }

  async logAction(actor, detail) {
    try {
      await this.auditLogService.create({
        logActor: actor.actorId || null,
        logAction: LOG_ACTION.ACTION_UPDATE,
        logTarget: "meal_schedule_config",
        logResult: "success",
        logDetail: detail,
        ipAddress: actor.ipAddress || null,
        userAgent: actor.userAgent || null,
        status: "success",
      });
    } catch (error) {
      console.error("Ghi audit log thất bại:", error.message);
    }
  }
}

module.exports = MealScheduleConfigService;
