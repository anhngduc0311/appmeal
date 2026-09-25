const ApiResponse = require("../ultis/ApiResponse");

class RoleController {
  constructor(roleService) {
    this.roleService = roleService;
  }

  list = async (req, res, next) => {
    try {
      const roles = await this.roleService.list();

      return ApiResponse.success(res, roles);
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const role = await this.roleService.get(req.params.id);

      return ApiResponse.success(res, role);
    } catch (error) {
      next(error);
    }
  };

  getByCode = async (req, res, next) => {
    try {
      const role = await this.roleService.getByCode(req.params.code);

      return ApiResponse.success(res, role);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = RoleController;
