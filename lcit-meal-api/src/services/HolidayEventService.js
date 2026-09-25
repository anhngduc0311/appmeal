const { HOLIDAY_EVENT_STATUS } = require("../constants/HolidayEvent");
const MEAL_STATUS = require("../constants/Meal");
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

    const event = await this.holidayEventRepository.create({
      name: data.name.trim(),
      reason: data.reason,
      fromDate: data.fromDate,
      toDate: data.toDate,
      status: HOLIDAY_EVENT_STATUS.ACTIVE,
      createdBy: actor.actorId || null,
    });

    const dates = enumerateDates(data.fromDate, data.toDate);
    let cancelledMealCount = 0;

    for (const date of dates) {
      let meal = await this.mealRepository.getByDate(date);

      if (!meal) {
        meal = await this.mealRepository.create({
          mealDate: date,
          note: `Nghỉ lịch: ${event.name}`,
          status: MEAL_STATUS.ACTIVE,
        });
      }

      if (!meal.isCancelled) {
        await this.mealRepository.cancel(
          meal.id,
          actor.actorId || null,
          data.reason || `Nghỉ lịch: ${event.name}`,
        );
        cancelledMealCount += 1;
      }
    }

    const cancelledRegistrations =
      await this.mealRegistrationRepository.cancelAllByDateRange(
        data.fromDate,
        data.toDate,
      );

    await this.logAction(
      LOG_ACTION.ACTION_CANCEL,
      actor,
      `holiday_event:${event.id}`,
      `Tạo sự kiện hủy lịch "${event.name}" (${data.fromDate} - ${data.toDate}): hủy ${cancelledMealCount} bếp ăn, hủy ${cancelledRegistrations.length} suất đã đăng ký`,
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

  // Mở lại sự kiện hủy lịch đã tạo nhầm:
  //  1. Mở lại trạng thái bếp ăn (`meal.is_cancelled`) của các ngày trong khoảng.
  //  2. Khôi phục lại toàn bộ `meal_registration` đã bị hủy do chính sự kiện
  //     này (đối xứng với create() ở trên) - đưa về lại trạng thái
  //     "confirmed", để nhân viên không phải tự đăng ký lại từ đầu.
  //     LƯU Ý: vì hệ thống không lưu vết "ai bị hủy vì sự kiện nào", bước
  //     này khôi phục TẤT CẢ đăng ký đang "cancelled" rơi vào khoảng ngày
  //     của sự kiện - nếu 1 nhân viên tự hủy suất ăn của họ (không liên
  //     quan sự kiện) trong đúng khoảng ngày này, đăng ký đó cũng sẽ được
  //     khôi phục theo. Đây là đánh đổi chấp nhận được vì mục tiêu chính là
  //     tránh lỗi "mở lại lịch nhưng vẫn hủy đăng ký toàn bộ người dùng".
  async restore(id, actor = {}) {
    const event = await this.get(id);

    if (event.status !== HOLIDAY_EVENT_STATUS.ACTIVE) {
      throw new AppError("Sự kiện này đã được mở lại trước đó", 409);
    }

    const dates = enumerateDates(event.fromDate, event.toDate);
    let restoredMealCount = 0;

    for (const date of dates) {
      const meal = await this.mealRepository.getByDate(date);

      if (meal && meal.isCancelled) {
        await this.mealRepository.restore(meal.id);
        restoredMealCount += 1;
      }
    }

    const restoredRegistrations =
      await this.mealRegistrationRepository.restoreAllByDateRange(
        event.fromDate,
        event.toDate,
      );

    const restored = await this.holidayEventRepository.setStatus(
      id,
      HOLIDAY_EVENT_STATUS.RESTORED,
      actor.actorId || null,
    );

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
