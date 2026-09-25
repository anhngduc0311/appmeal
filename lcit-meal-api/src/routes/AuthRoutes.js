const express = require("express");

const authRoutes = (authController, authMiddleware) => {
  const router = express.Router();

  // Login (public)
  router.post("/login", authController.login);

  // Logout (yêu cầu đã đăng nhập)
  router.post("/logout", authMiddleware, authController.logout);

  return router;
};

module.exports = authRoutes;
