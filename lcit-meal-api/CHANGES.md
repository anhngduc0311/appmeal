# Nhật ký thay đổi - Sửa logic cắt suất ăn

## API (Backend)

### 1. **MealRepository.js** - Thêm method mới
- `getWithCompletionStatus(id)`: Lấy meal kèm trạng thái hoàn thành (completion_status) để kiểm tra thời gian

### 2. **MealRegistrationService.js** - Logic mới cho cắt suất

#### Imports thêm
```javascript
const MEAL_COMPLETION_STATUS = require("../constants/MealCompletionStatus");
```

#### Method mới
- `checkCancellationPermission(registration, meal, actor)`: Kiểm tra xem người dùng có được phép cắt suất không
  - Trả về object: `{ canCancel, requiresApproval, reason }`
  - Logic:
    - Nếu registration.status = "completed" → không cắt được
    - Nếu meal.completionStatus = "completed" (quá giờ hoàn thành) → không cắt được
    - Nếu meal.mealDate < hôm nay → không cắt được
    - Nếu meal.mealDate = hôm nay và quá giờ đóng đăng ký:
      - Nhân viên thường → cần duyệt (requiresApproval = true)
      - Admin/manager → có thể cắt ngay
    - Ngược lại → có thể cắt bình thường

#### Method sửa
- `cancel(id, actor)`: Logic mới
  - Kiểm tra điều kiện cắt bằng `checkCancellationPermission()`
  - Nếu `requiresApproval = true`:
    - Tạo request pending (không cắt ngay)
    - Thông báo cho admin/manager review
  - Nếu `requiresApproval = false`:
    - Cắt suất ngay (chuyển sang CANCELLED)

#### Method mới cho duyệt yêu cầu cắt
- `approveCancel(id, actor)`: Duyệt yêu cầu cắt (PENDING → CANCELLED)
- `rejectCancel(id, actor)`: Từ chối yêu cầu cắt (PENDING → CONFIRMED)

#### Method sửa
- `confirm(id, actor)`: Cập nhật logic để xử lý cả yêu cầu đăng ký và yêu cầu cắt

### 3. **MealRegistrationController.js** - Thêm handlers mới
- `approveCancel`: Handler cho endpoint approve-cancel
- `rejectCancel`: Handler cho endpoint reject-cancel

### 4. **MealRegistrationRoutes.js** - Thêm routes mới
```javascript
// PATCH /api/meal-registrations/:id/approve-cancel - Duyệt yêu cầu cắt
router.patch("/:id/approve-cancel", authorize(ROLE.ADMIN, ROLE.MANAGER), ...);

// PATCH /api/meal-registrations/:id/reject-cancel - Từ chối yêu cầu cắt
router.patch("/:id/reject-cancel", authorize(ROLE.ADMIN, ROLE.MANAGER), ...);
```

## Frontend (React/TypeScript)

### 1. **MealRegistration.tsx** - Cập nhật logic hiển thị
- Sửa `buildDayStatus()`:
  - Kiểm tra `meal.completionStatus` từ backend
  - Nếu meal.completionStatus = "completed" → hiển thị status "completed" dù registration.status là gì

### 2. **MealService.ts** - Thêm methods mới
```typescript
// Duyệt yêu cầu cắt suất (PENDING → CANCELLED)
async approveCancelRequest(id: number | string): Promise<MealRegistration>

// Từ chối yêu cầu cắt suất (PENDING → CONFIRMED)
async rejectCancelRequest(id: number | string): Promise<MealRegistration>

// Xuất danh sách đăng ký ra Excel
async exportRegistrations(params: MealRegistrationFilterParams): Promise<void>
```

### 3. **MealStatisticsReports.tsx** - Báo cáo thống kê suất ăn mới
- Thay thế QR đăng ký
- Hiển thị:
  - Thống kê chính: tổng bếp, đăng ký, cắt suất, khách
  - Tỷ lệ: tỷ lệ đăng ký, tỷ lệ cắt suất, trung bình khách/suất
  - Bảng chi tiết theo ngày
  - Lọc theo tháng/quý/năm
  - Xuất Excel

### 4. **MealScheduleAdmin.tsx** - Quản lý lịch ăn cho admin
- Logic mới:
  - **Ngày trước hôm nay**: Chỉ xem danh sách (view_only)
  - **Hôm nay**: Có thể duyệt/từ chối yêu cầu cắt (can_manage)
  - **Ngày sau**: Có thể quản lý đăng ký cho nhân viên (can_edit)
- UI:
  - Sidebar: Danh sách bếp theo tháng với thống kê nhanh
  - Main: Chi tiết bếp được chọn, danh sách đăng ký
  - Cho phép duyệt/từ chối yêu cầu cắt khi là hôm nay
  - Hiển thị trạng thái pending riêng

### 5. **ApiClient.ts** - Thêm method helper
- `getBaseUrl()`: Trả về base URL của API

## Luồng mới cho cắt suất

### Người dùng thường:
1. **Trước giờ đóng đăng ký (ngày hiện tại)**: 
   - Cắt suất ngay → trạng thái CANCELLED

2. **Sau giờ đóng đăng ký (ngày hiện tại)**:
   - Gửi yêu cầu cắt → trạng thái PENDING
   - Chờ admin/manager duyệt

3. **Sau giờ hoàn thành bữa ăn**:
   - Không thể cắt
   - Thông báo lỗi: "Suất ăn đã hoàn thành, không thể cắt"

4. **Ngày trong quá khứ**:
   - Không thể cắt
   - Thông báo lỗi: "Không thể cắt suất ăn của ngày đã qua"

### Admin/Manager:
- **Ngày trước**: Chỉ xem
- **Hôm nay**: 
  - Xem danh sách
  - Duyệt yêu cầu cắt: PENDING → CANCELLED
  - Từ chối yêu cầu cắt: PENDING → CONFIRMED
  - Cắt trực tiếp cho nhân viên (nếu chưa quá giờ hoàn thành)
- **Ngày sau**: Quản lý đăng ký

## Trạng thái đăng ký (meal_registration.status)
- `pending`: Chờ duyệt (yêu cầu cắt hoặc đăng ký cũ)
- `confirmed`: Đã xác nhận, chưa hoàn thành
- `completed`: Đã hoàn thành (job tự động cập nhật)
- `cancelled`: Đã hủy

## Trạng thái hoàn thành (meal.completionStatus - không lưu DB)
- `completed`: Ngày đã qua hoặc quá giờ hoàn thành
- `serving`: Hôm nay và chưa qua giờ hoàn thành
- `pending`: Ngày trong tương lai

## Lưu ý
- Giờ đóng đăng ký được cấu hình trong system_setting (`registration_close_time`, mặc định chưa cấu hình)
- Giờ hoàn thành bữa ăn được cấu hình trong system_setting (`meal_completion_time`, mặc định "12:00")
- Backend tự động tính `completionStatus` mỗi lần trả về meal từ API
