// Khớp với cột `role`.`code` trong database
const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  KITCHEN: "kitchen",
};

// Nhóm "nhân sự nghiệp vụ" - mọi vai trò trừ bếp (kitchen). Bếp chỉ được
// xem trang chủ (dashboard) để biết số suất cần chuẩn bị, không truy cập
// các API nghiệp vụ khác (đăng ký ăn, thanh toán, quản lý người dùng...).
ROLE.STAFF_ROLES = [ROLE.ADMIN, ROLE.MANAGER, ROLE.EMPLOYEE];

module.exports = ROLE;
