const HolidayEventRepository = require("../../repos/HolidayEventRepository");
const MealRepository = require("../../repos/MealRepository");
const MealRegistrationRepository = require("../../repos/MealRegistrationRepository");
const UserRepository = require("../../repos/UserRepository");
const NotificationRepository = require("../../repos/NotificationRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");

const NotificationService = require("../../services/NotificationService");
const AuditLogService = require("../../services/AuditLogService");
const HolidayEventService = require("../../services/HolidayEventService");

const HolidayEventController = require("../../controllers/HolidayEventController");

const holidayEventRoutes = require("../../routes/HolidayEventRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const holidayEventRepository = new HolidayEventRepository();
const mealRepository = new MealRepository();
const mealRegistrationRepository = new MealRegistrationRepository();
const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();
const auditLogRepository = new AuditLogRepository();

const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);
const auditLogService = new AuditLogService(auditLogRepository);

const holidayEventService = new HolidayEventService(
  holidayEventRepository,
  mealRepository,
  mealRegistrationRepository,
  userRepository,
  notificationService,
  auditLogService,
);

const holidayEventController = new HolidayEventController(
  holidayEventService,
);

module.exports = {
  router: holidayEventRoutes(holidayEventController, authMiddleware, authorize),
  service: holidayEventService,
};
