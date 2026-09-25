const AuditLogRepository = require("../../repos/AuditLogRepository");

const AuditLogService = require("../../services/AuditLogService");

const AuditLogController = require("../../controllers/AuditLogController");

const auditLogRoutes = require("../../routes/AuditLogRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const auditLogRepository = new AuditLogRepository();

const auditLogService = new AuditLogService(auditLogRepository);

const auditLogController = new AuditLogController(auditLogService);

module.exports = {
  router: auditLogRoutes(auditLogController, authMiddleware, authorize),
  service: auditLogService,
};
