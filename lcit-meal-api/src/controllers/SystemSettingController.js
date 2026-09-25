const ApiResponse = require("../ultis/ApiResponse");

const getActor = (req) => ({
  actorId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

class SystemSettingController {
  constructor(systemSettingService) {
    this.systemSettingService = systemSettingService;
  }

  list = async (req, res, next) => {
    try {
      const settings = await this.systemSettingService.list();

      return ApiResponse.success(res, settings);
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const setting = await this.systemSettingService.get(req.params.id);

      return ApiResponse.success(res, setting);
    } catch (error) {
      next(error);
    }
  };

  getByKey = async (req, res, next) => {
    try {
      const setting = await this.systemSettingService.getByKey(req.params.key);

      return ApiResponse.success(res, setting);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const setting = await this.systemSettingService.create(
        req.body,
        getActor(req),
      );

      return ApiResponse.success(res, setting, 201);
    } catch (error) {
      next(error);
    }
  };

  updateByKey = async (req, res, next) => {
    try {
      const setting = await this.systemSettingService.updateByKey(
        req.params.key,
        req.body,
        getActor(req),
      );

      return ApiResponse.success(res, setting);
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/system-settings/bulk - body: { settings: [{ settingKey, settingValue }, ...] }
  updateMany = async (req, res, next) => {
    try {
      const settings = await this.systemSettingService.updateMany(
        req.body.settings,
        getActor(req),
      );

      return ApiResponse.success(res, settings);
    } catch (error) {
      next(error);
    }
  };

  uploadPaymentQr = async (req, res, next) => {
    try {
      const setting = await this.systemSettingService.uploadPaymentQr(
        req.file,
        getActor(req),
      );
      return ApiResponse.success(res, setting);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = SystemSettingController;
