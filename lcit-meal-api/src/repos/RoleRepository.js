const pool = require("../config/database");
const Role = require("../models/Role");

const ROLE_SELECT_FIELDS = `
    id,
    display_name,
    code,
    description,
    status,
    created_at,
    created_by,
    updated_at,
    updated_by
`;

class RoleRepository {
  async list() {
    const [rows] = await pool.query(`
      SELECT ${ROLE_SELECT_FIELDS}
      FROM role
      ORDER BY id ASC
    `);

    return rows.map((row) => new Role(row));
  }

  async get(id) {
    const [rows] = await pool.query(
      `
      SELECT ${ROLE_SELECT_FIELDS}
      FROM role
      WHERE id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return new Role(rows[0]);
  }

  async getByCode(code) {
    const [rows] = await pool.query(
      `
      SELECT ${ROLE_SELECT_FIELDS}
      FROM role
      WHERE code = ?
      LIMIT 1
    `,
      [code],
    );

    if (rows.length === 0) {
      return null;
    }

    return new Role(rows[0]);
  }
}

module.exports = RoleRepository;
