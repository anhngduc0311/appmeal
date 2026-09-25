const express = require("express");

// Trang chủ chỉ cần người dùng đã đăng nhập (không giới hạn theo role cụ
// thể) vì admin/manager/employee đều xem trang chủ, chỉ khác dữ liệu
// hiển thị tùy theo role ở phía frontend.
const dashboardRoutes = (dashboardController, authMiddleware) => {
  const router = express.Router();

  router.use(authMiddleware);

  // GET /api/dashboard/home
  router.get("/home", dashboardController.getHome);

  // GET /api/dashboard/chart?period=week|month|year&date=YYYY-MM-DD
  router.get("/chart", dashboardController.getChart);

  return router;
};

module.exports = dashboardRoutes;
