const express = require("express");

const ROLE = require("../constants/Role");

// Xem danh sách sự kiện hủy lịch: mọi nhân sự nghiệp vụ (để biết ngày nào
// cơ quan nghỉ). Tạo/mở lại sự kiện: chỉ admin + manager.
const holidayEventRoutes = (
  holidayEventController,
  authMiddleware,
  authorize,
) => {
  const router = express.Router();

  router.use(authMiddleware);

  // GET /api/holiday-events
  router.get(
    "/",
    authorize(...ROLE.STAFF_ROLES),
    holidayEventController.list,
  );

  // GET /api/holiday-events/:id
  router.get(
    "/:id",
    authorize(...ROLE.STAFF_ROLES),
    holidayEventController.get,
  );

  // POST /api/holiday-events - tạo sự kiện hủy lịch (nghỉ lễ/Tết/sự kiện),
  // chọn 1 ngày hoặc 1 khoảng ngày, áp dụng cho TOÀN BỘ nhân viên
  router.post(
    "/",
    authorize(ROLE.ADMIN, ROLE.MANAGER),
    holidayEventController.create,
  );

  // PATCH /api/holiday-events/:id/restore - mở lại (hủy nhầm)
  router.patch(
    "/:id/restore",
    authorize(ROLE.ADMIN, ROLE.MANAGER),
    holidayEventController.restore,
  );

  return router;
};

module.exports = holidayEventRoutes;
