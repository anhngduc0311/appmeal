const pool = require("../config/database");
const MealScheduleConfig = require("../models/MealScheduleConfig");

// Mặc định: Thứ 2 - Thứ 6 có ăn, Thứ 7 & Chủ Nhật không ăn - khớp với dữ
// liệu mặc định trong migration của qlsa_clean.sql.
const DEFAULT_DAYS = [
  [0, 0, "Chủ nhật - không có suất ăn"],
  [1, 1, "Thứ 2"],
  [2, 1, "Thứ 3"],
  [3, 1, "Thứ 4"],
  [4, 1, "Thứ 5"],
  [5, 1, "Thứ 6"],
  [6, 0, "Thứ 7 - không có suất ăn"],
];

const SELECT_FIELDS = `
    msc.id,
    msc.day_of_week,
    msc.is_enabled,
    msc.notes,
    msc.updated_by,
    u.full_name AS updated_by_name,
    msc.updated_at,
    msc.created_at
`;

const JOINS = `
    FROM meal_schedule_config msc
    LEFT JOIN user u ON u.id = msc.updated_by
`;

let defaultsEnsured = false;
let defaultsPromise = null;

class MealScheduleConfigRepository {
  // Đảm bảo luôn có đủ 7 dòng (0-6) - tự "vá" dữ liệu nếu vì lý do gì đó
  // migration ban đầu (qlsa_clean.sql) chưa tạo đủ, tương tự cách
  // SystemSettingRepository.ensureDefaults() tự vá các setting mặc định.
  // Không ghi đè is_enabled/notes của những ngày đã tồn tại.
  async ensureDefaults() {
    if (defaultsEnsured) {
      return;
    }
    if (defaultsPromise) {
      return defaultsPromise;
    }

    defaultsPromise = (async () => {
      try {
        await pool.query(
          `INSERT IGNORE INTO meal_schedule_config
           (day_of_week, is_enabled, notes)
           VALUES ?`,
          [DEFAULT_DAYS],
        );
        defaultsEnsured = true;
      } catch (err) {
        if (err.code === "ER_LOCK_DEADLOCK") {
          await new Promise((resolve) =>
            setTimeout(resolve, 50 + Math.random() * 100),
          );
          await pool.query(
            `INSERT IGNORE INTO meal_schedule_config
             (day_of_week, is_enabled, notes)
             VALUES ?`,
            [DEFAULT_DAYS],
          );
          defaultsEnsured = true;
        } else {
          throw err;
        }
      } finally {
        defaultsPromise = null;
      }
    })();

    return defaultsPromise;
  }

  async list() {
    await this.ensureDefaults();
    const [rows] = await pool.query(`
      SELECT ${SELECT_FIELDS}
      ${JOINS}
      ORDER BY msc.day_of_week ASC
    `);

    return rows.map((row) => new MealScheduleConfig(row));
  }

  // Danh sách day_of_week (0-6) đang được bật ăn - dùng bởi autoScheduleJob.
  async getEnabledDays() {
    await this.ensureDefaults();
    const [rows] = await pool.query(
      `SELECT day_of_week FROM meal_schedule_config WHERE is_enabled = 1`,
    );

    return rows.map((row) => row.day_of_week);
  }

  async upsert(dayOfWeek, isEnabled, notes, updatedBy) {
    await pool.query(
      `
        INSERT INTO meal_schedule_config (day_of_week, is_enabled, notes, updated_by)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_enabled = VALUES(is_enabled),
          notes = VALUES(notes),
          updated_by = VALUES(updated_by)
      `,
      [dayOfWeek, isEnabled ? 1 : 0, notes || null, updatedBy || null],
    );
  }

  // Cờ toàn cục "job tự động tạo lịch/đăng ký ăn có áp dụng cấu hình ngày
  // ăn trong tuần hay không" (1 = có áp dụng - mặc định; 0 = tạo cho TẤT
  // CẢ các ngày, kể cả Thứ 7/Chủ Nhật, như hành vi cũ trước khi có tính
  // năng này). Lưu ở cột `system_setting`.`auto_schedule_use_meal_config`
  // (thêm bởi migration trong qlsa_clean.sql) - đây là 1 cờ DUY NHẤT cho
  // toàn hệ thống, không gắn với 1 setting_key/row cụ thể, nên đọc/ghi
  // đồng loạt trên mọi dòng của bảng `system_setting`.
  async getUseMealConfig() {
    const [rows] = await pool.query(
      `SELECT auto_schedule_use_meal_config FROM system_setting LIMIT 1`,
    );

    if (rows.length === 0) return true;

    return !!rows[0].auto_schedule_use_meal_config;
  }

  async setUseMealConfig(value) {
    await pool.query(
      `UPDATE system_setting SET auto_schedule_use_meal_config = ?`,
      [value ? 1 : 0],
    );
  }
}

module.exports = MealScheduleConfigRepository;
