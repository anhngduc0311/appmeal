const SystemSettingRepository = require("../../repos/SystemSettingRepository");
const AuditLogRepository = require("../../repos/AuditLogRepository");
const MealScheduleConfigRepository = require("../../repos/MealScheduleConfigRepository");

const AuditLogService = require("../../services/AuditLogService");
const SystemSettingService = require("../../services/SystemSettingService");
const MealScheduleConfigService = require("../../services/MealScheduleConfigService");

const SystemSettingController = require("../../controllers/SystemSettingController");
const MealScheduleConfigController = require("../../controllers/MealScheduleConfigController");

const systemSettingRoutes = require("../../routes/SystemSettingRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const systemSettingRepository = new SystemSettingRepository();
const auditLogRepository = new AuditLogRepository();
const mealScheduleConfigRepository = new MealScheduleConfigRepository();

const auditLogService = new AuditLogService(auditLogRepository);

const systemSettingService = new SystemSettingService(
  systemSettingRepository,
  auditLogService,
);
// Quản lý "Các ngày ăn trong tuần" - gộp chung vào cùng module/route với
// Quản lý cấu hình hệ thống (system-settings), theo đúng yêu cầu nghiệp vụ.
const mealScheduleConfigService = new MealScheduleConfigService(
  mealScheduleConfigRepository,
  auditLogService,
);

const systemSettingController = new SystemSettingController(
  systemSettingService,
);
const mealScheduleConfigController = new MealScheduleConfigController(
  mealScheduleConfigService,
);

module.exports = {
  router: systemSettingRoutes(
    systemSettingController,
    authMiddleware,
    authorize,
    mealScheduleConfigController,
  ),
  service: systemSettingService,
  mealScheduleConfigService,
};
