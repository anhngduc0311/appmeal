const express = require("express");

const ROLE = require("../constants/Role");
const multer = require("multer");

const paymentQrUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(
      null,
      ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype),
    );
  },
}).single("file");

// Xem cấu hình hệ thống: mọi nhân sự nghiệp vụ (cần biết giá suất ăn...), trừ bếp.
// Tạo/sửa cấu hình: chỉ admin.
const systemSettingRoutes = (
  systemSettingController,
  authMiddleware,
  authorize,
  mealScheduleConfigController,
) => {
  const router = express.Router();

  router.use(authMiddleware);

  // GET /api/system-settings
  router.get("/", authorize(...ROLE.STAFF_ROLES), systemSettingController.list);

  // Cấu hình "Các ngày ăn trong tuần" (meal_schedule_config) - gộp chung
  // vào trang Quản lý cấu hình hệ thống. Đặt trước "/:id" để tránh bị nuốt
  // route (":id" sẽ khớp với chuỗi bất kỳ nếu đặt sau).
  //
  // GET /api/system-settings/meal-schedule-config
  router.get(
    "/meal-schedule-config",
    authorize(...ROLE.STAFF_ROLES),
    mealScheduleConfigController.list,
  );

  // PUT /api/system-settings/meal-schedule-config
  router.put(
    "/meal-schedule-config",
    authorize(ROLE.ADMIN),
    mealScheduleConfigController.updateMany,
  );

  // GET /api/system-settings/key/:key - đặt trước "/:id" để tránh bị nuốt route
  router.get(
    "/key/:key",
    authorize(...ROLE.STAFF_ROLES),
    systemSettingController.getByKey,
  );

  // GET /api/system-settings/:id
  router.get(
    "/:id",
    authorize(...ROLE.STAFF_ROLES),
    systemSettingController.get,
  );

  // POST /api/system-settings
  router.post("/", authorize(ROLE.ADMIN), systemSettingController.create);

  // PUT /api/system-settings/key/:key
  router.put(
    "/key/:key",
    authorize(ROLE.ADMIN),
    systemSettingController.updateByKey,
  );

  // PUT /api/system-settings/bulk - cập nhật nhiều cấu hình cùng lúc
  router.put(
    "/bulk",
    authorize(ROLE.ADMIN),
    systemSettingController.updateMany,
  );
  router.post(
    "/payment-qr",
    authorize(ROLE.ADMIN),
    paymentQrUpload,
    systemSettingController.uploadPaymentQr,
  );

  return router;
};

module.exports = systemSettingRoutes;
