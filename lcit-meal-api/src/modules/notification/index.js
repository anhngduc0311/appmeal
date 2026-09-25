const NotificationRepository = require("../../repos/NotificationRepository");
const UserRepository = require("../../repos/UserRepository");

const NotificationService = require("../../services/NotificationService");

const NotificationController = require("../../controllers/NotificationController");

const notificationRoutes = require("../../routes/NotificationRoutes");

const authMiddleware = require("../../middlewares/authMiddleware");
const authorize = require("../../middlewares/authorizeMiddleware");

const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();

// userRepository được inject để NotificationService có thể notifyRoles()
// (tra danh sách user theo role qua bảng trung gian user_role) khi cần
// broadcast thông báo cho toàn bộ admin/manager.
const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);

const notificationController = new NotificationController(notificationService);

module.exports = {
  router: notificationRoutes(notificationController, authMiddleware, authorize),

  service: notificationService,
};
