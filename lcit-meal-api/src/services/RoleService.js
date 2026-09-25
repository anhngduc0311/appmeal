const AppError = require("../ultis/AppError");

// Danh sách vai trò (role) là dữ liệu tương đối tĩnh, dùng để hiển thị dropdown
// khi tạo/sửa người dùng ở phía frontend (UserForm). Chỉ cần các thao tác đọc.
class RoleService {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async list() {
    return this.roleRepository.list();
  }

  async get(id) {
    const role = await this.roleRepository.get(id);

    if (!role) {
      throw new AppError("Vai trò không tồn tại", 404);
    }

    return role;
  }

  async getByCode(code) {
    const role = await this.roleRepository.getByCode(code);

    if (!role) {
      throw new AppError("Vai trò không tồn tại", 404);
    }

    return role;
  }
}

module.exports = RoleService;
