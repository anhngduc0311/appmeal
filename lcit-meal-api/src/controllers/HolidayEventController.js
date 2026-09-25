const ApiResponse = require("../ultis/ApiResponse");
const paginate = require("../ultis/paginate");

const getActor = (req) => ({
  actorId: req.user ? req.user.id : null,
  roles: req.user ? (req.user.roles || []).map((role) => role.code) : [],
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

class HolidayEventController {
  constructor(holidayEventService) {
    this.holidayEventService = holidayEventService;
  }

  list = async (req, res, next) => {
    try {
      const events = await this.holidayEventService.list();

      return ApiResponse.success(res, paginate(events, req.query));
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const event = await this.holidayEventService.get(req.params.id);

      return ApiResponse.success(res, event);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const event = await this.holidayEventService.create(
        req.body,
        getActor(req),
      );

      return ApiResponse.success(res, event, 201);
    } catch (error) {
      next(error);
    }
  };

  restore = async (req, res, next) => {
    try {
      const event = await this.holidayEventService.restore(
        req.params.id,
        getActor(req),
      );

      return ApiResponse.success(res, event);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = HolidayEventController;
