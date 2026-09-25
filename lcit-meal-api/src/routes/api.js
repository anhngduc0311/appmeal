const express = require("express");

const authModule = require("../modules/auth");
const userModule = require("../modules/user");
const roleModule = require("../modules/role");
const auditLogModule = require("../modules/auditLog");
const notificationModule = require("../modules/notification");
const mealModule = require("../modules/meal");
const mealOptionModule = require("../modules/mealOption");
const mealRegistrationModule = require("../modules/mealRegistration");
const paymentModule = require("../modules/payment");
const systemSettingModule = require("../modules/systemSetting");
const holidayEventModule = require("../modules/holidayEvent");
const dashboardModule = require("../modules/dashboard");
const adminToolsRoutes = require("./AdminToolsRoutes");

const router = express.Router();

router.use("/auth", authModule.router);
router.use("/users", userModule.router);
router.use("/roles", roleModule.router);
router.use("/audit-logs", auditLogModule.router);
router.use("/notifications", notificationModule.router);
router.use("/meals", mealModule.router);
router.use("/meal-options", mealOptionModule.router);
router.use("/meal-registrations", mealRegistrationModule.router);
router.use("/payments", paymentModule.router);
router.use("/system-settings", systemSettingModule.router);
router.use("/holiday-events", holidayEventModule.router);
router.use("/dashboard", dashboardModule.router);
router.use("/admin-tools", adminToolsRoutes);

module.exports = router;
