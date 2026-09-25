const PaymentRepository = require("../../repos/PaymentRepository");
const NotificationRepository = require("../../repos/NotificationRepository");
const UserRepository = require("../../repos/UserRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");

const NotificationService = require("../../services/NotificationService");
const AuditLogService = require("../../services/AuditLogService");
const PaymentService = require("../../services/PaymentService");

const PaymentController = require("../../controllers/PaymentController");

const paymentRoutes = require("../../routes/PaymentRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const paymentRepository = new PaymentRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();

const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);
const auditLogService = new AuditLogService(auditLogRepository);

const paymentService = new PaymentService(
  paymentRepository,
  notificationService,
  auditLogService,
);

const paymentController = new PaymentController(paymentService);

module.exports = {
  router: paymentRoutes(paymentController, authMiddleware, authorize),
  service: paymentService,
};
