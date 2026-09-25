const jwt = require("jsonwebtoken");

const UserRepository = require("../repos/UserRepository");
const ApiResponse = require("../ultis/ApiResponse");
const USER_STATUS = require("../constants/UserStatus");

const userRepository = new UserRepository();

/**
 * Middleware xác thực (Authentication).
 * - Kiểm tra header Authorization: Bearer <token>
 * - Verify JWT
 * - Đối chiếu access_token còn hiệu lực trong DB (cho phép thu hồi token khi logout)
 * - Gắn req.user (kèm roles) cho các middleware/controller phía sau dùng
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return ApiResponse.error(res, "Token không tồn tại", 401);
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return ApiResponse.error(res, "Token không hợp lệ", 401);
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepository.get(decoded.id);

    if (!user) {
      return ApiResponse.error(res, "User không tồn tại", 401);
    }

    if (String(user.status) !== String(USER_STATUS.STATUS_ACTIVE)) {
      return ApiResponse.error(res, "Tài khoản không hoạt động", 401);
    }

    if (user.accessToken !== token) {
      return ApiResponse.error(res, "Token đã bị thu hồi", 401);
    }

    req.user = user;
    req.token = token;

    return next();
  } catch (error) {
    return ApiResponse.error(
      res,
      "Token không hợp lệ hoặc đã hết hạn",
      401,
    );
  }
};

module.exports = authMiddleware;
