const ApiResponse = require("../ultis/ApiResponse");
const paginate = require("../ultis/paginate");

class AuditLogController {
  constructor(auditLogService) {
    this.auditLogService = auditLogService;
  }

  list = async (req, res, next) => {
    try {
      const logs = await this.auditLogService.list();

      return ApiResponse.success(res, paginate(logs, req.query));
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const log = await this.auditLogService.get(req.params.id);

      return ApiResponse.success(res, log);
    } catch (error) {
      next(error);
    }
  };

  filter = async (req, res, next) => {
    try {
      const { query, actor, action, target, result, status } = req.query;

      const logs = await this.auditLogService.filter(
        query,
        actor,
        action,
        target,
        result,
        status,
      );

      return ApiResponse.success(res, paginate(logs, req.query));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuditLogController;
