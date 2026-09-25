# Xác nhận sửa lỗi — 25/09/2026

## Kết quả

- Bộ API thực tế + MySQL: **87/87 PASS** (79 ca ban đầu + 8 ca hồi quy bổ sung).
- `npm run lint`: PASS. `npm run typecheck`: PASS.
- UI kiểm tra trên `http://localhost:8081`, kết nối API thật với database QA riêng.
- Đã chạy `npm run migrate` cho database local: chỉ thêm hai bảng lưu vết lịch nghỉ, không sửa/xóa dữ liệu nghiệp vụ hiện có.

## Những lỗi đã sửa

| Nhóm | Thay đổi | Kiểm chứng |
| --- | --- | --- |
| Quyền sở hữu | Employee chỉ tạo/xem đăng ký và yêu cầu cắt của mình; admin/manager giữ quyền thao tác hộ | Các ca đọc và ghi chéo người dùng trả 403 |
| Giờ chốt | Áp dụng giờ Việt Nam, kiểm tra cutoff cho tạo đăng ký và sửa khách | Tạo và PUT sau giờ chốt đều trả 400 |
| Số khách | Chỉ nhận kiểu number nguyên trong giới hạn | 1.5, số âm, vượt giới hạn bị từ chối |
| Thanh toán | Kiểm tra số hữu hạn, không âm khi tạo/sửa và xác nhận thu | Số âm, null, chuỗi rỗng, chuỗi không phải số, boolean bị từ chối |
| Ngày nghiệp vụ | MySQL DATE trả chuỗi ngày, không serialize thành timestamp UTC | Hóa đơn 2026-10-02 giữ nguyên ngày API và UI hiện 02/10/2026 |
| Nghỉ lễ | Dùng trạng thái inactive đúng schema; transaction và lưu dấu vết theo sự kiện | Mở lại thành công; giữ suất tự cắt; chồng 2 lịch nghỉ; lỗi DB giả lập hoàn tác cả trạng thái sự kiện, bếp và đăng ký |
| CORS | Danh sách origin cấu hình qua CORS_ORIGINS, gồm Expo 8081 mặc định | Login UI cổng 8081 thành công; origin lạ không được cấp header CORS |
| Đăng nhập UI | Không tháo màn hình login khi đang gửi request | Sai mật khẩu hiện lỗi, giữ user1 và dữ liệu đã nhập; sửa mật khẩu đăng nhập tiếp thành công |
| Vai trò bếp | Trang chủ số suất cần nấu, chỉ có tab Trang chủ/Tài khoản; bảo vệ route trực tiếp | UI hiện 1 suất / 1 cán bộ / 0 khách; truy cập /schedule chuyển về trang chủ |
| Nhãn trạng thái | Dùng nhãn tiếng Việt từ cấu hình Badge | UI hiện Nhân viên, Nhân viên bếp, Đã đăng ký, Đã thanh toán |

## Triển khai và chạy lại

Trong `lcit-meal-api`:

```powershell
npm run migrate
npm test
```

Migration có thể chạy lại. Bản schema `sql/qlsa.sql` cho cài mới cũng có hai bảng mới.
`npm test` tạo database QA riêng, chạy Express thật, không bật cron, dọn database khi kết thúc, trả exit code 1 nếu có lỗi.

Lịch nghỉ tạo trước migration không có dấu vết hủy theo sự kiện: không thể suy ra chắc chắn suất nào tự cắt. Những bản ghi cũ này cần quản lý kiểm tra và mở lại bằng thao tác riêng; không tự khôi phục hàng loạt.

Chưa kiểm tra Android/iOS thật. Báo cáo REPORT.md lưu kết quả trước khi sửa; JSON hiện tại lưu kết quả hồi quy sau sửa.
