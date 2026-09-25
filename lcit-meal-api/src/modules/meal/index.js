const MealRepository = require("../../repos/MealRepository");
const MealRegistrationRepository = require("../../repos/MealRegistrationRepository");
const NotificationRepository = require("../../repos/NotificationRepository");
const UserRepository = require("../../repos/UserRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");

const NotificationService = require("../../services/NotificationService");
const AuditLogService = require("../../services/AuditLogService");
const MealService = require("../../services/MealService");

const MealController = require("../../controllers/MealController");

const mealRoutes = require("../../routes/MealRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const mealRepository = new MealRepository();
const mealRegistrationRepository = new MealRegistrationRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();

const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);
const auditLogService = new AuditLogService(auditLogRepository);

const mealService = new MealService(
  mealRepository,
  mealRegistrationRepository,
  notificationService,
  auditLogService,
);

const mealController = new MealController(mealService);

module.exports = {
  router: mealRoutes(mealController, authMiddleware, authorize),
  service: mealService,
};
