const pool = require("../config/database");
const Payment = require("../models/Payment");

const PAYMENT_SELECT_FIELDS = `
    p.id,
    p.user_id,
    u.full_name AS user_full_name,
    p.payment_date,
    p.amount,
    p.is_paid,
    p.paid_at,
    p.paid_amount,
    p.bill_img,
    p.status
`;

const PAYMENT_JOIN_USER = `
    FROM payment p
    LEFT JOIN user u ON u.id = p.user_id
`;

class PaymentRepository {
  async list() {
    const [rows] = await pool.query(`
      SELECT ${PAYMENT_SELECT_FIELDS}
      ${PAYMENT_JOIN_USER}
      ORDER BY p.payment_date DESC
    `);

    return rows.map((row) => new Payment(row));
  }

  async get(id) {
    const [rows] = await pool.query(
      `
      SELECT ${PAYMENT_SELECT_FIELDS}
      ${PAYMENT_JOIN_USER}
      WHERE p.id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return new Payment(rows[0]);
  }

  // Lịch sử thanh toán của riêng 1 nhân viên (API "của tôi")
  async listByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT ${PAYMENT_SELECT_FIELDS}
      ${PAYMENT_JOIN_USER}
      WHERE p.user_id = ?
      ORDER BY p.payment_date DESC
    `,
      [userId],
    );

    return rows.map((row) => new Payment(row));
  }

  async listUnpaid() {
    const [rows] = await pool.query(`
      SELECT ${PAYMENT_SELECT_FIELDS}
      ${PAYMENT_JOIN_USER}
      WHERE p.status IN ('unpaid', 'overdue') AND u.status = '1'
      ORDER BY p.user_id, p.payment_date DESC
    `);
    return rows.map((row) => new Payment(row));
  }

  async markOverdue(id) {
    await pool.query(
      `UPDATE payment SET status = 'overdue' WHERE id = ? AND status = 'unpaid'`,
      [id],
    );
  }

  async filter(userId, status, fromDate, toDate) {
    let sql = `
      SELECT ${PAYMENT_SELECT_FIELDS}
      ${PAYMENT_JOIN_USER}
      WHERE 1 = 1
    `;

    const params = [];

    if (userId) {
      sql += ` AND p.user_id = ? `;
      params.push(userId);
    }

    if (status) {
      sql += ` AND p.status = ? `;
      params.push(status);
    }

    if (fromDate) {
      sql += ` AND p.payment_date >= ? `;
      params.push(fromDate);
    }

    if (toDate) {
      sql += ` AND p.payment_date <= ? `;
      params.push(toDate);
    }

    sql += ` ORDER BY p.payment_date DESC `;

    const [rows] = await pool.query(sql, params);

    return rows.map((row) => new Payment(row));
  }

  async create(data) {
    const [result] = await pool.query(
      `
            INSERT INTO payment (user_id, payment_date, amount, is_paid, status)
            VALUES (?, ?, ?, 0, ?)
        `,
      [data.userId, data.paymentDate, data.amount, data.status],
    );

    return this.get(result.insertId);
  }

  async update(id, data) {
    await pool.query(
      `
            UPDATE payment
            SET
                payment_date = ?,
                amount = ?,
                status = ?
            WHERE id = ?
        `,
      [data.paymentDate, data.amount, data.status, id],
    );

    return this.get(id);
  }

  // Xác nhận đã thanh toán (kèm số tiền thực trả + ảnh hóa đơn)
  async markPaid(id, data) {
    await pool.query(
      `
            UPDATE payment
            SET
                is_paid = 1,
                paid_at = NOW(),
                paid_amount = ?,
                bill_img = COALESCE(?, bill_img),
                status = ?
            WHERE id = ?
        `,
      [data.paidAmount, data.billImg || null, data.status, id],
    );

    return this.get(id);
  }

  async delete(id) {
    const [result] = await pool.query(
      `
            DELETE FROM payment
            WHERE id = ?
        `,
      [id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = PaymentRepository;
