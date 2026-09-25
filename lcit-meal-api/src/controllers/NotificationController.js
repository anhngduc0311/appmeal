const ApiResponse = require("../ultis/ApiResponse");
const paginate = require("../ultis/paginate");

class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  list = async (req, res, next) => {
    try {
      const notifications = await this.notificationService.list();

      return ApiResponse.success(res, paginate(notifications, req.query));
    } catch (error) {
      next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const notification = await this.notificationService.get(req.params.id);

      return ApiResponse.success(res, notification);
    } catch (error) {
      next(error);
    }
  };

  filter = async (req, res, next) => {
    try {
      const { query, status } = req.query;

      const notifications = await this.notificationService.filter(
        query,
        status,
      );

      return ApiResponse.success(res, paginate(notifications, req.query));
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const notification = await this.notificationService.create({
        ...req.body,
        createdBy: req.user.id,
      });

      return ApiResponse.success(res, notification, 201);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/notifications/send
  // Tạo thông báo và gửi tới người nhận cụ thể (body.userIds), hoặc broadcast
  // cho toàn bộ user đang active nếu không truyền userIds (dùng cho màn hình
  // "Quản lý thông báo" phía admin: gửi 1 người hoặc "Tất cả người dùng").
  send = async (req, res, next) => {
    try {
      const { userIds, ...data } = req.body;

      const notification = await this.notificationService.createForUsers(
        { ...data, createdBy: req.user.id },
        userIds,
      );

      return ApiResponse.success(res, notification, 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const notification = await this.notificationService.update(
        req.params.id,
        { ...req.body, updatedBy: req.user.id },
      );

      return ApiResponse.success(res, notification);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.notificationService.delete(req.params.id, req.user.id);

      return ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  };

  // ===== Endpoint dựa trên bảng trung gian notification_recipient =====

  // Danh sách thông báo của chính người dùng đang đăng nhập.
  // ?unseen=1 để chỉ lấy thông báo chưa đọc.
  listMine = async (req, res, next) => {
    try {
      const onlyUnseen = req.query.unseen === "1" || req.query.unseen === "true";

      const notifications = await this.notificationService.listForUser(
        req.user.id,
        onlyUnseen,
      );

      return ApiResponse.success(res, paginate(notifications, req.query));
    } catch (error) {
      next(error);
    }
  };

  unseenCount = async (req, res, next) => {
    try {
      const total = await this.notificationService.countUnseenForUser(
        req.user.id,
      );

      return ApiResponse.success(res, { total });
    } catch (error) {
      next(error);
    }
  };

  markSeen = async (req, res, next) => {
    try {
      await this.notificationService.markSeen(req.params.id, req.user.id);

      return ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  };

  markAllSeen = async (req, res, next) => {
    try {
      await this.notificationService.markAllSeenForUser(req.user.id);

      return ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = NotificationController;
