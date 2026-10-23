# LCIT Meal Mobile — Ứng dụng Đăng ký & Quản lý Suất ăn Cán bộ

Ứng dụng di động quản lý suất ăn cán bộ công nhân viên (Android, iOS và Web), được xây dựng trên nền tảng **React Native**, **Expo SDK 51** và **Expo Router**. Ứng dụng tuân thủ chuẩn thẩm mỹ cao cấp, giao diện tiếng Việt nhất quán, hệ thống phân quyền Role-Based chặt chẽ và tích hợp linh hoạt giữa chế độ **Offline Mock Demo** và **Backend API Thực tế**.

---

## 🚀 1. Công nghệ & Kiến trúc

- **Framework**: [Expo SDK 51](https://expo.dev) & [React Native 0.74.5](https://reactnative.dev)
- **Routing**: [Expo Router v3.5](https://docs.expo.dev/router/introduction) (File-based navigation)
- **Data Fetching & State**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Styling**: Vanilla React Native StyleSheet, Tokens chuẩn hóa (`colors`, `spacing`, `typography`, `radius`)
- **Native Modules**: `expo-secure-store`, `expo-file-system`, `expo-sharing`, `expo-image`
- **Ngôn ngữ**: TypeScript 5.3 (Strict mode)

---

## 🛠️ 2. Cài đặt & Khởi chạy

### Yêu cầu môi trường:
- Node.js >= 18.x
- npm hoặc yarn / pnpm
- Expo Go trên thiết bị di động (hoặc Android Studio / Xcode / Trình duyệt Web)

### Các bước thực hiện:

```bash
# 1. Di chuyển vào thư mục dự án mobile
cd lcit-meal-mobile

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi động môi trường phát triển Expo
npx expo start
```

### Các lệnh tắt hữu ích:
```bash
# Khởi chạy trên Android Emulator / Thiết bị Android
npm run android

# Khởi chạy trên iOS Simulator (macOS)
npm run ios

# Khởi chạy trên Trình duyệt Web (xem trước nhanh)
npm run web

# Kiểm tra cú pháp và quy tắc code (ESLint)
npm run lint

# Kiểm tra kiểu dữ liệu tĩnh (TypeScript)
npm run typecheck

# Test trực tiếp utility, API client, auth service và mock store
npm test

# Test service mobile với Express/MySQL trên schema riêng (Node.js >= 20)
# MySQL và database nguồn trong lcit-meal-api/.env phải sẵn sàng
npm run test:integration

# Giữ API QA chạy để test giao diện; nhập stop để dọn schema và dừng
node scripts/tests/mobile-api.cjs --serve
```

Các test service dùng storage trong bộ nhớ để thay thế module native; không
kiểm chứng SecureStore trên thiết bị. Entry point cũ `verify-phase5.js` chạy
cùng bộ test trực tiếp source. Xem `scripts/tests/UI-CHECKLIST.md` cho kiểm
tra giao diện web và checklist Android trước phát hành.

### Phân cơ sở trên giao diện

Danh sách trong ảnh được khai báo tại `src/utils/facilities.ts` và mặc định
thuộc cơ sở 1, gồm các cách ghi tài khoản đã đối chiếu. Tên chưa khớp nằm ở
“Chưa phân cơ sở”, không tự chuyển sang cơ sở 2. Admin vào Người dùng →
Phân cơ sở để chọn cơ sở 1, cơ sở 2 hoặc bỏ phân nhóm.

Thay đổi lưu trên thiết bị/trình duyệt hiện tại, tách theo API và chế độ demo;
không ghi lên API, không đồng bộ sang máy khác và không đổi nơi ăn theo ngày.
Xóa dữ liệu ứng dụng/trình duyệt sẽ mất các chỉnh sửa này.
Tổng quan tính số suất hôm nay theo các đăng ký confirmed/completed và tính
khách cùng cơ sở cán bộ đăng ký. Danh sách đăng ký/cắt suất và người dùng có
bộ lọc cơ sở, mặc định là cơ sở 1 và không có lựa chọn “Tất cả cơ sở”.
Biểu đồ và công nợ vẫn là toàn cơ quan. Nút xuất Excel được ẩn vì API chưa
hỗ trợ xuất theo cơ sở, tránh xuất sai phạm vi đang xem.
Tài khoản bếp vẫn xem tổng toàn cơ quan do API hiện tại không cấp quyền đọc
danh sách đăng ký cho vai trò bếp.

### Hạn cắt suất

Ứng dụng khóa cắt suất của ngày ăn từ 08:00 sáng theo giờ Việt Nam. Nút và
hộp xác nhận tự cập nhật khi đến giờ chốt; service kiểm tra lại trước khi gửi
yêu cầu để chặn cả hộp thoại mở từ trước 08:00. Cắt theo khoảng/dài hạn bắt
đầu từ ngày đã khóa cũng bị chặn; vẫn được chọn ngày tương lai.
Đây là kiểm tra phía ứng dụng, dùng đồng hồ thiết bị; API hiện tại không được
thay đổi nên quy tắc chưa được cưỡng chế với các ứng dụng khác hoặc lệnh gọi API trực tiếp.

---

## ⚙️ 3. Cấu hình Môi trường & Backend URL

Tạo file `.env` (hoặc `.env.local`) tại thư mục gốc `lcit-meal-mobile/`:

```env
# URL máy chủ Backend API thực tế
# Dành cho Android Emulator: http://10.0.2.2:3000/api
# Dành cho iOS Simulator / Web: http://localhost:3000/api
# Dành cho thiết bị thật trong cùng mạng LAN: http://192.168.x.x:3000/api
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Mặc định sử dụng chế độ Mock (true) hoặc kết nối API thật (false)
EXPO_PUBLIC_USE_MOCK=false

# Thời gian chờ phản hồi tối đa (milliseconds)
EXPO_PUBLIC_REQUEST_TIMEOUT_MS=15000
```

Màn hình tài khoản hiện không có mục đổi môi trường. Đổi các biến trên trong `.env`, rồi khởi động lại Expo. Tài khoản demo chỉ dùng trong chế độ mock hoặc schema QA; tài khoản API thật phụ thuộc dữ liệu máy chủ.

---

## 👥 4. Tài khoản Thử nghiệm (Môi trường Test/Demo)

Hệ thống hỗ trợ 4 vai trò người dùng chuẩn hóa. Mật khẩu mặc định cho tất cả tài khoản test là `123456`:

| Vai trò | Tên đăng nhập | Mật khẩu | Phạm vi quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** (Quản trị viên) | `admin` | `123456` | Toàn quyền: Quản lý lịch bếp, duyệt suất, thu tiền, quản lý người dùng, cấu hình hệ thống, xem nhật ký audit, kích hoạt tool admin. |
| **Manager** (Quản lý bếp) | `manager` | `123456` | Quản lý lịch bếp, đăng ký/hủy suất hộ cán bộ, duyệt yêu cầu cắt suất, quản lý thu tiền ăn, xem danh sách cán bộ. |
| **Employee** (Cán bộ nhân viên) | `user1` | `123456` | Xem lịch cá nhân, đăng ký suất/khách, gửi yêu cầu cắt suất trực tiếp hoặc theo khoảng ngày, xem khoản thanh toán & QR, đọc thông báo cá nhân. |
| **Kitchen** (Nhân viên bếp) | `kitchen` | `123456` | Xem số suất bếp cần chuẩn bị; không đăng ký/cắt suất hoặc truy cập nghiệp vụ quản trị. |

---

## 📱 5. Cấu trúc Thư mục Dự án

```
lcit-meal-mobile/
├── app/                              # Định tuyến file-based (Expo Router)
│   ├── (auth)/                       # Màn hình xác thực (Đăng nhập)
│   ├── (tabs)/                       # 5 Tab chính cho nhân viên
│   │   ├── index.tsx                 # Trang chủ (Suất ăn hôm nay, thao tác nhanh)
│   │   ├── schedule.tsx              # Lịch ăn trong tháng, chi tiết ngày
│   │   ├── payments.tsx              # Khoản thanh toán cá nhân & QR đóng tiền
│   │   ├── notifications.tsx         # Hộp thư thông báo cá nhân
│   │   └── account.tsx               # Hồ sơ và đăng xuất
│   ├── management/                   # Khu vực Quản trị & Quản lý (Role guarded)
│   │   ├── index.tsx                 # Dashboard & KPI tổng quan, hàng chờ duyệt
│   │   ├── meals.tsx                 # Quản lý lịch nấu & ngày nghỉ lễ
│   │   ├── registrations.tsx         # Danh sách đăng ký & duyệt yêu cầu cắt suất
│   │   ├── payments.tsx              # Quản lý thu tiền ăn & xác nhận đóng tiền
│   │   ├── users.tsx                 # Quản lý cán bộ & phân quyền vai trò
│   │   ├── notifications.tsx         # Soạn & phát thông báo cơ quan
│   │   ├── settings.tsx              # Cấu hình lịch thứ, giờ chốt, giá tiền, QR
│   │   ├── audit.tsx                 # Nhật ký hệ thống (Audit logs - Read-only)
│   │   └── admin-tools.tsx           # Công cụ kích hoạt tiến trình định kỳ
│   ├── meal/                         # Chi tiết ngày ăn & đăng ký khách
│   ├── meal-options/                 # Yêu cầu cắt suất theo khoảng
│   ├── profile/                      # Chỉnh sửa thông tin cá nhân & đổi mật khẩu
│   └── _layout.tsx                   # Root Stack layout & Theme Provider
├── src/
│   ├── components/                   # UI Components dùng chung (Button, Input, Card, Badge, Modal, States)
│   ├── config/                       # Cấu hình biến môi trường & constants
│   ├── hooks/                        # Custom Hooks kết nối TanStack React Query
│   ├── mocks/                        # Fixtures & Dữ liệu mẫu khởi tạo
│   ├── providers/                    # AuthProvider & QueryProvider
│   ├── services/                     # API Client, Mock Store & Business Services
│   ├── theme/                        # Design tokens (Colors, Spacing, Typography, Radius)
│   ├── types/                        # TypeScript DTOs & Entity Interfaces
│   └── utils/                        # Formatters ngày giờ, tiền tệ & Storage an toàn
└── scripts/
    └── verify-phase5.js              # Kịch bản kiểm thử tự động
```

---

## 🏗️ 6. Đóng gói & Build Ứng dụng

### 1. Build thử nghiệm với EAS Build (Khuyến nghị):
```bash
# Cài đặt EAS CLI toàn cục
npm install -g eas-cli

# Đăng nhập tài khoản Expo
eas login

# Cấu hình dự án EAS
eas build:configure

# Tạo bản Preview APK cho Android
eas build -p android --profile preview

# Tạo bản Preview Simulator/IPA cho iOS
eas build -p ios --profile preview
```

### 2. Tạo bản Build cục bộ (Local Build):
```bash
# Tạo thư mục android/ và ios/ gốc (Prebuild)
npx expo prebuild

# Chạy bản build debug cục bộ
npx expo run:android
npx expo run:ios
```

---

## 🛡️ 7. Ghi chú An toàn & Tính Toàn vẹn Dữ liệu

1. **Múi giờ Việt Nam (UTC+7)**: Toàn bộ ngày nghiệp vụ lưu trữ dưới dạng chuỗi ISO `YYYY-MM-DD`, không chuyển đổi qua lại UTC Timestamp để tránh hiện tượng lệch ngày ăn khi đổi múi giờ thiết bị.
2. **Xác thực & Bảo mật**: Token được lưu trong bộ nhớ an toàn (`expo-secure-store`). Khi nhận mã lỗi `401 Unauthorized`, hệ thống tự động dọn sạch cache phiên và điều hướng về trang đăng nhập.
3. **Role Guards**: Tuyệt đối không dựa hoàn toàn vào việc ẩn/hiện nút bấm trên giao diện; toàn bộ các màn hình Quản trị đều kiểm tra quyền hạn thực tế và backend luôn xác thực Bearer token trên từng yêu cầu.
