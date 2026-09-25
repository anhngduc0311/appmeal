const UserRepository = require("../../repos/UserRepository");
const RoleRepository = require("../../repos/RoleRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");

const AuditLogService = require("../../services/AuditLogService");
const UserService = require("../../services/UserService");

const UserController = require("../../controllers/UserController");

const userRoutes = require("../../routes/UserRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const auditLogRepository = new AuditLogRepository();

const auditLogService = new AuditLogService(auditLogRepository);
const userService = new UserService(userRepository, roleRepository, auditLogService);

const userController = new UserController(userService);

module.exports = {
  router: userRoutes(userController, authMiddleware, authorize),
  service: userService,
};
