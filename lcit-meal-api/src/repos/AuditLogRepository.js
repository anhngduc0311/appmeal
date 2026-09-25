const pool = require("../config/database");
const AuditLog = require("../models/AuditLog");

class AuditLogRepository {
  async list() {
    const [rows] = await pool.query(`
            SELECT
                al.id,
                al.log_actor,
                u.full_name AS actor_name,
                al.log_action,
                al.log_target,
                al.log_result,
                al.log_detail,
                al.log_time,
                al.ip_address,
                al.user_agent,
                al.status,
                al.old_data,
                al.new_data
            FROM audit_log al
            LEFT JOIN user u
                ON u.id = al.log_actor
            ORDER BY al.id DESC
        `);
    return rows.map((row) => new AuditLog(row));
  }

  async get(id) {
    const [rows] = await pool.query(
      `
            SELECT
                al.id,
                al.log_actor,
                u.full_name AS actor_name,
                al.log_action,
                al.log_target,
                al.log_result,
                al.log_detail,
                al.log_time,
                al.ip_address,
                al.user_agent,
                al.status,
                al.old_data,
                al.new_data
            FROM audit_log al
            LEFT JOIN user u
                ON u.id = al.log_actor
            WHERE al.id = ?
            LIMIT 1
        `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return new AuditLog(rows[0]);
  }

  async filter(query, actor, action, target, result, status) {
    let sql = `
            SELECT
                al.id,
                al.log_actor,
                u.full_name AS actor_name,
                al.log_action,
                al.log_target,
                al.log_result,
                al.log_detail,
                al.log_time,
                al.ip_address,
                al.user_agent,
                al.status,
                al.old_data,
                al.new_data
            FROM audit_log al
            LEFT JOIN user u
                ON u.id = al.log_actor
            WHERE 1 = 1
        `;
    const params = [];
    // Tìm theo tên người thực hiện
    // hoặc nội dung log
    if (query) {
      sql += `
                AND (
                    u.full_name LIKE ?
                    OR al.log_detail LIKE ?
                )
            `;
      const keyword = `%${query}%`;
      params.push(keyword, keyword);
    }
    // ID người thực hiện
    if (actor !== undefined && actor !== null && actor !== "") {
      sql += `
                AND al.log_actor = ?
            `;
      params.push(actor);
    }
    // Action
    if (action) {
      sql += `
                AND al.log_action = ?
            `;
      params.push(action);
    }
    // Target
    if (target) {
      sql += `
                AND al.log_target = ?
            `;
      params.push(target);
    }
    // Result
    if (result) {
      sql += `
                AND al.log_result = ?
            `;
      params.push(result);
    }
    // Status
    if (status !== undefined && status !== null && status !== "") {
      sql += `
                AND al.status = ?
            `;
      params.push(status);
    }
    sql += `
            ORDER BY al.id DESC
        `;
    const [rows] = await pool.query(sql, params);
    return rows.map((row) => new AuditLog(row));
  }

  async create(data) {
    const [result] = await pool.query(
      `
            INSERT INTO audit_log (
                log_actor,
                log_action,
                log_target,
                log_result,
                log_detail,
                log_time,
                ip_address,
                user_agent,
                status,
                old_data,
                new_data
            )
            VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)
        `,
      [
        data.logActor,
        data.logAction,
        data.logTarget,
        data.logResult,
        data.logDetail,
        data.ipAddress,
        data.userAgent,
        data.status,
        data.oldData,
        data.newData,
      ],
    );

    return this.get(result.insertId);
  }
}

module.exports = AuditLogRepository;
