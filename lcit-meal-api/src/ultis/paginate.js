// Helper phân trang dùng chung cho các API danh sách (users, payments,
// audit-logs, notifications, meal-registrations...).
//
// LƯU Ý VỀ CÁCH TRIỂN KHAI: phân trang được thực hiện ở tầng CONTROLLER
// (cắt mảng đã lấy đầy đủ từ Service/Repository), KHÔNG phải LIMIT/OFFSET
// ở tầng SQL. Lý do: nhiều truy vấn danh sách trong project này JOIN với
// bảng role/user_role rồi gộp (aggregate) nhiều dòng JOIN thành 1 user với
// mảng roles - nếu LIMIT/OFFSET ngay ở SQL sẽ cắt ngang phần JOIN và cho
// kết quả sai. Cách này an toàn, đúng dữ liệu, phù hợp quy mô dữ liệu của
// hệ thống quản lý suất ăn nội bộ. Nếu dữ liệu tăng rất lớn (hàng trăm
// nghìn dòng trở lên), nên cân nhắc viết lại bằng subquery phân trang
// trước rồi mới JOIN.
//
// Cách dùng trong controller:
//   const data = await this.xxxService.list();
//   return ApiResponse.success(res, paginate(data, req.query));
//
// Nếu request KHÔNG truyền `page`/`limit`, hàm trả nguyên mảng như cũ
// (không phá vỡ hành vi API hiện có, các client cũ vẫn chạy bình thường).
//
// SHAPE TRẢ VỀ: `{ data, pagination: { page, limit, total, totalPages,
// hasNextPage, hasPreviousPage } }` - khớp với `PaginatedResponse<T>` /
// `PaginationMeta` mà frontend (hook `usePagination`, component
// `Pagination`, và `MealService.filterMealsPaginated`) đang dùng. Trước
// đây hàm này trả về `{ items, page, pageSize, totalPages }` - khác tên
// field với những gì frontend mong đợi (`data`/`limit`/`hasNextPage`/
// `hasPreviousPage`), khiến các trang quản lý dùng chung `paginate()` này
// không thể hiển thị phân trang dù component đã tồn tại.
//
// Chấp nhận cả `limit` (tên tham số chuẩn, dùng chung với `/meals/filter`)
// lẫn `pageSize` (alias cũ) để tương thích ngược.
function paginate(items, { page, pageSize, limit } = {}) {
  const rawLimit = limit !== undefined ? limit : pageSize;

  if (page === undefined && rawLimit === undefined) {
    return items;
  }

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, Math.min(200, parseInt(rawLimit, 10) || 20));
  const start = (currentPage - 1) * size;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));

  return {
    data: items.slice(start, start + size),
    pagination: {
      page: currentPage,
      limit: size,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
}

module.exports = paginate;
