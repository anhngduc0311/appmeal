# Báo cáo kiểm thử LCIT Meal — 25/09/2026

> Đây là báo cáo lỗi **trước khi sửa**. Kết quả sau sửa: **87/87 ca API đạt**, xem [FIX-VERIFICATION.md](./FIX-VERIFICATION.md). File JSON hiện tại đã được cập nhật bằng lần chạy hồi quy.

## Kết quả

- Lint: PASS (`npm run lint`). TypeScript: PASS (`npm run typecheck`).
- API thật + MySQL: **67/79 ca PASS, 12 ca FAIL**. Chi tiết từng ca trong [api-workflows.json](./api-workflows.json), log trong [api-workflows.log](./api-workflows.log).
- UI web: chạy Expo ở cổng 8081 để kiểm tra cấu hình mặc định, sau đó 5173 để kiểm tra các luồng với origin được backend cho phép. Không thay đổi CORS trong source.
- Dữ liệu: tạo schema MySQL riêng, sao chép cấu trúc và cấu hình; tạo tài khoản QA riêng. Không sao chép hoặc sửa người dùng, suất ăn, thanh toán của database gốc. Cron không khởi chạy trong server kiểm thử. Schema QA và các server tạm đã dọn sau kiểm thử.
- Chỉ bổ sung script kiểm thử và báo cáo, chưa sửa logic ứng dụng.

## Luồng đã kiểm tra

| Nhóm | Đã kiểm tra | Kết quả |
| --- | --- | --- |
| Xác thực | Login admin, manager, 2 employee, kitchen; thiếu thông tin; sai mật khẩu; API không token; logout thu hồi token | API đạt; UI sai mật khẩu có lỗi riêng bên dưới |
| Phân quyền | Dashboard, lịch, đăng ký cá nhân, thanh toán cá nhân, thông báo, cấu hình, người dùng, audit theo 4 vai trò; đọc/thao tác dữ liệu người khác | Ma trận route cơ bản đạt; quyền sở hữu bản ghi còn lỗi |
| Lịch và đăng ký | Tạo ngày bếp; chống trùng; đăng ký với khách; cập nhật khách; cắt; đăng ký lại; cắt theo khoảng; ngày quá khứ; giờ chốt | Luồng chính đạt; số khách thập phân và giờ chốt thất bại |
| Nghỉ lễ | Tạo sự kiện, hủy đăng ký, mở lại sự kiện, kiểm tra đăng ký sau lỗi | Mở lại thất bại và dữ liệu bị thay đổi một phần |
| Thanh toán | Tạo hóa đơn; xem cá nhân; quản lý xác nhận; chống xác nhận trùng; chặn employee xác nhận; số tiền âm; ngày nghiệp vụ | Luồng chính đạt; số tiền âm và ngày nghiệp vụ thất bại |
| Thông báo | Thông báo phát sinh từ nghiệp vụ; danh sách cá nhân; đánh dấu tất cả đã đọc; tổng chưa đọc | Đạt |
| Người dùng | Admin tạo employee; chống trùng username; chặn manager sửa user; cập nhật hồ sơ cá nhân | Đạt |
| Xuất dữ liệu | Export đăng ký và thanh toán | HTTP 200, dữ liệu có chữ ký ZIP/XLSX; chưa đối chiếu từng ô Excel |

## Lỗi tái hiện qua API

| ID | Mức độ | Cách tái hiện / thực tế | Mong đợi / vị trí liên quan |
| --- | --- | --- | --- |
| API-01 | P1 | Employee POST `/meal-registrations` với `userId` của manager: **201**, đăng ký hộ thành công | Phải 403 với người không có quyền quản lý. `MealRegistrationService.js:203` tin trực tiếp `data.userId` |
| API-02 | P1 | Employee POST `/meal-options` với `userId` của người khác: **201**, yêu cầu tự duyệt và cắt suất người đó | Kiểm tra quyền trước khi chọn người bị cắt suất. `MealOptionService.js:139` |
| API-03 | P1 | Employee khác GET `/meal-registrations/:id`: **200** với dữ liệu không thuộc mình | Kiểm tra chủ sở hữu/manager. `MealRegistrationController.js:79`, `MealRegistrationService.js:141` |
| API-04 | P1 | Employee khác GET `/meal-options/:id`: **200** với yêu cầu không thuộc mình | Kiểm tra chủ sở hữu/manager. `MealOptionController.js`, `MealOptionService.js:115` |
| API-05 | P1 | PATCH `/holiday-events/:id/restore`: **500**, `chk_holiday_event_status` bị vi phạm | Code ghi `restored`, schema chỉ nhận `active`/`inactive`. `constants/HolidayEvent.js`, `sql/qlsa.sql:629` |
| API-06 | P1 | Sau lỗi API-05, đăng ký tự cắt trước đó đã đổi từ `cancelled` sang **confirmed** | Thao tác thất bại không được để dữ liệu cập nhật dở; không khôi phục nhầm suất tự cắt. `HolidayEventService.js:180` khôi phục trước khi đổi trạng thái sự kiện, không có transaction |
| API-07 | P1 | PUT `/payments/:id` với `amount:-100`: **200** và lưu số âm | Từ chối 400 trước khi ghi dữ liệu. `PaymentService.js:81` |
| API-08 | P1 | PATCH `/payments/:id/mark-paid` với `paidAmount:-100`: **200** | Kiểm tra số tiền thực trả hợp lệ. `PaymentService.js:110` |
| API-09 | P1 | Đặt giờ chốt `00:00` trong schema QA rồi đăng ký ngày hiện tại: vẫn **201** | Đăng ký sau giờ chốt phải bị từ chối. `MealRegistrationService.create()` không gọi hàm kiểm tra cutoff đã có |
| API-10 | P2 | POST đăng ký `guestCount:1.5`: **201** | Chỉ chấp nhận số nguyên trong khoảng hợp lệ. `MealRegistrationService.js:297` |
| API-11 | P2 | Tạo hóa đơn ngày `2026-10-02`; chuỗi ngày trong API bắt đầu bằng **2026-10-01**, UI hiện **01/10/2026** | Giữ đúng ngày nghiệp vụ. MySQL DATE được map trực tiếp trong `models/Payment.js:6`, chuyển thành timestamp UTC khi serialize; formatter lấy phần ngày đầu chuỗi |
| API-12 | P1 (web) | Preflight với `Origin:http://localhost:8081` không có `Access-Control-Allow-Origin` phù hợp; login web không nhận được dữ liệu phiên | Cấu hình origin cho Expo web theo môi trường. `src/app.js:10` chỉ cho `http://localhost:5173` |

## Quan sát giao diện

- **PASS:** login user1/admin/kitchen trên cổng 5173; employee mở `/management` bị chặn bằng thông báo không có quyền.
- **PASS:** admin vào quản lý lịch, tạo ngày `2026-10-03` ghi chú `QA UI workflow`; employee thấy lịch mới, đăng ký thành công, thêm 2 khách thành công, xác nhận cắt chuyển sang `cancelled` và có nút đăng ký lại.
- **PASS:** danh sách hóa đơn và thông báo tải được; logout quay về login; truy cập root sau logout trên cổng 5173 quay lại login sau xử lý 401.
- **UI-01 / P2:** đăng nhập sai mật khẩu trên cổng 5173 làm form trở về mặc định `nv_an`/mật khẩu demo, không hiện lỗi sai mật khẩu. API trực tiếp trả 401 đúng. `AuthProvider.login()` bật `isLoading` toàn ứng dụng; `RootNavigation` thay cả Stack bằng LoadingState làm màn login bị unmount, mất state lỗi/nhập liệu.
- **UI-02 / P2:** kitchen vẫn thấy tab lịch, thanh toán, thông báo và hành động cắt suất như employee, trong khi backend trả 403 các API này. Khi mở lịch bếp bằng kitchen, màn hình đã hiện trạng thái không có ngày phù hợp. Cần thống nhất quyền UI/API và hiển thị lỗi quyền phù hợp.
- **UI-03 / P3:** trạng thái `confirmed`, `cancelled`, `paid` hiện nguyên mã tiếng Anh trên giao diện tiếng Việt.
- Giao diện hiển thị số tiền âm và ngày sai từ API (API-07/API-11), xác nhận các lỗi này ảnh hưởng dữ liệu người dùng nhìn thấy.

## Chạy lại

Từ thư mục `lcit-meal-api`, có `.env` kết nối MySQL local và tài khoản DB có quyền tạo/xóa schema kiểm thử:

```powershell
node scripts/test-workflows.cjs
```

Script tạo schema có tên riêng `qa_meal_<timestamp>_<pid>`, chạy Express thật trên cổng tạm, tắt cron bằng cách không dùng `server.js`, và dọn schema khi chạy xong. Exit code 1 khi có ca thất bại. File JSON và log hiện tại phản ánh lần chạy cuối, không tính kịch bản mô phỏng `verify-phase5.js` vào 79 ca API.

## Giới hạn

Chưa chạy trên Android/iOS thật hoặc emulator; chưa kiểm thử tải, offline/khôi phục mạng trên thiết bị, upload/chia sẻ QR native, đổi mật khẩu, import người dùng hàng loạt, toàn bộ nhánh cron tự động và nội dung chi tiết file Excel. Các trang quản trị khác chưa được kiểm tra toàn bộ thao tác UI. Không thể kết luận toàn bộ app đã đạt chỉ từ những luồng đã chạy.

`verify-phase5.js` chạy PASS nhưng phần lớn kiểm tra các hàm/ma trận tự định nghĩa trong script, không import implementation thật. `test-full-api-flow.js` cũ bỏ qua một số lỗi đăng ký và không xử lý đúng mọi response phân trang; không dùng thông báo “100% SUCCESS” của script đó làm bằng chứng chất lượng.
