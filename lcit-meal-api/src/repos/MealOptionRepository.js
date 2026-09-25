const pool = require("../config/database");
const MealOption = require("../models/MealOption");

const MEAL_OPTION_SELECT_FIELDS = `
    mo.id,
    mo.user_id,
    u.full_name AS user_full_name,
    mo.type,
    DATE_FORMAT(mo.from_date, '%Y-%m-%d') AS from_date,
    DATE_FORMAT(mo.to_date, '%Y-%m-%d') AS to_date,
    mo.note,
    mo.status,
    mo.created_at,
    mo.created_by,
    mo.updated_at,
    mo.updated_by,
    mo.approved_at,
    mo.approved_by
`;

const MEAL_OPTION_JOIN_USER = `
    FROM meal_option mo
    LEFT JOIN user u ON u.id = mo.user_id
`;

class MealOptionRepository {
  async list() {
    const [rows] = await pool.query(`
      SELECT ${MEAL_OPTION_SELECT_FIELDS}
      ${MEAL_OPTION_JOIN_USER}
      ORDER BY mo.id DESC
    `);

    return rows.map((row) => new MealOption(row));
  }

  async get(id) {
    const [rows] = await pool.query(
      `
      SELECT ${MEAL_OPTION_SELECT_FIELDS}
      ${MEAL_OPTION_JOIN_USER}
      WHERE mo.id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return new MealOption(rows[0]);
  }

  // Danh sách yêu cầu hủy ăn của riêng 1 nhân viên (dùng cho API "của tôi")
  async listByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT ${MEAL_OPTION_SELECT_FIELDS}
      ${MEAL_OPTION_JOIN_USER}
      WHERE mo.user_id = ?
      ORDER BY mo.id DESC
    `,
      [userId],
    );

    return rows.map((row) => new MealOption(row));
  }

  async filter(userId, type, status) {
    let sql = `
      SELECT ${MEAL_OPTION_SELECT_FIELDS}
      ${MEAL_OPTION_JOIN_USER}
      WHERE 1 = 1
    `;

    const params = [];

    if (userId) {
      sql += ` AND mo.user_id = ? `;
      params.push(userId);
    }

    if (type) {
      sql += ` AND mo.type = ? `;
      params.push(type);
    }

    if (status) {
      sql += ` AND mo.status = ? `;
      params.push(status);
    }

    sql += ` ORDER BY mo.id DESC `;

    const [rows] = await pool.query(sql, params);

    return rows.map((row) => new MealOption(row));
  }

  async create(data) {
    const [result] = await pool.query(
      `
            INSERT INTO meal_option (
                user_id, type, from_date, to_date, note, status,
                created_at, created_by, approved_at, approved_by
            )
            VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
        `,
      [
        data.userId,
        data.type,
        data.fromDate,
        data.toDate,
        data.note || null,
        data.status || "pending",
        data.createdBy,
        data.approvedAt || null,
        data.approvedBy || null,
      ],
    );

    return this.get(result.insertId);
  }

  async update(id, data) {
    await pool.query(
      `
            UPDATE meal_option
            SET
                type = ?,
                from_date = ?,
                to_date = ?,
                note = ?,
                updated_at = NOW(),
                updated_by = ?
            WHERE id = ?
        `,
      [data.type, data.fromDate, data.toDate, data.note, data.updatedBy, id],
    );

    return this.get(id);
  }

  // Duyệt / từ chối yêu cầu
  async setDecision(id, status, approvedBy, note) {
    await pool.query(
      `
            UPDATE meal_option
            SET
                status = ?,
                approved_at = NOW(),
                approved_by = ?,
                note = COALESCE(?, note),
                updated_at = NOW(),
                updated_by = ?
            WHERE id = ?
        `,
      [status, approvedBy, note || null, approvedBy, id],
    );

    return this.get(id);
  }

  // "Xác nhận đăng ký ăn lại" - kết thúc SỚM 1 yêu cầu cắt suất đã duyệt
  // (cancel_permanent/cancel_schedule) bằng cách rút ngắn `to_date` lại
  // (thường là hôm qua so với ngày hiệu lực đăng ký lại), để từ ngày hiệu
  // lực trở đi user không còn bị coi là "đã cắt suất" nữa - xem
  // services/MealOptionService.js#reactivate().
  async closeEarly(id, newToDate, updatedBy) {
    await pool.query(
      `
            UPDATE meal_option
            SET
                to_date = ?,
                updated_at = NOW(),
                updated_by = ?
            WHERE id = ?
        `,
      [newToDate, updatedBy, id],
    );

    return this.get(id);
  }

  async delete(id) {
    const [result] = await pool.query(
      `
            DELETE FROM meal_option
            WHERE id = ?
        `,
      [id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = MealOptionRepository;
