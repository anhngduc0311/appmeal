const cron = require("node-cron");

const PaymentRepository = require("../repos/PaymentRepository");
const NotificationRepository = require("../repos/NotificationRepository");
const SystemSettingRepository = require("../repos/SystemSettingRepository");
const UserRepository = require("../repos/UserRepository");
const NotificationService = require("../services/NotificationService");

const paymentRepository = new PaymentRepository();
const notificationRepository = new NotificationRepository();
const systemSettingRepository = new SystemSettingRepository();
const userRepository = new UserRepository();
const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
);

const TIMEZONE = "Asia/Ho_Chi_Minh";

const getVietnamDateParts = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
};

async function runPaymentReminder() {
  const enabled = await systemSettingRepository.getByKey(
    "payment_reminder_enabled",
  );
  if (!enabled || enabled.typedValue !== true) return { skipped: true };

  const dueDay = Number(
    (await systemSettingRepository.getByKey("payment_due_day"))?.typedValue ||
      10,
  );
  const { day } = getVietnamDateParts();
  if (Number(day) < dueDay) return { skipped: true, reason: "before_due_day" };

  const payments = await paymentRepository.listUnpaid();
  const latestByUser = new Map();
  for (const payment of payments) {
    if (!latestByUser.has(payment.userId))
      latestByUser.set(payment.userId, payment);
  }

  let sent = 0;
  for (const payment of latestByUser.values()) {
    if (payment.status === "unpaid")
      await paymentRepository.markOverdue(payment.id);
    if (
      await notificationRepository.hasPaymentReminderToday(
        payment.userId,
        payment.id,
      )
    )
      continue;

    await notificationService.notifyUser(
      {
        title: "Nhắc thanh toán tiền ăn",
        content: `Bạn còn khoản thanh toán ${Number(payment.amount).toLocaleString("vi-VN")}đ chưa thanh toán. Vui lòng hoàn tất thanh toán.`,
        url: `/payment/view?id=${payment.id}`,
        createdBy: null,
      },
      payment.userId,
    );
    sent += 1;
  }

  console.log(`[paymentReminder] Đã gửi ${sent} thông báo nhắc thanh toán.`);
  return { sent };
}

function start() {
  cron.schedule(
    "0 9 * * *",
    () => {
      runPaymentReminder().catch((error) =>
        console.error("[paymentReminder] Lỗi:", error),
      );
    },
    { timezone: TIMEZONE, noOverlap: true, missedExecutionTolerance: 30000, suppressMissedWarning: true },
  );
  console.log(`[paymentReminder] Đã đăng ký lịch nhắc 09:00 (${TIMEZONE}).`);
}

module.exports = { start, runPaymentReminder };
