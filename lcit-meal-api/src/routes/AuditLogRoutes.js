const express = require("express");

const ROLE = require("../constants/Role");

// Audit log là dữ liệu nhạy cảm (vết thao tác/bảo mật hệ thống) -> chỉ admin được xem.
const auditLogRoutes = (auditLogController, authMiddleware, authorize) => {
  const router = express.Router();

  router.use(authMiddleware, authorize(ROLE.ADMIN));

  // GET /api/audit-logs
  router.get("/", auditLogController.list);

  // GET /api/audit-logs/filter
  router.get("/filter", auditLogController.filter);

  // GET /api/audit-logs/:id
  router.get("/:id", auditLogController.get);

  return router;
};

module.exports = auditLogRoutes;
