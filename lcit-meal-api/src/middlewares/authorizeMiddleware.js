const ApiResponse = require("../ultis/ApiResponse");

/**
 * Middleware phân quyền theo role.
 * Phải đứng SAU authMiddleware (cần req.user đã được gán sẵn).
 *
 * Cách dùng:
 *   router.post("/", authMiddleware, authorize(ROLE.ADMIN), controller.create);
 *   router.get("/", authMiddleware, authorize(ROLE.ADMIN, ROLE.MANAGER), controller.list);
 *
 * Nếu không truyền role nào, middleware chỉ yêu cầu user đã đăng nhập
 * (đã được authMiddleware đảm bảo trước đó).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return ApiResponse.error(res, "Chưa xác thực", 401);
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    const roleCodes = (user.roles || []).map((role) => role.code);
    const isAllowed = allowedRoles.some((role) => roleCodes.includes(role));

    if (!isAllowed) {
      return ApiResponse.error(
        res,
        "Bạn không có quyền thực hiện thao tác này",
        403,
      );
    }

    return next();
  };
};

module.exports = authorize;
