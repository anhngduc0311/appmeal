const pool = require("../config/database");
const HolidayEvent = require("../models/HolidayEvent");
const AppError = require('../ultis/AppError');

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

  async get(id, db = pool) {
    const [rows] = await db.query(
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

  async create(data, db = pool) {
    const [result] = await db.query(
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

    return this.get(result.insertId, db);
  }

  async transaction(work) {
    const db = await pool.getConnection();
    try {
      await db.beginTransaction();
      const result = await work(db);
      await db.commit();
      return result;
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
    }
  }

  async createWithCancellation(data, dates) {
    return this.transaction(async db => {
      const event = await this.create(data, db);
      let cancelledMealCount = 0;
      let cancelledRegistrationCount = 0;
      for (const date of dates) {
        await db.query(`INSERT INTO meal (meal_date, note, status)
          VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE id=id`, [date, `Nghỉ lịch: ${event.name}`]);
        const [[meal]] = await db.query('SELECT id, is_cancelled FROM meal WHERE meal_date=? FOR UPDATE', [date]);
        if (!meal.is_cancelled) {
          await db.query('INSERT INTO holiday_event_meal (event_id,meal_id) VALUES (?,?)', [event.id,meal.id]);
          await db.query('UPDATE meal SET is_cancelled=1, cancelled_by=? WHERE id=?', [data.createdBy,meal.id]);
          cancelledMealCount++;
        }
        const [registrations] = await db.query(`SELECT id,status FROM meal_registration
          WHERE meal_id=? AND status IN ('confirmed','pending') FOR UPDATE`, [meal.id]);
        for (const r of registrations) {
          await db.query(`INSERT INTO holiday_event_registration (event_id,registration_id,previous_status)
            VALUES (?,?,?)`, [event.id,r.id,r.status]);
          await db.query("UPDATE meal_registration SET status='cancelled' WHERE id=?", [r.id]);
          cancelledRegistrationCount++;
        }
      }
      return { event, cancelledMealCount, cancelledRegistrationCount };
    });
  }

  async restoreWithRegistrations(id, actorId) {
    return this.transaction(async db => {
      const [[row]] = await db.query('SELECT * FROM holiday_event WHERE id=? FOR UPDATE', [id]);
      if (!row) throw new AppError('Sự kiện hủy lịch không tồn tại',404);
      if (row.status !== 'active') throw new AppError('Sự kiện này đã được mở lại trước đó',409);
      await db.query("UPDATE holiday_event SET status='inactive', restored_by=?, restored_at=NOW() WHERE id=?", [actorId,id]);
      // Include deferred snapshots from previously restored overlapping events.
      // Do not reopen a date still covered by another active holiday.
      const [meals] = await db.query(`SELECT m.id FROM meal m
        WHERE m.meal_date BETWEEN ? AND ?
          AND EXISTS (SELECT 1 FROM holiday_event_meal hm JOIN holiday_event h ON h.id=hm.event_id
            WHERE hm.meal_id=m.id AND h.status='inactive')
          AND NOT EXISTS (SELECT 1 FROM holiday_event h WHERE h.status='active'
            AND m.meal_date BETWEEN h.from_date AND h.to_date)
        ORDER BY m.meal_date FOR UPDATE`, [row.from_date,row.to_date]);
      const restoredRegistrations = [];
      for (const meal of meals) {
        await db.query('UPDATE meal SET is_cancelled=0, cancelled_by=NULL WHERE id=?', [meal.id]);
        const [registrations] = await db.query(`SELECT DISTINCT mr.id, mr.user_id, hr.previous_status
          FROM meal_registration mr
          JOIN holiday_event_registration hr ON hr.registration_id=mr.id
          JOIN holiday_event h ON h.id=hr.event_id
          JOIN meal m ON m.id=mr.meal_id
          WHERE mr.meal_id=? AND mr.status='cancelled' AND h.status='inactive'
            AND NOT EXISTS (SELECT 1 FROM meal_option mo WHERE mo.user_id=mr.user_id
              AND mo.status='approved' AND m.meal_date BETWEEN mo.from_date AND mo.to_date)
          FOR UPDATE`, [meal.id]);
        for (const r of registrations) {
          await db.query('UPDATE meal_registration SET status=? WHERE id=?', [r.previous_status,r.id]);
          restoredRegistrations.push({id:r.id,userId:r.user_id});
        }
        // Consume snapshots so a later voluntary cancellation cannot be undone.
        await db.query(`DELETE hr FROM holiday_event_registration hr
          JOIN holiday_event h ON h.id=hr.event_id JOIN meal_registration mr ON mr.id=hr.registration_id
          WHERE h.status='inactive' AND mr.meal_id=?`, [meal.id]);
        await db.query(`DELETE hm FROM holiday_event_meal hm JOIN holiday_event h ON h.id=hm.event_id
          WHERE h.status='inactive' AND hm.meal_id=?`, [meal.id]);
      }
      return { restored: await this.get(id,db), restoredMealCount: meals.length, restoredRegistrations };
    });
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
