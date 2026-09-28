const ApiResponse = require("../ultis/ApiResponse");

class DashboardController {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }

  // GET /api/dashboard/home
  getHome = async (req, res, next) => {
    try {
      const data = await this.dashboardService.getHomeData(req.user.id, req.query.date);

      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/dashboard/chart?period=week|month|year&date=YYYY-MM-DD
  getChart = async (req, res, next) => {
    try {
      const { period, date } = req.query;
      const data = await this.dashboardService.getChart(period, date);

      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = DashboardController;
