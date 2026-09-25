const pool = require("../config/database");
const HolidayEvent = require("../models/HolidayEvent");

const HOLIDAY_EVENT_SELECT_FIELDS = `
    he.id,
    he.name,
    he.reason,
    he.from_date,
    he.to_date,
    he.status,
    he.created_by,
    u.full_name AS created_by_name,
    he.created_at,
    he.restored_by,
    he.restored_at
`;

const HOLIDAY_EVENT_JOINS = `
    FROM holiday_event he
    LEFT JOIN user u ON u.id = he.created_by
`;

class HolidayEventRepository {
  async list() {
    const [rows] = await pool.query(`
      SELECT ${HOLIDAY_EVENT_SELECT_FIELDS}
      ${HOLIDAY_EVENT_JOINS}
      ORDER BY he.from_date DESC, he.id DESC
    `);

    return rows.map((row) => new HolidayEvent(row));
  }

  async get(id) {
    const [rows] = await pool.query(
      `
      SELECT ${HOLIDAY_EVENT_SELECT_FIELDS}
      ${HOLIDAY_EVENT_JOINS}
      WHERE he.id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return new HolidayEvent(rows[0]);
  }

  async create(data) {
    const [result] = await pool.query(
      `
        INSERT INTO holiday_event (name, reason, from_date, to_date, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        data.name,
        data.reason || null,
        data.fromDate,
        data.toDate,
        data.status || "active",
        data.createdBy || null,
      ],
    );

    return this.get(result.insertId);
  }

  async setStatus(id, status, actorId) {
    await pool.query(
      `
        UPDATE holiday_event
        SET status = ?, restored_by = ?, restored_at = NOW()
        WHERE id = ?
      `,
      [status, actorId || null, id],
    );

    return this.get(id);
  }
}

module.exports = HolidayEventRepository;
