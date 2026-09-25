const express = require("express");

const ROLE = require("../constants/Role");

// Danh sách vai trò dùng để hiển thị dropdown khi tạo/sửa người dùng.
// Cùng quyền xem với API /users (admin + manager).
const roleRoutes = (roleController, authMiddleware, authorize) => {
  const router = express.Router();

  router.use(authMiddleware);

  // GET /api/roles
  router.get("/", authorize(ROLE.ADMIN, ROLE.MANAGER), roleController.list);

  // GET /api/roles/code/:code - đặt trước "/:id" để tránh bị nuốt route
  router.get(
    "/code/:code",
    authorize(ROLE.ADMIN, ROLE.MANAGER),
    roleController.getByCode,
  );

  // GET /api/roles/:id
  router.get(
    "/:id",
    authorize(ROLE.ADMIN, ROLE.MANAGER),
    roleController.get,
  );

  return router;
};

module.exports = roleRoutes;
