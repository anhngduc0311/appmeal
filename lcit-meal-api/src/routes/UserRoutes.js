const express = require("express");

const ROLE = require("../constants/Role");

// Quản lý người dùng: xem danh sách/chi tiết dành cho admin + manager,
// các thao tác thay đổi dữ liệu (tạo/sửa/xóa) chỉ dành cho admin.
const userRoutes = (userController, authMiddleware, authorize) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.get("/", authorize(ROLE.ADMIN, ROLE.MANAGER), userController.list);
  router.get(
    "/filter",
    authorize(ROLE.ADMIN, ROLE.MANAGER),
    userController.filter,
  );
  router.get(
    "/availability",
    authorize(ROLE.ADMIN),
    userController.checkUsername,
  );
  router.post("/batch", authorize(ROLE.ADMIN), userController.createBatch);
  // PATCH /api/users/me - mọi user đã đăng nhập tự đổi hồ sơ/mật khẩu của mình
  router.patch("/me", authorize(), userController.updateProfile);
  router.get("/:id", authorize(ROLE.ADMIN, ROLE.MANAGER), userController.get);
  router.post("/", authorize(ROLE.ADMIN), userController.create);
  router.put("/:id", authorize(ROLE.ADMIN), userController.update);
  router.delete("/:id", authorize(ROLE.ADMIN), userController.delete);
  router.delete(
    "/:id/force",
    authorize(ROLE.ADMIN),
    userController.forceDelete,
  );

  return router;
};

module.exports = userRoutes;
