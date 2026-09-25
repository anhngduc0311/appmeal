const cron = require("node-cron");

const MealRegistrationRepository = require("../repos/MealRegistrationRepository");
const SystemSettingRepository = require("../repos/SystemSettingRepository");
const { SETTING_KEY } = require("../constants/SystemSetting");

const CRON_TIMEZONE = "Asia/Ho_Chi_Minh";
const DEFAULT_COMPLETION_TIME = "12:00";

// node-cron v4 dùng cơ chế "heartbeat" (setTimeout) và mặc định chỉ cho
// phép lệch tối đa 1000ms (`missedExecutionTolerance`) trước khi coi 1 lượt
// là "missed execution" và ghi WARN ra log - dù job thực chất KHÔNG bị mất
// dữ liệu gì (chỉ là tick bị trễ do event loop bận 1 chút, ví dụ đang xử lý
// song song vài request/query). Job này không cần chính xác tới từng giây
// (chênh lệch vài phút so với giờ cấu hình là chấp nhận được), nên thay vì
// polling mỗi phút (dễ dính WARN khi hệ thống đang bận), ta polling mỗi 5
// phút + nới rộng ngưỡng dung sai. Xem thêm giải thích ở start() bên dưới.
const POLL_CRON_PATTERN = "*/5 * * * *";
const MISSED_EXECUTION_TOLERANCE_MS = 30000; // 30s - đủ rộng để hấp thụ jitter bình thường

const mealRegistrationRepository = new MealRegistrationRepository();
const systemSettingRepository = new SystemSettingRepository();

const getVietnamDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: CRON_TIMEZONE,
  }).format(new Date());

const getVietnamTimeHHmm = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: CRON_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

// Đọc giờ chạy job từ system_setting (`meal_completion_time`, dạng
// "HH:mm") - QTV có thể đổi giờ này trong trang Quản lý cấu hình mà KHÔNG
// cần deploy lại/khởi động lại server, vì job tự đọc lại setting ở mỗi lượt
// kiểm tra (xem start() bên dưới) thay vì đăng ký cứng 1 giờ cố định như
// trước đây.
async function getCompletionTime() {
  const setting = await systemSettingRepository
    .getByKey(SETTING_KEY.MEAL_COMPLETION_TIME)
    .catch(() => null);

  const value = setting?.settingValue || setting?.setting_value;

  return /^\d{2}:\d{2}$/.test(value || "") ? value : DEFAULT_COMPLETION_TIME;
}

/**
 * Đánh dấu toàn bộ đăng ký đang "confirmed" của 1 ngày là "completed" - tức
 * suất ăn đó đã THỰC SỰ diễn ra (qua giờ ăn), không còn là "đăng ký"
 * đơn thuần nữa.
 *
 * Các thống kê/biểu đồ trên trang chủ (xem DashboardRepository) chỉ đếm
 * suất ăn "completed" - nên ngày nào CHƯA tới giờ job này chạy (vd hôm nay
 * trước giờ cấu hình, hoặc các ngày trong tương lai) thì số liệu vẫn hiển
 * thị 0, đúng yêu cầu "chưa diễn ra thì chưa tính".
 *
 * Idempotent: chỉ update các bản ghi còn "confirmed" nên gọi lại nhiều lần
 * trong ngày không gây sai lệch dữ liệu - an toàn để chạy "catch-up" khi
 * server khởi động muộn, hoặc gọi thủ công qua route admin-tools để test.
 *
 * @param {string=} targetDate - "YYYY-MM-DD", mặc định = hôm nay (giờ VN)
 */
async function runMealCompletion(targetDate) {
  const date = targetDate || getVietnamDate();
  const affected = await mealRegistrationRepository.completeConfirmedByDate(
    date,
  );

  console.log(
    `[mealCompletion] Ngày ${date}: đã hoàn thành ${affected} suất ăn (confirmed -> completed).`,
  );
  return { date, affected };
}

// Job chạy theo giờ cấu hình trong system_setting (`meal_completion_time`,
// mặc định 12:00) - thời điểm bữa ăn coi như đã diễn ra.
//
// Vì giờ chạy có thể được QTV đổi bất kỳ lúc nào qua trang Quản lý cấu
// hình, job KHÔNG đăng ký cứng 1 lịch cron cố định (khác autoScheduleJob).
// Thay vào đó, cron polling mỗi 5 phút (POLL_CRON_PATTERN), so sánh giờ
// hiện tại (giờ VN, dạng "HH:mm") với giá trị cấu hình - hiện tại đã QUA
// giờ cấu hình VÀ hôm nay CHƯA chạy lần nào (theo dõi bằng `lastRunDate`
// trong bộ nhớ) thì mới thực thi. Cách này:
//   - Tránh polling mỗi phút (nguyên nhân gây WARN "missed execution" khi
//     event loop bận đúng lúc tick rơi vào) mà vẫn đảm bảo job chạy trong
//     vòng tối đa 5 phút sau giờ cấu hình - đủ chính xác cho nghiệp vụ này.
//   - Không cần khớp CHÍNH XÁC "HH:mm" (khác cách làm cũ) nên vẫn hoạt động
//     đúng dù QTV đặt giờ cấu hình không tròn 5 phút (vd "12:03").
function start() {
  let lastRunDate = null;

  const run = (source, date) => {
    lastRunDate = date;
    console.log(`[mealCompletion] Bắt đầu chạy (${source}).`);
    return runMealCompletion(date).catch((error) => {
      console.error("[mealCompletion] Lỗi khi chạy job:", error);
    });
  };

  cron.schedule(
    POLL_CRON_PATTERN,
    async () => {
      const today = getVietnamDate();
      if (lastRunDate === today) return; // hôm nay đã chạy rồi, bỏ qua

      const completionTime = await getCompletionTime();
      if (getVietnamTimeHHmm() >= completionTime) {
        await run(`polling, qua giờ ${completionTime}`, today);
      }
    },
    {
      timezone: CRON_TIMEZONE,
      noOverlap: true,
      missedExecutionTolerance: MISSED_EXECUTION_TOLERANCE_MS,
      // Job không cần chính xác tới giây nên tự bỏ qua cảnh báo "missed
      // execution" của node-cron nếu vẫn thỉnh thoảng xảy ra do jitter -
      // không ảnh hưởng tới tính đúng đắn (xem giải thích ở trên).
      suppressMissedWarning: true,
    },
  );

  // Catch-up: nếu server khởi động (hoặc bị deploy lại) sau giờ cấu hình mà
  // job của hôm nay có thể chưa kịp chạy, chạy bù ngay khi start() thay vì
  // đợi tick polling tiếp theo (tối đa 5 phút) - an toàn vì idempotent (xem
  // giải thích ở completeConfirmedByDate()).
  void getCompletionTime().then((completionTime) => {
    const today = getVietnamDate();
    if (getVietnamTimeHHmm() >= completionTime) {
      void run("catch-up sau khi khởi động muộn", today);
    }

    console.log(
      `[mealCompletion] Đã đăng ký kiểm tra mỗi 5 phút, chạy khi qua giờ ${completionTime} (${CRON_TIMEZONE}), có thể đổi tại Quản lý cấu hình > "Giờ cập nhật hoàn thành suất ăn".`,
    );
  });
}

module.exports = { start, runMealCompletion };
