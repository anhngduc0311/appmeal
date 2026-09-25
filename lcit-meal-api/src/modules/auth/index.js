const UserRepository = require("../../repos/UserRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");

const AuditLogService = require("../../services/AuditLogService");
const AuthService = require("../../services/AuthService");

const AuthController = require("../../controllers/AuthController");

const authRoutes = require("../../routes/AuthRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");

const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();

const auditLogService = new AuditLogService(auditLogRepository);
const authService = new AuthService(userRepository, auditLogService);

const authController = new AuthController(authService);

module.exports = {
  router: authRoutes(authController, authMiddleware),
  service: authService,
};
