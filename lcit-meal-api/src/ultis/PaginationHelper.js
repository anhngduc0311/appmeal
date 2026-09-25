/**
 * Pagination Helper - Hỗ trợ phân trang
 * Sử dụng khi query danh sách dữ liệu từ DB
 */

class PaginationHelper {
  /**
   * Kiến tạo pagination từ request query
   * @param {number} page - Số trang (bắt đầu từ 1)
   * @param {number} limit - Số bản ghi trên 1 trang (mặc định 10, tối đa 100)
   * @returns {Object} { page, limit, offset }
   */
  static parsePagination(page = 1, limit = 10) {
    // Validate page
    page = Math.max(1, parseInt(page) || 1);

    // Validate limit (tối thiểu 1, tối đa 100)
    limit = Math.min(
      100,
      Math.max(1, parseInt(limit) || 10)
    );

    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Tạo response pagination metadata
   * @param {number} page - Số trang hiện tại
   * @param {number} limit - Số bản ghi trên 1 trang
   * @param {number} total - Tổng số bản ghi
   * @returns {Object} Pagination metadata
   */
  static createMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      offset: (page - 1) * limit,
    };
  }

  /**
   * Append LIMIT OFFSET vào SQL
   * @param {string} sql - SQL query
   * @param {number} limit - Số bản ghi trên 1 trang
   * @param {number} offset - Offset
   * @returns {string} SQL with LIMIT OFFSET
   */
  static appendPaginationSQL(sql, limit, offset) {
    return `${sql} LIMIT ? OFFSET ?`;
  }

  /**
   * Tạo params cho pagination query
   * @param {Array} existingParams - Existing query params
   * @param {number} limit - Số bản ghi trên 1 trang
   * @param {number} offset - Offset
   * @returns {Array} Merged params
   */
  static appendPaginationParams(existingParams = [], limit, offset) {
    return [...existingParams, limit, offset];
  }

  /**
   * Validate page và limit từ query string
   * @param {Express.Request} req
   * @returns {Object} { page, limit }
   */
  static getFromRequest(req) {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    return this.parsePagination(page, limit);
  }

  /**
   * Tạo response object với pagination
   * @param {Array} data - Danh sách dữ liệu
   * @param {number} page - Số trang hiện tại
   * @param {number} limit - Số bản ghi trên 1 trang
   * @param {number} total - Tổng số bản ghi
   * @returns {Object} { data, pagination }
   */
  static createResponse(data, page, limit, total) {
    return {
      data,
      pagination: this.createMeta(page, limit, total),
    };
  }
}

module.exports = PaginationHelper;
