// Lỗi nghiệp vụ có kèm statusCode HTTP, dùng xuyên suốt tầng Service.
// errorMiddleware sẽ đọc err.statusCode để trả đúng mã lỗi cho client
// (thay vì mặc định 500 cho mọi lỗi như trước đây).
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
