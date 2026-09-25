const MealOptionRepository = require("../../repos/MealOptionRepository");
const UserRepository = require("../../repos/UserRepository");
const NotificationRepository = require("../../repos/NotificationRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");
const MealRegistrationRepository = require("../../repos/MealRegistrationRepository");
const SystemSettingRepository = require("../../repos/SystemSettingRepository");

const NotificationService = require("../../services/NotificationService");
const AuditLogService = require("../../services/AuditLogService");
const MealOptionService = require("../../services/MealOptionService");

const MealOptionController = require("../../controllers/MealOptionController");

const mealOptionRoutes = require("../../routes/MealOptionRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const mealOptionRepository = new MealOptionRepository();
const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();
const auditLogRepository = new AuditLogRepository();
const mealRegistrationRepository = new MealRegistrationRepository();
const systemSettingRepository = new SystemSettingRepository();

const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);
const auditLogService = new AuditLogService(auditLogRepository);

const mealOptionService = new MealOptionService(
  mealOptionRepository,
  userRepository,
  notificationService,
  auditLogService,
  mealRegistrationRepository,
  systemSettingRepository,
);

const mealOptionController = new MealOptionController(mealOptionService);

module.exports = {
  router: mealOptionRoutes(mealOptionController, authMiddleware, authorize),
  service: mealOptionService,
};
