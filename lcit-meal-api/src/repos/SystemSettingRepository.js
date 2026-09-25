const pool = require("../config/database");
const SystemSetting = require("../models/SystemSetting");

const DEFAULT_SETTINGS = [
  [
    "auto_register_start_day",
    "1",
    "Ngày bắt đầu tự động đăng ký",
    "integer",
    "Ngày trong tháng bắt đầu tạo lịch và đăng ký suất ăn cho cả tháng.",
  ],
  [
    "payment_due_day",
    "10",
    "Ngày đến hạn thanh toán",
    "integer",
    "Ngày trong tháng bắt đầu nhắc thanh toán.",
  ],
  [
    "payment_reminder_enabled",
    "1",
    "Nhắc thanh toán",
    "boolean",
    "Gửi thông báo khi đến hạn và nhắc hằng ngày.",
  ],
  [
    "payment_qr_image",
    "",
    "QR thanh toán",
    "string",
    "Đường dẫn ảnh QR thanh toán.",
  ],
  [
    "meal_completion_time",
    "12:00",
    "Giờ cập nhật hoàn thành suất ăn",
    "string",
    "Giờ (HH:mm) hệ thống tự động chuyển các suất ăn đã đăng ký (confirmed) đã qua bữa sang trạng thái đã hoàn thành (completed).",
  ],
];

const SETTING_SELECT_FIELDS = `
    id,
    setting_key,
    setting_value,
    display_name,
    data_type,
    description,
    updated_at,
    updated_by
`;

class SystemSettingRepository {
  async ensureDefaults() {
    await pool.query(
      `INSERT IGNORE INTO system_setting
       (setting_key, setting_value, display_name, data_type, description)
       VALUES ?`,
      [DEFAULT_SETTINGS],
    );
  }

  async list() {
    await this.ensureDefaults();
    const [rows] = await pool.query(`
      SELECT ${SETTING_SELECT_FIELDS}
      FROM system_setting
      ORDER BY id ASC
    `);

    return rows.map((row) => new SystemSetting(row));
  }

  async get(id) {
    const [rows] = await pool.query(
      `
      SELECT ${SETTING_SELECT_FIELDS}
      FROM system_setting
      WHERE id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return new SystemSetting(rows[0]);
  }

  async getByKey(key) {
    await this.ensureDefaults();
    const [rows] = await pool.query(
      `
      SELECT ${SETTING_SELECT_FIELDS}
      FROM system_setting
      WHERE setting_key = ?
      LIMIT 1
    `,
      [key],
    );

    if (rows.length === 0) {
      return null;
    }

    return new SystemSetting(rows[0]);
  }

  async create(data) {
    const [result] = await pool.query(
      `
            INSERT INTO system_setting (
                setting_key, setting_value, display_name, data_type, description, updated_by
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [
        data.settingKey,
        data.settingValue,
        data.displayName || null,
        data.dataType,
        data.description || null,
        data.updatedBy || null,
      ],
    );

    return this.get(result.insertId);
  }

  async updateByKey(key, data) {
    const [result] = await pool.query(
      `
            UPDATE system_setting
            SET
                setting_value = ?,
                display_name = COALESCE(?, display_name),
                description = COALESCE(?, description),
                updated_at = NOW(),
                updated_by = ?
            WHERE setting_key = ?
        `,
      [
        data.settingValue,
        data.displayName || null,
        data.description || null,
        data.updatedBy || null,
        key,
      ],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.getByKey(key);
  }
}

module.exports = SystemSettingRepository;
