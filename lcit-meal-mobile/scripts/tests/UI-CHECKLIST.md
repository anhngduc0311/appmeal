# Kiểm tra giao diện với dữ liệu QA riêng

## Chuẩn bị

1. Đảm bảo MySQL local chạy và `lcit-meal-api/.env` trỏ đến database nguồn local đã import schema. Database cần quyền tạo/xóa schema test.
2. Từ mobile chạy `node scripts/tests/mobile-api.cjs --serve`. Chỉ tiếp tục sau `MOBILE QA READY`. Runner tạo schema dùng riêng, chạy regression backend và mobile services, không chạy cronjob.
3. Ở terminal PowerShell thứ hai, từ mobile chạy:

```powershell
$env:EXPO_PUBLIC_API_URL='http://localhost:3000/api'
$env:EXPO_PUBLIC_USE_MOCK='false'
npm run web -- --host localhost
```

4. Mở `http://localhost:5173` trong profile/tab test sạch. Dùng tài khoản QA `user1`, `manager`, `admin`, `kitchen`, mật khẩu `123456`. Không dùng tài khoản production.

## Ca kiểm tra và kết quả cần thấy

| Ca | Thao tác | Kết quả |
| --- | --- | --- |
| Sai mật khẩu | user1 với mật khẩu sai | Hiển thị lỗi, ở lại trang đăng nhập, nút đăng nhập hoạt động lại |
| Đăng nhập | user1 / 123456 | Trang chủ hiển thị dữ liệu nhân viên |
| Cắt và đăng ký lại | Trong lịch ăn, chọn ngày tương lai đang đăng ký, xác nhận cắt rồi đăng ký lại | Thẻ và bộ đếm đổi trạng thái tương ứng, không tạo bản ghi trùng |
| Cắt theo khoảng | Chọn một ngày tương lai đang đăng ký qua Cắt suất nhiều ngày | Banner chờ quản lý duyệt; suất vẫn đăng ký trước khi duyệt |
| Duyệt | Đăng xuất, đăng nhập manager, mở Quản lý → Đăng ký & Duyệt cắt → Yêu cầu cắt | Có yêu cầu vừa tạo; duyệt thành công, số chờ duyệt giảm |
| Kiểm tra sau duyệt | Đăng nhập lại user1 | Ngày được duyệt hiển thị đã cắt; lịch sử yêu cầu đã duyệt |
| Đổi tài khoản | Đăng xuất user1 rồi đăng nhập manager | Dữ liệu/công nợ/thông báo của user1 không còn hiển thị |
| Hết phiên | Thu hồi token của tài khoản trong schema QA từ backend, rồi mở màn hình cần dữ liệu/reload | Trở về login, session và cache cá nhân được xóa |
| API không kết nối | Dừng API QA, reload hoặc đăng nhập | Thông báo kết nối thất bại, không crash, không kẹt nút loading |
| Server lỗi/timeout | Chạy `npm test` | API client báo mã 500/502/408, phân biệt lỗi server và lỗi kết nối |

Ca lỗi 500/timeout được tự động test ở lớp API client; checklist này không thay thế test component hay E2E tự động. Kiểm tra console và lưu ảnh các kết quả chính. Nhập `stop` ở terminal QA để xóa schema và dừng API; dừng Expo bằng Ctrl+C.

## Android trước phát hành

Chưa thực hiện nếu không có thiết bị/emulator. Dùng development/preview build phù hợp SDK 51 và plugin TLS của project.

- Đăng nhập qua HTTPS, sai mật khẩu và mạng không ổn định.
- Đóng/mở lại app: khôi phục phiên; sau logout không khôi phục dữ liệu cũ.
- Bàn phím: cả hai input và nút đăng nhập đều truy cập được trên màn hình nhỏ.
- Đăng ký, cắt, gửi yêu cầu, duyệt qua hai tài khoản; kiểm tra trạng thái sau reload.
- Xuất/chia sẻ Excel, hiển thị QR, chọn ảnh và các quyền liên quan.
- Kiểm tra thiết bị ở UTC+7 và múi giờ khác: ngày ăn không lệch.

Test static TLS bằng `node scripts/test-android-tls.cjs` chỉ kiểm tra file native và chứng chỉ; không chứng minh app chạy thành công trên thiết bị.
