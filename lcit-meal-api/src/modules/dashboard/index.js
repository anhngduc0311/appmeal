const DashboardRepository = require("../../repos/DashboardRepository");

const DashboardService = require("../../services/DashboardService");

const DashboardController = require("../../controllers/DashboardController");

const dashboardRoutes = require("../../routes/DashboardRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");

const dashboardRepository = new DashboardRepository();

const dashboardService = new DashboardService(dashboardRepository);

const dashboardController = new DashboardController(dashboardService);

module.exports = {
  router: dashboardRoutes(dashboardController, authMiddleware),
  service: dashboardService,
};
