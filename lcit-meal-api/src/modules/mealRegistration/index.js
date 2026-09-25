const MealRegistrationRepository = require("../../repos/MealRegistrationRepository");
const MealRepository = require("../../repos/MealRepository");
const NotificationRepository = require("../../repos/NotificationRepository");
const UserRepository = require("../../repos/UserRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");
const SystemSettingRepository = require("../../repos/SystemSettingRepository");

const NotificationService = require("../../services/NotificationService");
const AuditLogService = require("../../services/AuditLogService");
const MealRegistrationService = require("../../services/MealRegistrationService");

const MealRegistrationController = require("../../controllers/MealRegistrationController");

const mealRegistrationRoutes = require("../../routes/MealRegistrationRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const mealRegistrationRepository = new MealRegistrationRepository();
const mealRepository = new MealRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();
const auditLogRepository = new AuditLogRepository();
const systemSettingRepository = new SystemSettingRepository();

const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);
const auditLogService = new AuditLogService(auditLogRepository);

const mealRegistrationService = new MealRegistrationService(
  mealRegistrationRepository,
  mealRepository,
  notificationService,
  auditLogService,
  systemSettingRepository,
);

const mealRegistrationController = new MealRegistrationController(
  mealRegistrationService,
);

module.exports = {
  router: mealRegistrationRoutes(
    mealRegistrationController,
    authMiddleware,
    authorize,
  ),
  service: mealRegistrationService,
};
