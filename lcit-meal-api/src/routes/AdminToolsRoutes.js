const express = require("express");

const ROLE = require("../constants/Role");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const ApiResponse = require("../ultis/ApiResponse");
const { runAutoSchedule } = require("../jobs/autoScheduleJob");
const { runMealCompletion } = require("../jobs/mealCompletionJob");

const router = express.Router();

router.use(authMiddleware);

// POST /api/admin-tools/run-auto-schedule?month=YYYY-MM
// Kích hoạt thủ công job "tạo bếp ăn + tự động đăng ký cho 1 tháng" thay
// vì phải đợi tới giờ chạy cron (20:00 ngày bắt đầu tháng) - dùng để
// test/demo, hoặc được trang "Lịch ăn" gọi khi admin/manager bấm nút
// "Tạo bếp ăn" và chọn tháng. Mặc định (không truyền `month`) tạo cho
// THÁNG HIỆN TẠI. Job tự loại trừ các ngày rơi vào sự kiện hủy lịch
// (holiday_event) đang active và an toàn khi gọi lại nhiều lần (không tạo
// trùng). Ví dụ:
//   POST /admin-tools/run-auto-schedule?month=2026-09
router.post(
  "/run-auto-schedule",
  authorize(ROLE.ADMIN, ROLE.MANAGER),
  async (req, res, next) => {
    try {
      const result = await runAutoSchedule(req.query.month);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/admin-tools/run-meal-completion
// Kích hoạt thủ công job "đánh dấu suất ăn đã hoàn thành" (confirmed ->
// completed) thay vì phải đợi tới giờ chạy cron (12:00 trưa) - dùng để
// test/demo. Mặc định áp dụng cho HÔM NAY. Muốn chạy cho ngày khác, truyền
// query `date`, ví dụ:
//   POST /admin-tools/run-meal-completion?date=2026-09-08
router.post(
  "/run-meal-completion",
  authorize(ROLE.ADMIN),
  async (req, res, next) => {
    try {
      const result = await runMealCompletion(req.query.date);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
