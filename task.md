# Task — Giao diện LCIT Meal Mobile

Ngày lập: 25/09/2026.

## 1. Mục tiêu và phạm vi

Xây dựng app Android và iOS bằng **React Native + Expo + TypeScript**, phục vụ quản lý suất ăn và sử dụng backend `lcit-meal-api` hiện có.

Tham chiếu nghiệp vụ: [SPEC.md](SPEC.md) và [architecture.md](architecture.md). Các checkbox bên dưới là công việc chưa hoàn thành; tài liệu này không xác nhận app đã được triển khai.

Thứ tự thực hiện: nền tảng → giao diện nhân viên bằng dữ liệu mẫu → kết nối API → giao diện quản lý/admin → kiểm tra trên Android và iOS. Bản giao diện đầu tiên gồm đăng nhập, trang chủ, lịch ăn, đăng ký/cắt suất, thanh toán cá nhân, thông báo và tài khoản.

## 2. Stack và tổ chức mã nguồn dự kiến

| Thành phần | Lựa chọn |
|---|---|
| Nền tảng | React Native + Expo |
| Ngôn ngữ | TypeScript, bật strict |
| Điều hướng | Expo Router, tab chính và stack chi tiết |
| Giao diện | Component React Native + StyleSheet + design tokens dùng chung |
| Dữ liệu API | Fetch, lớp service có kiểu dữ liệu; TanStack Query cho cache và tải lại |
| Phiên đăng nhập | Auth context; Expo SecureStore lưu token |
| Form | React Hook Form + Zod |
| Icon | Bộ icon tương thích Expo, thống nhất toàn app |
| Backend | Node.js/Express + MySQL/MariaDB hiện tại |

Thư mục ứng dụng dự kiến: `lcit-meal-mobile/`, nằm cạnh `lcit-meal-api/`.

```text
lcit-meal-mobile/
  app/                 # Route, layout, tab và màn hình chi tiết
  src/
    components/        # Button, input, card, badge, dialog, trạng thái trang
    features/          # auth, meals, registrations, payments, notifications...
    services/          # API client và adapter cho từng nhóm endpoint
    providers/         # Auth và query provider
    theme/             # Màu, font, spacing, radius
    types/             # DTO API và kiểu dữ liệu giao diện
    utils/             # Ngày giờ, tiền, validation
    mocks/             # Dữ liệu mẫu theo cùng interface với API
  assets/
```

## 3. Giai đoạn 1 — Nền tảng và thiết kế

- [x] T01. Khởi tạo Expo + TypeScript trong `lcit-meal-mobile`; chọn các phiên bản tương thích với Expo SDK tại thời điểm triển khai, lưu lockfile.
- [x] T02. Cấu hình Expo Router, TypeScript strict, lint, biến môi trường API URL và chế độ dữ liệu mẫu/API.
- [x] T03. Thiết lập navigation: Đăng nhập → các tab **Trang chủ / Lịch ăn / Thanh toán / Thông báo / Tài khoản**; nhóm Quản lý chỉ xuất hiện theo role.
- [x] T04. Thiết kế giao diện tiếng Việt: nền sáng, xanh lá làm màu chính, thẻ nội dung rõ ràng, trạng thái có cả nhãn và màu.
- [x] T05. Tạo design tokens và component chung: nút, ô nhập, ô mật khẩu, card suất ăn, badge, chọn ngày/khoảng ngày, bộ đếm khách, dialog xác nhận, thông báo kết quả.
- [x] T06. Tạo layout hỗ trợ safe area, bàn phím, cuộn, màn hình nhỏ và chữ lớn; vùng chạm tối thiểu 48 đơn vị logic.
- [x] T07. Tạo trạng thái loading, trống, lỗi có thử lại, mất kết nối, hết phiên và không có quyền.
- [x] T08. Tạo fixture cho employee, manager và admin; có ngày ăn bình thường, ngày nghỉ, suất pending/completed/cancelled, khoản chưa trả và thông báo chưa đọc.

Điều kiện hoàn thành: chạy được app trên môi trường phát triển, điều hướng tới các màn hình khung, bộ component thống nhất và không tràn nội dung ở màn hình nhỏ. (ĐÃ HOÀN THÀNH)

## 4. Giai đoạn 2 — Giao diện nhân viên

| Task | Màn hình | Công việc và kết quả cần đạt |
|---|---|---|
| T09 | Đăng nhập | Username/password, ẩn/hiện mật khẩu, kiểm tra trường bắt buộc, loading và lỗi đăng nhập |
| T10 | Trang chủ | Ngày hiện tại, suất của mình, số khách, giờ đóng nếu có cấu hình, thao tác nhanh và khoản thanh toán cá nhân; không hiển thị dữ liệu tài chính toàn cơ quan |
| T11 | Lịch ăn | Chọn tháng/ngày, danh sách ngày ăn/nghỉ, nhãn trạng thái suất của mình, tải lại |
| T12 | Chi tiết ngày ăn | Ngày, ghi chú, tình trạng bếp, suất cá nhân và hành động hợp lệ; ưu tiên hiển thị bếp nghỉ khi meal bị hủy |
| T13 | Đăng ký/đăng ký lại | Chọn số khách nguyên từ 0–10, tóm tắt trước khi gửi; trạng thái xác nhận ngay theo API, không tạo bước duyệt khách |
| T14 | Cắt suất trực tiếp | Xác nhận thao tác, lý do nếu hợp đồng hỗ trợ; hiển thị cancelled hoặc pending đúng response, không tự quyết định kết quả theo đồng hồ thiết bị |
| T15 | Cắt theo yêu cầu | Chọn loại và khoảng ngày, ghi chú, lịch sử yêu cầu; cả ba loại hiện tự approved, không mô tả là luôn chờ duyệt |
| T16 | Thanh toán cá nhân | Danh sách, bộ lọc phù hợp API, chi tiết số tiền/ngày/trạng thái, QR nếu đã cấu hình; không tự suy hóa đơn từ số suất |
| T17 | Thông báo | Inbox cá nhân, badge chưa đọc, chi tiết, đánh dấu từng mục/tất cả đã đọc |
| T18 | Tài khoản | Hồ sơ, vai trò, sửa thông tin/mật khẩu theo contract, đăng xuất |

- [x] Hoàn thành T09–T12 với dữ liệu mẫu.
- [x] Hoàn thành T13–T15 với dữ liệu mẫu và đủ trạng thái thành công/thất bại/chờ xử lý.
- [x] Hoàn thành T16–T18 với dữ liệu mẫu.
- [x] Kiểm tra một luồng demo liên tục: đăng nhập → xem lịch → đăng ký khách → cắt suất → xem thanh toán → đọc thông báo → đăng xuất.

Điều kiện hoàn thành: tất cả màn hình của bản đầu tiên có thể tương tác; thao tác mock cập nhật dữ liệu nhất quán giữa trang chủ, lịch và chi tiết; chế độ demo được nhận biết rõ. (ĐÃ HOÀN THÀNH)

## 5. Giai đoạn 3 — Kết nối backend

- [x] T19. Đối chiếu route/controller/response thực tế; định nghĩa DTO, mapping role, trạng thái và pagination trước khi nối từng màn hình.
- [x] T20. Tạo API client cho `/api`, Bearer token và envelope `{ success, payload, error }`; xử lý timeout, lỗi mạng và 400/401/403/404/409/500.
- [x] T21. Kết nối login/logout, lưu token an toàn, phục hồi trạng thái khởi động; 401 đưa về đăng nhập và xóa cache cá nhân. Backend chưa có refresh token hay `GET /auth/me`, không gọi các endpoint giả định này.
- [x] T22. Nối lịch ăn/lịch nghỉ, `/meal-registrations/me`, đăng ký lại, số khách, cắt trực tiếp và `/meal-options/me`; tải lại các query liên quan sau mutation thành công.
- [x] T23. Nối `/payments/me`, QR cấu hình, `/notifications/me`, unseen-count, seen/seen-all và `PATCH /users/me`.
- [x] T24. Chuẩn hóa ngày nghiệp vụ `YYYY-MM-DD`, hiển thị `dd/MM/yyyy`, múi giờ nghiệp vụ Việt Nam và tiền VND; không dùng chuyển UTC làm lệch ngày ăn.
- [x] T25. Khóa nút khi đang gửi, không tự retry mutation có tác dụng phụ; khi kết quả chưa rõ do mất mạng, tải lại trạng thái trước khi cho gửi lại.
- [x] T26. Cấu hình API URL cho emulator và thiết bị thật; kiểm tra kết nối Android/iOS và không đưa secret backend vào biến môi trường public của app.

Điều kiện hoàn thành: luồng nhân viên hoạt động với tài khoản/dữ liệu thử, trạng thái bám response server, lỗi có hướng xử lý, đăng xuất không để lộ cache người trước. (ĐÃ HOÀN THÀNH)

## 6. Giai đoạn 4 — Quản lý và admin

- [ ] T27. Tạo trang Quản lý và guard route theo quyền; kiểm tra cả truy cập bằng deep link. Ẩn nút không thay thế phân quyền backend.
- [ ] T28. Dashboard quản lý: tổng suất và khách theo ngày, chart/bộ lọc kỳ theo dữ liệu API, hàng chờ duyệt cắt.
- [ ] T29. Quản lý lịch bếp: danh sách, tạo/sửa, chi tiết tổng suất, hủy/mở bếp và lịch nghỉ; dialog trình bày tác động trước khi gửi.
- [ ] T30. Danh sách đăng ký/cắt: tìm/lọc/phân trang, thao tác hộ đúng quyền; duyệt/từ chối registration pending bằng endpoint tương ứng, tách khỏi meal-option pending cũ.
- [ ] T31. Quản lý thanh toán: danh sách/lọc, tạo/sửa khoản thủ công, đánh dấu đã thanh toán; chỉ làm chứng từ ảnh theo cơ chế API thực tế, không giả định có endpoint upload bill.
- [ ] T32. Danh sách người dùng cho manager/admin; tạo/sửa/trạng thái/role chỉ cho admin. Hoàn thiện validation và phản hồi lỗi trùng username.
- [ ] T33. Soạn/gửi thông báo theo người nhận hoặc broadcast đúng contract; xem lại nội dung và đối tượng trước khi gửi.
- [ ] T34. Cấu hình admin: lịch thứ, giờ và các key được hỗ trợ, upload QR; phân biệt cập nhật từng mục và lỗi cập nhật một phần.
- [ ] T35. Audit admin: danh sách, bộ lọc, chi tiết actor/action/target/result; chỉ đọc.
- [ ] T36. Hoàn thiện xuất báo cáo đăng ký/thanh toán trên mobile: tải file có xác thực, thông báo lỗi và mở/chia sẻ file.

Điều kiện hoàn thành: kiểm tra ma trận employee/manager/admin; mỗi nhóm chỉ thấy và gọi được chức năng được cấp quyền; thao tác thành công cập nhật các màn hình liên quan.

## 7. Phụ thuộc backend và giới hạn cần xử lý

Các mục sau không chặn thiết kế bằng fixture, nhưng phải được giải quyết hoặc loại khỏi bản tích hợp/phát hành liên quan:

- [ ] B01. GAP-01: sửa scope dashboard và ownership trước khi phát hành chức năng liên quan. Trang chủ nhân viên dùng API cá nhân, không tải dashboard toàn cơ quan rồi chỉ che dữ liệu trên UI.
- [ ] B02. GAP-02/03/04: xác nhận hành vi completed, hủy bếp và khôi phục lịch nghỉ. Chặn phát hành luồng khôi phục gây phục hồi nhầm suất cá nhân cho đến khi backend được sửa và kiểm thử.
- [ ] B03. GAP-07: chưa đưa nút reactivate meal-option vào bản tích hợp khi service còn thiếu.
- [ ] B04. GAP-08: chưa gọi loại `cancel_permanent` là “cắt vĩnh viễn” vì API vẫn yêu cầu ngày kết thúc; dùng mô tả đúng khoảng hiệu lực và chốt ngữ nghĩa trước khi mở chức năng này.
- [ ] B05. Role kitchen hiện không được nhiều route nghiệp vụ cho phép: hiển thị trạng thái chưa được cấp chức năng phù hợp; chưa xây dashboard bếp thật bằng API vượt quyền.
- [ ] B06. GAP-06: chưa đưa hard-delete user và các thao tác mất lịch sử vào bản đầu tiên khi backend chưa có bảo vệ tương ứng.

Chưa thuộc bản đầu tiên: tự đăng ký tài khoản, quên mật khẩu qua email/SMS, push notification, thu tiền ngân hàng tự động, ledger/tính phí tự động, import Excel, chạy job quản trị từ mobile và ghi dữ liệu khi offline. Đây là phần mở rộng, không phải chức năng đã có.

## 8. Giai đoạn 5 — Kiểm tra và bàn giao

- [ ] T37. Chạy typecheck và lint; kiểm thử có trọng tâm cho ngày biên múi giờ, số khách, xử lý 401 và phân quyền điều hướng.
- [ ] T38. Kiểm tra nghiệp vụ: đăng ký lại cancelled, lỗi 409 khi đăng ký lặp, cắt trước/sau giờ đóng, pending sau cắt trực tiếp, bếp nghỉ và suất completed.
- [ ] T39. Kiểm tra đăng xuất/đăng nhập tài khoản khác, token hết hạn, 403, lỗi server, mất mạng khi gửi và API trả danh sách trống.
- [ ] T40. Kiểm tra giao diện Android và iOS: safe area, bàn phím, nút Back, chữ lớn, tương phản, nhãn accessibility, cuộn dài và tab badge.
- [ ] T41. Kiểm tra trên thiết bị/emulator Android và simulator/thiết bị iOS; ghi rõ môi trường và kết quả thực tế. Nếu chưa có môi trường iOS, giữ hạng mục này chưa hoàn thành.
- [ ] T42. Tạo bản build thử Android/iOS theo môi trường và tài khoản sẵn có; chưa phát hành lên store trong phạm vi công việc này.
- [ ] T43. Viết README cho app: cài đặt/chạy, biến môi trường mẫu, dữ liệu demo, kết nối backend, tài khoản thử không chứa thông tin thật và cách build.

## 9. Tiêu chí hoàn thành chung

- Các màn hình trong phạm vi đã triển khai và điều hướng đầy đủ trên Android/iOS.
- Có loading/empty/error/success và trạng thái không có quyền cho từng luồng liên quan.
- Giao diện tiếng Việt nhất quán; ngày, giờ, tiền và trạng thái hiển thị đúng nghiệp vụ.
- Các luồng đã kết nối API không sử dụng dữ liệu giả để báo thành công.
- Không tự tạo hành vi ngoài contract backend hoặc che giấu lỗi phân quyền bằng UI.
- Typecheck/lint và các kiểm tra cần thiết đạt; có ghi nhận thiết bị/nền tảng đã kiểm tra và phần còn bị chặn.
- Chỉ đánh dấu checkbox khi có kết quả thực tế; ghi lý do và phụ thuộc cho công việc bị chặn.
