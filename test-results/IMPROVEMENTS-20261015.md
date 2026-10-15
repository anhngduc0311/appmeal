# Cải thiện và kiểm chứng — 15/10/2026

## Đã thực hiện

- Bỏ import không dùng và bổ sung dependency router vào effect điều hướng.
- Sửa README về Expo SDK 51, React Native 0.74.5, Router 3.5, TypeScript 5.3, biến API URL, màn hình tài khoản, quyền bếp và file SQL có sẵn.
- Thay verify-phase5.js bằng entry point chạy test source thực tế. Không còn logic nghiệp vụ sao chép trong script test.
- Thêm npm test: 20 test utility, chuẩn hóa role, API client, auth service và mock store. Chỉ thay thế native storage bằng bộ nhớ; HTTP được stub ở test unit.
- Thêm npm run test:integration: tự mở API QA với schema MySQL dùng riêng, chạy regression backend, rồi gọi service mobile thật cho luồng đăng nhập, giới hạn khách, trùng đăng ký, cắt/đăng ký lại, duyệt, phân quyền, logout/401; tự dọn schema.
- Sửa timeout API client để bao phủ cả đọc body; phản hồi 200 không phải JSON/envelope hợp lệ trả ApiError 502 thay vì âm thầm trả null. HTTP 204 vẫn được chấp nhận. Có test regression cho từng trường hợp.
- Thêm checklist kiểm tra giao diện và Android tại lcit-meal-mobile/scripts/tests/UI-CHECKLIST.md.

## Kiểm chứng

- Lint: 0 lỗi, 0 cảnh báo.
- TypeScript: PASS.
- Build web: PASS, 27 route static; Android TLS static configuration: PASS.
- Unit/service source tests: 20/20 PASS.
- Backend regression: 93/93 PASS qua runner integration.
- Mobile services integration: PASS với API và MySQL thật, schema QA dùng riêng.
- Browser với API QA: mật khẩu sai có banner; đăng nhập nhân viên; cắt suất tương lai; đăng ký lại; tạo yêu cầu cắt theo khoảng; đăng xuất/đổi tài khoản; quản lý duyệt, banner thành công và số chờ duyệt giảm về 0.
- Thu hồi phiên quản lý từ API QA rồi reload: chuyển về login.
- Dừng API QA rồi đăng nhập: hiển thị lỗi kết nối, nút đăng nhập hoạt động lại.

Ảnh chứng minh duyệt thành công: web-approval-20261015.png.

## Giới hạn

Chưa có Android Emulator, AVD hoặc thiết bị kết nối nên chưa kiểm tra runtime Android/iOS. UI được kiểm tra qua browser và có checklist lặp lại; chưa thêm framework E2E/component test tự động. Lỗi 500/timeout được tự động kiểm tra ở API client, không fault-inject vào UI. Production không được kiểm tra hoặc thay đổi. Cảnh báo runtime deprecated shadow/pointerEvents của React Native Web còn tồn tại.
