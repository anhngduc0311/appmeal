const DASHBOARD_CHART_PERIODS = ["week", "month", "year"];

class DashboardService {
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  async getHomeData(userId) {
    return this.dashboardRepository.getHomeData(userId);
  }

  // Dữ liệu biểu đồ trang chủ theo filter tuần/tháng/năm.
  // period không hợp lệ -> mặc định "week" (giữ hành vi cũ: 7 ngày gần nhất).
  async getChart(period, date) {
    const safePeriod = DASHBOARD_CHART_PERIODS.includes(period)
      ? period
      : "week";

    const safeDate =
      typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : undefined;

    return this.dashboardRepository.getChartByPeriod(safePeriod, safeDate);
  }
}

module.exports = DashboardService;
