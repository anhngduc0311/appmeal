const ApiResponse = require("../ultis/ApiResponse");

const getActor = (req) => ({
  actorId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

class MealScheduleConfigController {
  constructor(mealScheduleConfigService) {
    this.mealScheduleConfigService = mealScheduleConfigService;
  }

  list = async (req, res, next) => {
    try {
      const result = await this.mealScheduleConfigService.list();

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateMany = async (req, res, next) => {
    try {
      const result = await this.mealScheduleConfigService.updateMany(
        req.body,
        getActor(req),
      );

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = MealScheduleConfigController;
