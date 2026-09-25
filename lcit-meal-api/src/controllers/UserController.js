const ApiResponse = require("../ultis/ApiResponse");
const paginate = require("../ultis/paginate");

// Trích thông tin người thực hiện thao tác từ request đã qua authMiddleware,
// dùng để ghi audit log và gán created_by/updated_by.
const getActor = (req) => ({
  actorId: req.user ? req.user.id : null,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  list = async (req, res, next) => {
    try {
      const users = await this.userService.list();

      return ApiResponse.success(res, paginate(users, req.query));
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const user = await this.userService.get(req.params.id);

      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  filter = async (req, res, next) => {
    try {
      const { query, role, status } = req.query;

      const users = await this.userService.filter(query, role, status);

      return ApiResponse.success(res, paginate(users, req.query));
    } catch (error) {
      next(error);
    }
  };

  checkUsername = async (req, res, next) => {
    try {
      return ApiResponse.success(
        res,
        await this.userService.checkUsername(
          req.query.username,
          req.query.excludeId,
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const user = await this.userService.create(req.body, getActor(req));

      return ApiResponse.success(res, user, 201);
    } catch (error) {
      next(error);
    }
  };

  createBatch = async (req, res, next) => {
    try {
      const result = await this.userService.createBatch(
        req.body.users,
        getActor(req),
      );
      return ApiResponse.success(res, result, 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const user = await this.userService.update(
        req.params.id,
        req.body,
        getActor(req),
      );

      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/users/me - tự cập nhật hồ sơ / đổi mật khẩu của chính mình
  updateProfile = async (req, res, next) => {
    try {
      const user = await this.userService.updateOwnProfile(
        req.user.id,
        req.body,
        getActor(req),
      );

      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.userService.delete(req.params.id, getActor(req));

      return ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  };

  forceDelete = async (req, res, next) => {
    try {
      await this.userService.forceDelete(req.params.id, getActor(req));

      return ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserController;
