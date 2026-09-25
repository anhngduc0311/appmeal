const { HOLIDAY_EVENT_STATUS } = require("../constants/HolidayEvent");
const ROLE = require("../constants/Role");
const LOG_ACTION = require("../constants/LogAction");
const AppError = require("../ultis/AppError");

// Liệt kê toàn bộ ngày "YYYY-MM-DD" trong khoảng [fromDate, toDate] (bao gồm
// cả 2 đầu mút). Dùng UTC để tránh lệch ngày do múi giờ khi cộng dồn.
const enumerateDates = (fromDate, toDate) => {
  const dates = [];
  const cursor = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
};

class HolidayEventService {
  constructor(
    holidayEventRepository,
    mealRepository,
    mealRegistrationRepository,
    userRepository,
    notificationService,
    auditLogService,
  ) {
    this.holidayEventRepository = holidayEventRepository;
    this.mealRepository = mealRepository;
    this.mealRegistrationRepository = mealRegistrationRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
    this.auditLogService = auditLogService;
  }

  async list() {
    return this.holidayEventRepository.list();
  }

  async get(id) {
    const event = await this.holidayEventRepository.get(id);

    if (!event) {
      throw new AppError("Sự kiện hủy lịch không tồn tại", 404);
    }

    return event;
  }

  validateCreateData(data) {
    if (!data.name || !String(data.name).trim()) {
      throw new AppError("Tên sự kiện (name) là bắt buộc", 400);
    }

    if (!data.fromDate) {
      throw new AppError("fromDate là bắt buộc", 400);
    }

    if (!data.toDate) {
      throw new AppError("toDate là bắt buộc", 400);
    }

    if (new Date(data.fromDate) > new Date(data.toDate)) {
      throw new AppError("fromDate không thể sau toDate", 400);
    }
  }

  // Tạo 1 sự kiện "Hủy lịch" (nghỉ lễ/Tết/sự kiện toàn cơ quan) - chọn 1
  // ngày hoặc 1 khoảng ngày, đặt tên + lý do. Hệ thống sẽ:
  //  1. Đánh dấu `meal.is_cancelled = 1` cho TOÀN BỘ ngày trong khoảng (tạo
  //     `meal` nếu ngày đó chưa có bản ghi).
  //  2. Chuyển toàn bộ `meal_registration` (CỦA TẤT CẢ NGƯỜI DÙNG, không
  //     riêng 1 ai - khác với `meal_option`/"cắt suất ăn" vốn chỉ áp dụng
  //     cho 1 user) rơi vào khoảng ngày này sang "cancelled".
  //  3. Thông báo cho toàn bộ nhân viên đang hoạt động.
  async create(data, actor = {}) {
    this.validateCreateData(data);

    const { event, cancelledMealCount, cancelledRegistrationCount } =
      await this.holidayEventRepository.createWithCancellation({
        name: data.name.trim(), reason: data.reason,
        fromDate: data.fromDate, toDate: data.toDate,
        status: HOLIDAY_EVENT_STATUS.ACTIVE, createdBy: actor.actorId || null,
      }, enumerateDates(data.fromDate, data.toDate));

    await this.logAction(
      LOG_ACTION.ACTION_CANCEL,
      actor,
      `holiday_event:${event.id}`,
      `Tạo sự kiện hủy lịch "${event.name}" (${data.fromDate} - ${data.toDate}): hủy ${cancelledMealCount} bếp ăn, hủy ${cancelledRegistrationCount} suất đã đăng ký`,
      null,
      event,
    );

    const activeUserIds = await this.userRepository.getAllActiveIds();

    if (activeUserIds.length > 0) {
      await this.notificationService.createForUsers(
        {
          title: `Lịch nghỉ: ${event.name}`,
          content:
            data.reason ||
            `Cơ quan nghỉ từ ${data.fromDate} đến ${data.toDate}, bếp ăn tạm ngừng phục vụ. Mọi suất ăn đã đăng ký trong khoảng này đã được tự động hủy.`,
          url: `/holiday-events?id=${event.id}`,
          createdBy: actor.actorId || null,
        },
        activeUserIds,
      );
    }

    return event;
  }

  // Restore only snapshots captured by a holiday, atomically with its status.
  async restore(id, actor = {}) {
    const event = await this.get(id);
    const { restored, restoredMealCount, restoredRegistrations } =
      await this.holidayEventRepository.restoreWithRegistrations(id, actor.actorId || null);

    await this.logAction(
      LOG_ACTION.ACTION_UPDATE,
      actor,
      `holiday_event:${id}`,
      `Mở lại sự kiện hủy lịch "${event.name}": mở lại ${restoredMealCount} bếp ăn, khôi phục ${restoredRegistrations.length} suất đăng ký đã hủy`,
      event,
      restored,
    );

    const restoredUserIds = [
      ...new Set(restoredRegistrations.map((row) => row.userId)),
    ];

    if (restoredUserIds.length > 0) {
      await this.notificationService.createForUsers(
        {
          title: `Mở lại lịch: ${event.name}`,
          content: `Bếp ăn từ ${event.fromDate} đến ${event.toDate} đã phục vụ trở lại. Suất ăn bạn đã đăng ký trước đó trong khoảng ngày này đã được khôi phục.`,
          url: `/holiday-events?id=${event.id}`,
          createdBy: actor.actorId || null,
        },
        restoredUserIds,
      );
    }

    return restored;
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

module.exports = HolidayEventService;
