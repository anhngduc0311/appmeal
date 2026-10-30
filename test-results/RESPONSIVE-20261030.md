# Kiểm tra responsive — 30/10/2026

## Thay đổi

- Khoảng đệm màn hình theo chiều rộng khả dụng, có tính safe area.
- Bố cục gọn theo chiều rộng và cỡ chữ hệ thống; menu quản lý chuyển một cột khi thiếu chỗ.
- Tiêu đề, bộ lọc, nhóm nút và thống kê có thể xuống dòng.
- Nút dùng chiều cao tối thiểu, chữ dài có thể xuống dòng; ô nhập không ép chiều cao cố định.
- Nhãn tab có thể xuống dòng, chiều cao tab tăng theo cỡ chữ; ẩn tab khi mở bàn phím.
- Hộp thoại có safe area và hỗ trợ tránh bàn phím; hộp thoại dài có thể cuộn.
- Giữ nghiệp vụ và API hiện tại.

## Kết quả

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript `npm run typecheck` | Đạt |
| ESLint `npm run lint` | Đạt |
| Bộ kiểm thử `npm test` | 27/27 đạt |
| Expo export cho web | Thành công, 27 route |
| Dev web: 18 màn hình/vai trò × 5 kích thước | 90/90 không phát hiện tràn ngang hoặc lỗi JavaScript |
| Production web: 18 màn hình/vai trò × 3 kích thước | 54/54 không phát hiện tràn ngang hoặc lỗi JavaScript |
| ConfirmDialog và DatePicker | Kiểm tra ở 320×568 và 320×320; cuộn được tới nút thao tác |
| QR thanh toán | 320×568; cuộn được tới nút Đã chuyển |
| Biểu mẫu tạo người dùng | 320×320; cuộn được tới nút Tạo tài khoản |

Chiều rộng dev đã kiểm tra: 320, 360, 390, 430 và 844 px. Với chiều rộng 844 px, dùng chiều cao 390 px để kiểm tra nằm ngang.

Dữ liệu kiểm tra là mock. Bộ kiểm tra bỏ qua nội dung nằm trong vùng cuộn ngang có chủ đích. Các phép đo trên trình duyệt không thay thế kiểm tra trên thiết bị Android/iOS thật; bàn phím native, tai thỏ và cỡ chữ hệ thống lớn chưa được kiểm chứng trên thiết bị thật.

## Bằng chứng

- [Kết quả production](responsive-production-report.json)
- [Kết quả hộp thoại](responsive-dialog-report.json)
- [Kết quả dev](responsive-report.json)
- [Trang chủ ở 320 px](responsive-employee-320.png)
- [Xác nhận ở màn hình thấp](responsive-confirm-320x320.png)
- [Chọn ngày ở màn hình thấp](responsive-date-320x320.png)
- [QR ở 320 px](responsive-qr-320.png)
- [Biểu mẫu quản lý ở màn hình thấp](responsive-admin-form-320x320.png)
